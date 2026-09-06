const fs = require('fs');
const path = require('path');

const CATEGORY_TREE = [
    {
        name: 'تغذیه',
        slug: 'nutrition',
        children: [
            { name: 'غذای کمکی', slug: 'complementary-feeding' },
            { name: 'میان‌وعده', slug: 'snacks' }
        ]
    },
    {
        name: 'سلامت روان',
        slug: 'mental-health',
        children: [
            { name: 'اضطراب و دلبستگی', slug: 'anxiety-attachment' }
        ]
    },
    {
        name: 'تناسب اندام',
        slug: 'fitness',
        children: [
            { name: 'بازی و حرکت', slug: 'play-movement' }
        ]
    },
    {
        name: 'بیماری‌ها و پیشگیری',
        slug: 'diseases-prevention',
        children: [
            { name: 'سرماخوردگی', slug: 'cold' },
            { name: 'تب', slug: 'fever' }
        ]
    },
    { name: 'مادر و کودک', slug: 'mother-child' },
    { name: 'آموزشی', slug: 'education' },
    { name: 'تربیتی', slug: 'parenting' }
];

const TAGS = [
    { name: 'خواب', slug: 'sleep' },
    { name: 'تغذیه کودک', slug: 'child-nutrition' },
    { name: 'رشد مغزی', slug: 'brain-development' },
    { name: 'ایمنی', slug: 'safety' },
    { name: 'واکسیناسیون', slug: 'vaccination' },
    { name: 'بازی', slug: 'play' },
    { name: 'اضطراب', slug: 'anxiety' },
    { name: 'نوزاد', slug: 'newborn' }
];

const AUTHORS = [
    {
        slug: 'dr-sara-ahmadi',
        firstName: 'سارا',
        lastName: 'احمدی',
        specialty: 'روانشناس کودک و نوجوان',
        bio: 'دکتر سارا احمدی بیش از دوازده سال در حوزه رشد هیجانی و دلبستگی کودک فعالیت کرده و با خانواده‌ها روی مهارت‌های فرزندپروری کار می‌کند.'
    },
    {
        slug: 'dr-reza-karimi',
        firstName: 'رضا',
        lastName: 'کریمی',
        specialty: 'متخصص تغذیه کودکان',
        bio: 'دکتر رضا کریمی روی تغذیه تکمیلی، کمبود ریزمغذی‌ها و برنامه غذایی سنین پیش‌دبستانی تمرکز دارد.'
    },
    {
        slug: 'tatkids-editorial',
        firstName: 'تیم',
        lastName: 'تحریریه تات کیدز',
        specialty: 'هیئت تحریریه مجله سلامت',
        bio: 'محتوای مجله سلامت تات کیدز با همکاری پزشکان، مربیان رشد و کارشناسان سلامت کودک تهیه و بازبینی می‌شود.'
    }
];

const LEGACY_CATEGORY_MAP = {
    'تغذیه': 'nutrition',
    'مادر و کودک': 'mother-child',
    'تربیتی': 'parenting',
    'بیماری': 'diseases-prevention',
    'آموزشی': 'education',
    'عمومی': 'mother-child'
};

function articleHtml(title, summary) {
    return `
<h2>چرا این موضوع برای والدین مهم است؟</h2>
<p>${summary || ''} در مجله سلامت تات کیدز تلاش می‌کنیم راهنمایی کاربردی، مبتنی بر شواهد و قابل اجرا در خانه ارائه دهیم.</p>
<blockquote>هر کودک ریتم رشد خودش را دارد؛ این مطلب جایگزین ویزیت پزشکی نیست، اما به شما کمک می‌کند بهتر تصمیم بگیرید.</blockquote>
<h2>نکات کلیدی</h2>
<h3>نشانه‌هایی که باید ببینید</h3>
<p>تغییر الگوی خواب، اشتها، خلق‌وخو یا بازی می‌تواند سرنخ مفیدی باشد. یک دفترچه کوتاه از مشاهدات روزانه، گفتگو با پزشک را دقیق‌تر می‌کند.</p>
<table>
<thead><tr><th>نشانه</th><th>اقدام پیشنهادی</th></tr></thead>
<tbody>
<tr><td>کاهش انرژی یا بی‌حوصلگی مداوم</td><td>بررسی خواب، تغذیه و در صورت تداوم مراجعه به پزشک</td></tr>
<tr><td>بی‌قراری شدید یا اضطراب جدایی</td><td>روتین پیش‌بینی‌پذیر و همراهی آرام بدون اجبار</td></tr>
</tbody>
</table>
<h3>چه کارهایی در خانه کمک می‌کند؟</h3>
<ul>
<li>روتین ثابت برای خواب، غذا و بازی</li>
<li>پاسخ همدلانه به‌جای تنبیه هیجان</li>
<li>محدود کردن صفحه نمایش هنگام غذا و قبل از خواب</li>
</ul>
<h2>جمع‌بندی درباره «${title}»</h2>
<p>با مشاهده دقیق، انتخاب‌های کوچک روزانه و مشورت به‌موقع با متخصص، می‌توانید مسیر رشد کودک را امن‌تر و آرام‌تر کنید. اگر علائم هشدار دیدید، در مراجعه تردید نکنید.</p>
`.trim();
}

function videoHtml(title) {
    return `
<h2>راهنمای تماشای ویدیو</h2>
<p>ویدیوی «${title}» برای مشاهده روی موبایل و دسکتاپ بهینه شده است. در صورت نیاز کیفیت پخش را تغییر دهید و از زیرنویس استفاده کنید.</p>
<h3>پس از تماشا چه کنید؟</h3>
<p>یک تمرین کوتاه را همان روز با کودک تکرار کنید تا یادگیری در محیط واقعی تثبیت شود.</p>
`.trim();
}

function podcastHtml(title) {
    return `
<h2>درباره این قسمت</h2>
<p>در پادکست «${title}» کارشناسان تات کیدز نکات عملی را با زبانی ساده مرور می‌کنند. می‌توانید هنگام پیاده‌روی یا کارهای خانه با تنظیم سرعت پخش گوش دهید.</p>
`.trim();
}

function defaultTranscript(title) {
    return [
        '[۰۰:۰۰] خوش آمدید به پادکست مجله سلامت تات کیدز.',
        `[۰۰:۲۰] موضوع این قسمت: ${title}.`,
        '[۰۱:۱۰] سه نکته کاربردی برای والدین مرور می‌شود: مشاهده، روتین، و زمان مراجعه به متخصص.',
        '[۰۴:۰۰] اگر نگران رشد یا سلامت کودک هستید، این راهنما جایگزین معاینه پزشکی نیست.'
    ].join('\n');
}

function writeSvgPlaceholder(filePath, title, color) {
    const safe = String(title || 'مجله سلامت').slice(0, 42);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#115e59"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="980" cy="120" r="90" fill="rgba(255,255,255,0.12)"/>
  <circle cx="140" cy="520" r="120" fill="rgba(255,255,255,0.08)"/>
  <text x="80" y="300" fill="#ffffff" font-size="42" font-family="Tahoma, sans-serif">${escapeXml(safe)}</text>
  <text x="80" y="360" fill="#ccfbf1" font-size="22" font-family="Tahoma, sans-serif">مجله سلامت تات کیدز</text>
</svg>`;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, svg);
    return filePath;
}

function writeSilentWav(filePath, seconds = 8) {
    const sampleRate = 8000;
    const numSamples = sampleRate * seconds;
    const dataSize = numSamples;
    const buffer = Buffer.alloc(44 + dataSize);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate, 28);
    buffer.writeUInt16LE(1, 32);
    buffer.writeUInt16LE(8, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    for (let i = 0; i < numSamples; i += 1) {
        const t = i / sampleRate;
        const sample = 128 + Math.round(40 * Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t / 4));
        buffer[44 + i] = Math.max(0, Math.min(255, sample));
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

function writeVttCaptions(filePath, title) {
    const vtt = `WEBVTT

00:00.000 --> 00:04.000
خوش آمدید به ویدیوی ${title}

00:04.000 --> 00:10.000
این راهنما جنبه آموزشی دارد و جایگزین نظر پزشک نیست.
`;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, vtt);
    return filePath;
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function readingTimeMinutes(html, fallbackSummary) {
    const text = String(html || fallbackSummary || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const words = text ? text.split(' ').length : 0;
    return Math.max(1, Math.round(words / 180));
}

function parseDurationSeconds(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
    const parts = String(value).split(':').map((part) => parseInt(part, 10));
    if (parts.some((n) => Number.isNaN(n))) return 0;
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    if (parts.length === 2) return (parts[0] * 60) + parts[1];
    return parts[0] || 0;
}

function formatDuration(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function slugify(text, fallback) {
    const base = String(text || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
    return base || fallback || `item-${Date.now().toString(36)}`;
}

function toEmbedUrl(raw) {
    const url = String(raw || '').trim();
    if (!url) return '';
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const aparat = url.match(/aparat\.com\/(?:v\/|video\/video\/embed\/videohash\/)?([A-Za-z0-9]+)/);
    if (aparat && !url.includes('/embed/')) {
        return `https://www.aparat.com/video/video/embed/videohash/${aparat[1]}/vt/frame`;
    }
    if (/arvanlive|player\.arvan/i.test(url)) return url;
    return url;
}

module.exports = {
    CATEGORY_TREE,
    TAGS,
    AUTHORS,
    LEGACY_CATEGORY_MAP,
    articleHtml,
    videoHtml,
    podcastHtml,
    defaultTranscript,
    writeSvgPlaceholder,
    writeSilentWav,
    writeVttCaptions,
    readingTimeMinutes,
    parseDurationSeconds,
    formatDuration,
    slugify,
    toEmbedUrl
};
