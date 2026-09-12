import React from 'react';
import { childGender, childPhotoUrl, getChildDisplayName } from '../utils/childName';
import './ChildAvatar.css';

const BoySvg = () => (
    <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#99f6e4" />
        <ellipse cx="32" cy="22" rx="15" ry="10" fill="#6b3f2a" />
        <circle cx="32" cy="36" r="15" fill="#f6d2b0" />
        <path d="M18 24c3-8 9-12 14-12s11 4 14 12v6H18z" fill="#6b3f2a" />
        <circle cx="26" cy="36" r="2" fill="#3f3a2f" />
        <circle cx="38" cy="36" r="2" fill="#3f3a2f" />
        <path d="M26 43c3.2 3.2 8.8 3.2 12 0" fill="none" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 60c5-10 12-14 18-14s13 4 18 14" fill="#0f766e" />
    </svg>
);

const GirlSvg = () => (
    <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#fbcfe8" />
        <circle cx="13" cy="30" r="8" fill="#7c2d12" />
        <circle cx="51" cy="30" r="8" fill="#7c2d12" />
        <circle cx="32" cy="36" r="15" fill="#f6d2b0" />
        <path d="M16 24c4-10 11-14 16-14s12 4 16 14v8H16z" fill="#7c2d12" />
        <circle cx="18" cy="16" r="4.2" fill="#db2777" />
        <circle cx="26" cy="36" r="2" fill="#3f3a2f" />
        <circle cx="38" cy="36" r="2" fill="#3f3a2f" />
        <path d="M26 43c3.2 3.2 8.8 3.2 12 0" fill="none" stroke="#be185d" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 60c5-10 12-14 18-14s13 4 18 14" fill="#db2777" />
    </svg>
);

const ChildAvatar = ({ child, size = 64, alt, className = '' }) => {
    const src = childPhotoUrl(child && child.avatar);
    const gender = childGender(child);
    const label = alt || getChildDisplayName(child);
    const style = { width: size, height: size };

    if (src) {
        return (
            <img
                src={src}
                alt={label}
                className={`child-avatar ${className}`.trim()}
                style={style}
            />
        );
    }

    return (
        <span
            className={`child-avatar child-avatar--svg child-avatar--${gender} ${className}`.trim()}
            style={style}
            role="img"
            aria-label={label}
        >
            {gender === 'girl' ? <GirlSvg /> : <BoySvg />}
        </span>
    );
};

export default ChildAvatar;
