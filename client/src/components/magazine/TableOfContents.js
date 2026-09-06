import React from 'react';
import { extractHeadings } from '../../utils/magazine';

const TableOfContents = ({ html }) => {
    const items = extractHeadings(html);
    if (items.length < 2) return null;
    return (
        <nav className="magazine-toc" aria-label="فهرست مطالب">
            <h2>فهرست مطالب</h2>
            <ol>
                {items.map((item) => (
                    <li key={item.id} className={item.level === 3 ? 'is-h3' : ''}>
                        <a href={`#${item.id}`}>{item.text}</a>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default TableOfContents;
