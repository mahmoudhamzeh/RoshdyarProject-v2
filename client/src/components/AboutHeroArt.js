import React from 'react';

/** Original TatKids scene: hills, sun, parent and child, plants. */
export const AboutHeroArt = () => (
    <svg className="about-hero-art" viewBox="0 0 640 460" role="img" aria-label="تصویر رشد کودک در طبیعت">
        <defs>
            <linearGradient id="aboutSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#99f6e4" />
                <stop offset="55%" stopColor="#ccfbf1" />
                <stop offset="100%" stopColor="#f0fdfa" />
            </linearGradient>
            <linearGradient id="aboutHillA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="aboutHillB" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#5eead4" />
            </linearGradient>
            <linearGradient id="aboutSun" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
        </defs>
        <rect width="640" height="460" rx="36" fill="url(#aboutSky)" />
        <circle cx="520" cy="88" r="46" fill="url(#aboutSun)" />
        <circle cx="520" cy="88" r="68" fill="#fde68a" opacity="0.28" />
        <circle cx="86" cy="70" r="18" fill="#fff" opacity="0.7" />
        <circle cx="118" cy="62" r="28" fill="#fff" opacity="0.55" />
        <circle cx="150" cy="74" r="16" fill="#fff" opacity="0.7" />
        <circle cx="430" cy="48" r="14" fill="#fff" opacity="0.45" />
        <circle cx="456" cy="40" r="22" fill="#fff" opacity="0.35" />
        <path d="M-20 330 C 80 250, 180 310, 280 280 C 390 248, 470 300, 660 250 L 660 470 L -20 470 Z" fill="url(#aboutHillB)" />
        <path d="M-20 380 C 90 320, 200 390, 330 350 C 450 314, 540 380, 660 340 L 660 470 L -20 470 Z" fill="url(#aboutHillA)" />
        <g transform="translate(92 286)">
            <rect x="18" y="42" width="8" height="46" rx="4" fill="#166534" />
            <ellipse cx="22" cy="38" rx="22" ry="16" fill="#22c55e" />
            <ellipse cx="6" cy="50" rx="14" ry="10" fill="#4ade80" />
            <ellipse cx="38" cy="52" rx="14" ry="10" fill="#16a34a" />
        </g>
        <g transform="translate(508 300)">
            <rect x="16" y="28" width="7" height="40" rx="3" fill="#166534" />
            <ellipse cx="20" cy="24" rx="18" ry="14" fill="#86efac" />
            <ellipse cx="6" cy="34" rx="12" ry="8" fill="#22c55e" />
        </g>
        <g transform="translate(228 214)">
            <ellipse cx="54" cy="148" rx="42" ry="10" fill="#0f766e" opacity="0.25" />
            <circle cx="54" cy="52" r="22" fill="#fde68a" />
            <path d="M32 78 C 32 64, 76 64, 76 82 C 76 118, 90 148, 54 148 C 18 148, 32 118, 32 82 Z" fill="#0f766e" />
            <rect x="40" y="148" width="12" height="36" rx="6" fill="#134e4a" />
            <rect x="56" y="148" width="12" height="36" rx="6" fill="#134e4a" />
            <path d="M28 92 C 8 108, 4 128, 18 136" fill="none" stroke="#0f766e" strokeWidth="10" strokeLinecap="round" />
            <path d="M80 94 C 112 86, 126 70, 118 52" fill="none" stroke="#0f766e" strokeWidth="10" strokeLinecap="round" />
            <circle cx="118" cy="40" r="16" fill="#fcd34d" />
            <circle cx="112" cy="36" r="2.2" fill="#134e4a" />
            <circle cx="122" cy="36" r="2.2" fill="#134e4a" />
            <path d="M108 44 Q 118 50 126 44" fill="none" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="108" y="52" width="20" height="28" rx="10" fill="#14b8a6" />
            <rect x="110" y="78" width="7" height="18" rx="3" fill="#0f766e" />
            <rect x="119" y="78" width="7" height="18" rx="3" fill="#0f766e" />
        </g>
        <g transform="translate(400 248)">
            <path d="M18 8 C 28 -8, 48 4, 40 22 C 62 18, 62 44, 42 42 C 46 62, 18 62, 20 42 C 4 50, 0 22, 18 8 Z" fill="#f59e0b" />
            <circle cx="28" cy="28" r="6" fill="#fde68a" />
        </g>
    </svg>
);

export const AboutStoryArt = () => (
    <svg className="about-story-art" viewBox="0 0 420 320" role="img" aria-label="نمودار رشد کودک">
        <defs>
            <linearGradient id="aboutChart" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.55" />
            </linearGradient>
        </defs>
        <rect width="420" height="320" rx="28" fill="#f0fdfa" />
        <circle cx="64" cy="48" r="36" fill="#ccfbf1" />
        <circle cx="360" cy="56" r="22" fill="#fef3c7" />
        <circle cx="388" cy="250" r="40" fill="#ccfbf1" opacity="0.7" />
        <rect x="48" y="88" width="324" height="176" rx="20" fill="#fff" />
        <path d="M72 220 L 132 176 L 188 188 L 248 128 L 328 108" fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M72 220 L 132 176 L 188 188 L 248 128 L 328 108 L 328 236 L 72 236 Z" fill="url(#aboutChart)" />
        <circle cx="72" cy="220" r="8" fill="#f59e0b" />
        <circle cx="132" cy="176" r="8" fill="#14b8a6" />
        <circle cx="188" cy="188" r="8" fill="#0f766e" />
        <circle cx="248" cy="128" r="8" fill="#14b8a6" />
        <circle cx="328" cy="108" r="10" fill="#f59e0b" />
        <rect x="86" y="252" width="72" height="10" rx="5" fill="#ccfbf1" />
        <rect x="174" y="252" width="52" height="10" rx="5" fill="#fef3c7" />
        <rect x="242" y="252" width="88" height="10" rx="5" fill="#99f6e4" />
    </svg>
);
