#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'magazine-api-'));
const dbFile = path.join(tmpDir, 'magazine.db');
const port = 5107;

function request(method, urlPath, { body, headers } = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port,
                path: encodeURI(urlPath),
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(headers || {})
                }
            },
            (res) => {
                let raw = '';
                res.on('data', (chunk) => { raw += chunk; });
                res.on('end', () => {
                    let data = raw;
                    try { data = raw ? JSON.parse(raw) : null; } catch (_) { /* keep */ }
                    resolve({ status: res.statusCode, data });
                });
            }
        );
        req.on('error', reject);
        if (body !== undefined) req.write(JSON.stringify(body));
        req.end();
    });
}

function waitForHealth(child, timeoutMs = 20000) {
    const started = Date.now();
    return new Promise((resolve, reject) => {
        const tick = async () => {
            if (child.exitCode != null) return reject(new Error(`server exited with ${child.exitCode}`));
            try {
                const res = await request('GET', '/api/health');
                if (res.status === 200 && res.data && res.data.ok) return resolve(res.data);
            } catch (_) { /* retry */ }
            if (Date.now() - started > timeoutMs) return reject(new Error('health timeout'));
            setTimeout(tick, 200);
        };
        tick();
    });
}

async function run() {
    const child = spawn(process.execPath, ['server.js'], {
        cwd: __dirname,
        env: {
            ...process.env,
            PORT: String(port),
            SQLITE_PATH: dbFile,
            NODE_ENV: 'test',
            JWT_SECRET: 'test-jwt-secret',
            AUTH_ALLOW_LEGACY_HEADER: '0',
            SMS_PROVIDER: 'log',
            DATABASE_URL: ''
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    try {
        await waitForHealth(child);
        const login = await request('POST', '/api/login', { body: { login: 'Amin', password: 'admin' } });
        assert.strictEqual(login.status, 200, JSON.stringify(login.data));
        const auth = { Authorization: `Bearer ${login.data.token}` };

        const home = await request('GET', '/api/magazine/home');
        assert.strictEqual(home.status, 200, JSON.stringify(home.data));
        assert.ok(Array.isArray(home.data.categories) && home.data.categories.length >= 4);
        const nutrition = home.data.categories.find((item) => item.slug === 'nutrition');
        assert.ok(nutrition && nutrition.children && nutrition.children.length >= 1, 'nested categories');
        assert.ok(home.data.latestArticles.length >= 1);
        assert.ok(home.data.videos.length >= 1);
        assert.ok(home.data.podcasts.length >= 1);
        assert.ok(home.data.hero.length >= 1);
        assert.ok(home.data.sidebarBanners.length >= 1);

        const article = home.data.latestArticles[0];
        const detail = await request('GET', `/api/magazine/posts/${article.id}`);
        assert.strictEqual(detail.status, 200, JSON.stringify(detail.data));
        assert.ok(detail.data.authors.length >= 1);
        assert.ok(detail.data.tags.length >= 1);
        assert.ok(detail.data.readingTimeMinutes >= 1);
        assert.ok(detail.data.content.includes('<h2>'));
        assert.ok(detail.data.related.length >= 1);
        assert.ok(Array.isArray(detail.data.breadcrumbs));

        const slugLookup = await request('GET', `/api/magazine/posts/${article.slug}`);
        assert.strictEqual(slugLookup.status, 200);
        assert.strictEqual(slugLookup.data.id, article.id);

        const commentsBefore = (detail.data.comments || []).length;
        const guest = await request('POST', `/api/magazine/posts/${article.id}/comments`, {
            body: { authorName: 'نیما تست', authorEmail: 'nima@example.com', body: 'دیدگاه مهمان برای تست مجله' }
        });
        assert.strictEqual(guest.status, 201, JSON.stringify(guest.data));
        assert.strictEqual(guest.data.status, 'pending');

        const publicComments = await request('GET', `/api/magazine/posts/${article.id}/comments`);
        assert.ok(publicComments.data.every((item) => item.status === 'approved' || !item.status));
        assert.strictEqual(publicComments.data.length, commentsBefore);

        const pending = await request('GET', '/api/admin/magazine/comments?status=pending', { headers: auth });
        assert.strictEqual(pending.status, 200);
        const found = pending.data.find((item) => item.id === guest.data.id);
        assert.ok(found);

        const approved = await request('PATCH', `/api/admin/magazine/comments/${guest.data.id}`, {
            headers: auth,
            body: { status: 'approved' }
        });
        assert.strictEqual(approved.status, 200);
        assert.strictEqual(approved.data.status, 'approved');

        const staffReply = await request('POST', `/api/magazine/posts/${article.id}/comments`, {
            headers: auth,
            body: { parentId: guest.data.id, body: 'پاسخ تحریریه به دیدگاه تست' }
        });
        assert.strictEqual(staffReply.status, 201, JSON.stringify(staffReply.data));
        assert.strictEqual(staffReply.data.status, 'approved');
        assert.strictEqual(staffReply.data.isStaff, true);

        const after = await request('GET', `/api/magazine/posts/${article.id}/comments`);
        const parent = after.data.find((item) => item.id === guest.data.id);
        assert.ok(parent);
        assert.ok(parent.replies.some((item) => item.id === staffReply.data.id));

        const created = await request('POST', '/api/admin/magazine/posts', {
            headers: auth,
            body: {
                type: 'article',
                title: 'مقاله تست سئو مجله',
                summary: 'خلاصه تست',
                content: '<h2>مقدمه</h2><p>متن</p><h3>جزئیات</h3><p>بیشتر</p>',
                featured: true,
                tagIds: home.data.tags.slice(0, 2).map((tag) => tag.id),
                authorIds: [(await request('GET', '/api/magazine/authors')).data[0].id]
            }
        });
        assert.strictEqual(created.status, 201, JSON.stringify(created.data));
        assert.strictEqual(created.data.type, 'article');
        assert.ok(created.data.slug);
        assert.ok(created.data.readingTimeMinutes >= 1);

        const banner = home.data.sidebarBanners[0];
        const click = await request('POST', `/api/magazine/banners/${banner.id}/click`);
        assert.strictEqual(click.status, 200);
        assert.ok(click.data.clicks >= 1);
        const impression = await request('POST', `/api/magazine/banners/${banner.id}/impression`);
        assert.strictEqual(impression.status, 200);

        const catPosts = await request('GET', `/api/magazine/posts?category=${nutrition.slug}`);
        assert.ok(Array.isArray(catPosts.data));

        const podcast = home.data.podcasts[0];
        const podcastDetail = await request('GET', `/api/magazine/posts/${podcast.id}`);
        assert.strictEqual(podcastDetail.data.type, 'podcast');
        assert.ok(podcastDetail.data.audioFileUrl || podcastDetail.data.audioUrl);
        assert.ok(podcastDetail.data.transcript);

        const video = home.data.videos[0];
        const videoDetail = await request('GET', `/api/magazine/posts/${video.id}`);
        assert.strictEqual(videoDetail.data.type, 'video');
        assert.ok(videoDetail.data.videoUrl || videoDetail.data.videoEmbedUrl);

        const legacyNews = await request('GET', '/api/news');
        assert.strictEqual(legacyNews.status, 200);
        assert.ok(Array.isArray(legacyNews.data) && legacyNews.data.length >= 1);

        console.log('magazine tests passed');
    } catch (err) {
        console.error(err);
        if (stderr) console.error(stderr);
        process.exitCode = 1;
    } finally {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000);
    }
}

run();
