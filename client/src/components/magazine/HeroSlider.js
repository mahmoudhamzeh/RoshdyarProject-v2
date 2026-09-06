import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

export const HeroSlider = ({ slides = [] }) => {
    const history = useHistory();
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (slides.length < 2) return undefined;
        const id = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 5500);
        return () => window.clearInterval(id);
    }, [slides.length]);
    if (!slides.length) return null;
    const current = slides[index] || slides[0];
    const go = async () => {
        if (current.id && current.track) {
            fetch(`/api/magazine/banners/${current.id}/click`, { method: 'POST' }).catch(() => {});
        }
        const url = current.link || '';
        if (!url) return;
        if (url.startsWith('/')) history.push(url);
        else window.open(url, '_blank', 'noopener,noreferrer');
    };
    return (
        <section className="magazine-hero" aria-label="بنر چرخشی مجله">
            <button type="button" className="magazine-hero-slide" onClick={go}>
                {current.imageUrl && (
                    <img src={current.imageUrl} alt={current.title || ''} loading="eager" decoding="async" />
                )}
                <div className="magazine-hero-copy">
                    {current.category && <span>{current.category}</span>}
                    {current.title && <h2>{current.title}</h2>}
                    {current.subtitle && <p>{current.subtitle}</p>}
                </div>
            </button>
            {slides.length > 1 && (
                <div className="magazine-hero-dots">
                    {slides.map((slide, i) => (
                        <button
                            key={slide.id || i}
                            type="button"
                            className={i === index ? 'is-active' : ''}
                            aria-label={`اسلاید ${i + 1}`}
                            onClick={() => setIndex(i)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export const AdBanner = ({ banner, className = '' }) => {
    useEffect(() => {
        if (!banner || !banner.id) return undefined;
        fetch(`/api/magazine/banners/${banner.id}/impression`, { method: 'POST' }).catch(() => {});
        return undefined;
    }, [banner]);
    if (!banner) return null;
    const inner = (
        <>
            {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title || 'بنر تبلیغاتی'} loading="lazy" decoding="async" />}
            <div>
                {banner.title && <strong>{banner.title}</strong>}
                {banner.subtitle && <span>{banner.subtitle}</span>}
            </div>
        </>
    );
    const onClick = () => {
        if (banner.id) fetch(`/api/magazine/banners/${banner.id}/click`, { method: 'POST' }).catch(() => {});
    };
    if (banner.link && banner.link.startsWith('/')) {
        return (
            <Link to={banner.link} className={`magazine-ad ${className}`} onClick={onClick}>
                {inner}
            </Link>
        );
    }
    return (
        <a
            className={`magazine-ad ${className}`}
            href={banner.link || '#'}
            target={banner.link && !banner.link.startsWith('/') ? '_blank' : undefined}
            rel="noopener noreferrer sponsored"
            onClick={onClick}
        >
            {inner}
        </a>
    );
};

export default HeroSlider;
