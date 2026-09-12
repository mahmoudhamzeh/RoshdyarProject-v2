import React from 'react';
import { formatRating } from '../utils/shop';

const ShopRating = ({
    value = 0,
    count = 0,
    size = 'md',
    showEmpty = false,
    className = ''
}) => {
    const n = Number(value);
    const score = Number.isFinite(n) && n > 0 ? n : 0;
    if (!showEmpty && score <= 0 && !(count > 0)) return null;

    const fills = [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.min(1, score - i)));
    const label = `${formatRating(score)} از ۵${count > 0 ? `، ${count} نظر` : ''}`;

    return (
        <div className={`shop-rating shop-rating--${size} ${className}`.trim()} aria-label={label}>
            <span className="shop-rating-stars" aria-hidden="true">
                {fills.map((fill, index) => (
                    <span key={index} className="shop-star">
                        <span className="shop-star__base">★</span>
                        <span className="shop-star__fill" style={{ width: `${fill * 100}%` }}>★</span>
                    </span>
                ))}
            </span>
            <strong className="shop-rating-num">{formatRating(score)}</strong>
            {count > 0 && <span className="shop-rating-count">({count} نظر)</span>}
        </div>
    );
};

export default ShopRating;
