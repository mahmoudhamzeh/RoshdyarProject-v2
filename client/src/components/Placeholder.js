import React from 'react';

const Placeholder = ({ title }) => {
    return (
        <div className="card">
            <div className="card-header">
                <h2>{title}</h2>
            </div>
            <p>این بخش در حال حاضر در دست ساخت است و به زودی در دسترس خواهد بود.</p>
        </div>
    );
};

export default Placeholder;
