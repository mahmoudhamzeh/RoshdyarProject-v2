import React, { useState } from 'react';
import { shareTargets } from '../../utils/magazine';

const ShareButtons = ({ title }) => {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const targets = shareTargets(url, title);

    const copy = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const input = document.createElement('input');
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch (_) {
            setCopied(false);
        }
    };

    return (
        <div className="magazine-share">
            <span>اشتراک‌گذاری</span>
            {targets.map((item) => (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
            ))}
            <button type="button" onClick={copy}>{copied ? 'کپی شد' : 'کپی لینک'}</button>
        </div>
    );
};

export default ShareButtons;
