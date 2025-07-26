import React from 'react';
import './ContentRow.css';

const ContentRow = ({ title, items }) => (
    <div className="content-row-container">
        <div className="content-row-header">
            <h3>{title}</h3>
            <a href="#view-all">نمایش همه</a>
        </div>
        <div className="content-row">
            {items.map(item => (
                <div key={item.id} className="content-card">
                    <img src={item.image} alt={item.title} />
                    <p>{item.title}</p>
                </div>
            ))}
        </div>
    </div>
);

export default ContentRow;