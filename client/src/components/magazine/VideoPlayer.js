import React, { useMemo, useState } from 'react';

const isDirectVideo = (url) => /\.(mp4|webm|ogg)(\?|$)/i.test(url || '');

const VideoPlayer = ({ post }) => {
    const sources = useMemo(() => {
        const list = Array.isArray(post.videoQualities) ? post.videoQualities.filter((item) => item && item.url) : [];
        if (post.videoFileUrl) list.unshift({ label: 'آپلود شده', url: post.videoFileUrl });
        if (!list.length && post.videoUrl && isDirectVideo(post.videoUrl)) {
            list.push({ label: 'اصلی', url: post.videoUrl });
        }
        return list;
    }, [post]);
    const embed = post.videoEmbedUrl && !isDirectVideo(post.videoEmbedUrl) ? post.videoEmbedUrl : '';
    const [quality, setQuality] = useState(0);
    const current = sources[quality] || sources[0];

    if (current && isDirectVideo(current.url)) {
        return (
            <div className="magazine-video-player">
                <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={post.featuredImageUrl || undefined}
                    src={current.url}
                >
                    {post.captionsUrl && (
                        <track kind="subtitles" srcLang="fa" label="فارسی" src={post.captionsUrl} default />
                    )}
                </video>
                {sources.length > 1 && (
                    <label className="magazine-video-quality">
                        کیفیت
                        <select value={quality} onChange={(e) => setQuality(Number(e.target.value))}>
                            {sources.map((item, index) => (
                                <option key={item.label || index} value={index}>{item.label || `منبع ${index + 1}`}</option>
                            ))}
                        </select>
                    </label>
                )}
            </div>
        );
    }

    if (embed || (post.videoUrl && !isDirectVideo(post.videoUrl))) {
        const src = embed || post.videoUrl;
        return (
            <div className="magazine-video-player magazine-video-player--embed">
                <iframe
                    title={post.title}
                    src={src}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
                {post.captionsUrl && <p className="magazine-caption-hint">زیرنویس جداگانه: <a href={post.captionsUrl}>دانلود فایل زیرنویس</a></p>}
            </div>
        );
    }

    return null;
};

export default VideoPlayer;
