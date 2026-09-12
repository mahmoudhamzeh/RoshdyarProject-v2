import React from 'react';
import { Link } from 'react-router-dom';

const ShopBreadcrumb = ({ items = [] }) => {
    const crumbs = (items || []).filter((item) => item && item.label);
    if (!crumbs.length) return null;

    return (
        <nav className="shop-breadcrumb" aria-label="مسیر صفحه">
            <ol>
                {crumbs.map((item, index) => {
                    const last = index === crumbs.length - 1;
                    return (
                        <li key={`${item.label}-${index}`}>
                            {index > 0 && <span className="shop-breadcrumb-sep" aria-hidden="true">/</span>}
                            {!last && item.to ? (
                                <Link to={item.to}>{item.label}</Link>
                            ) : (
                                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default ShopBreadcrumb;
