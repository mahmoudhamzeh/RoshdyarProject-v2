import React from 'react';
import { Link } from 'react-router-dom';
import './ContentRow.css';

const ContentRow = ({ title, items, viewAllLink }) => {
    const renderItem = (item) => {
        const card = (
            <div className="content-card">
                <img src={item.image} alt={item.title} />
                <div className="content-card-text">
                    <h4>{item.title}</h4>
                    {item.summary && <p>{item.summary}</p>}
                </div>
            </div>
        );

        if (item.link) {
            return (
                <Link to={item.link} key={item.id} className="content-card-link">
                    {card}
                </Link>
            );
        }
        return <div key={item.id}>{card}</div>;
    };

    return (
        <div className="content-row-container">
            <div className="content-row-header">
                <h3>{title}</h3>
                {viewAllLink && <Link to={viewAllLink} className="view-all-link">نمایش همه</Link>}
            </div>
            <div className="content-row">
                {items.map(renderItem)}
            </div>
        </div>
    );
};

export default ContentRow;
