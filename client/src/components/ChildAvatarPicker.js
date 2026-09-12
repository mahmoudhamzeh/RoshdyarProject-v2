import React from 'react';
import { CHILD_AVATARS } from '../utils/childAvatars';

const ChildAvatarPicker = ({ value, gender, onChange }) => {
    const options = gender === 'girl' || gender === 'boy'
        ? [
            ...CHILD_AVATARS.filter((item) => item.gender === gender),
            ...CHILD_AVATARS.filter((item) => item.gender !== gender)
        ]
        : CHILD_AVATARS;

    return (
        <div className="avatar-preset-block">
            <p className="avatar-preset-title">آواتارهای آماده</p>
            <div className="avatar-preset-grid" role="listbox" aria-label="انتخاب آواتار کودک">
                {options.map((item) => {
                    const selected = value === item.src;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`avatar-preset-btn${selected ? ' is-selected' : ''}`}
                            onClick={() => onChange(item.src)}
                        >
                            <img src={item.src} alt={item.label} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ChildAvatarPicker;
