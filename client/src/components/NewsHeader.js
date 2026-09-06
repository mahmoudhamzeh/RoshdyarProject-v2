import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NewsHeader.css';

const NewsHeader = ({ categories }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tree, setTree] = useState(categories || []);

    useEffect(() => {
        if (categories && categories.length) {
            setTree(categories);
            return undefined;
        }
        let cancelled = false;
        fetch('/api/magazine/categories')
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (!cancelled) setTree(Array.isArray(data) ? data : []);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [categories]);

    const isLoggedIn = (() => {
        try {
            const raw = localStorage.getItem('loggedInUser');
            if (!raw) return false;
            const user = JSON.parse(raw);
            return !!(user && user.id);
        } catch {
            return false;
        }
    })();

    return (
        <>
            <nav className="news-navbar">
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <Link to="/news">مجله سلامت تات کیدز</Link>
                    </div>
                </div>
                <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to="/news" onClick={() => setIsMenuOpen(false)}>همه</Link>
                        {tree.map((category) => (
                            <Link
                                key={category.id}
                                to={`/news/category/${category.slug}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {category.name}
                            </Link>
                        ))}
                        {isLoggedIn ? (
                            <Link to="/" className="news-login-cta" onClick={() => setIsMenuOpen(false)}>
                                خانه
                            </Link>
                        ) : (
                            <Link to="/register" className="news-login-cta" onClick={() => setIsMenuOpen(false)}>
                                ورود / ثبت‌نام
                            </Link>
                        )}
                    </div>
                </div>
                <div className="navbar-right">
                    {!isLoggedIn && (
                        <Link to="/register" className="news-login-cta news-login-cta--desktop">ورود</Link>
                    )}
                    {isLoggedIn && (
                        <Link to="/" className="news-login-cta news-login-cta--desktop">
                            خانه
                        </Link>
                    )}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="منو"
                        aria-expanded={isMenuOpen}
                    >
                        &#9776;
                    </button>
                </div>
            </nav>
            {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
        </>
    );
};

export default NewsHeader;
