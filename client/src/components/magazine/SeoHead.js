import { useEffect } from 'react';
import { schemaGraph, absoluteUrl } from '../../utils/magazine';

function upsertMeta(selector, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).forEach(([key, value]) => {
            if (value) el.setAttribute(key, value);
        });
        document.head.appendChild(el);
        return el;
    }
    Object.entries(attrs).forEach(([key, value]) => {
        if (value) el.setAttribute(key, value);
    });
    return el;
}

const SeoHead = ({ post }) => {
    useEffect(() => {
        if (!post) return undefined;
        const pageUrl = typeof window !== 'undefined' ? window.location.href : absoluteUrl(post.slug);
        const title = post.seoTitle || `${post.title} | مجله سلامت تات کیدز`;
        const description = post.seoDescription || post.summary || '';
        const image = post.featuredImageUrl ? absoluteUrl(post.featuredImageUrl) : '';
        const prevTitle = document.title;
        document.title = title;

        upsertMeta('meta[name="description"]', { name: 'description', content: description });
        upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
        upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
        upsertMeta('meta[property="og:type"]', { property: 'og:type', content: post.type === 'article' ? 'article' : 'website' });
        upsertMeta('meta[property="og:url"]', { property: 'og:url', content: pageUrl });
        if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
        upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
        upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
        upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
        if (image) upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });

        const graph = schemaGraph(post, pageUrl);
        let script = document.getElementById('magazine-jsonld');
        if (!script) {
            script = document.createElement('script');
            script.id = 'magazine-jsonld';
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(graph);

        return () => {
            document.title = prevTitle;
        };
    }, [post]);

    return null;
};

export default SeoHead;
