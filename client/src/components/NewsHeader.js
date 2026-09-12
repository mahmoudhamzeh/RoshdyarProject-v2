import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NewsHeader.css';

const CATEGORIES = [
    { label: 'همه', category: 'همه' },
    { label: 'بیماری', category: 'بیماری' },
    { label: 'آموزش', category: 'آموزشی' },
    { label: 'تغذیه', category: 'تغذیه' },
    { label: 'مادر و کودک', category: 'مادر و کودک' },
    { label: 'تربیتی', category: 'تربیتی' },
];

const NewsHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen((open) => !open);

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

    useEffect(() => {
        document.body.classList.toggle('nav-drawer-open', isMenuOpen);
        return () => document.body.classList.remove('nav-drawer-open');
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isMenuOpen]);

    const categoryLink = (item) => (
        <Link
            key={item.category}
            to={{ pathname: '/news', state: { category: item.category } }}
            onClick={closeMenu}
        >
            {item.label}
        </Link>
    );

    return (
        <>
            <nav className="news-navbar">
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <Link to="/news" onClick={closeMenu}>مجله سلامت تات کیدز</Link>
                    </div>
                </div>

                <div className="navbar-center">
                    <div className="navbar-links">
                        {CATEGORIES.map(categoryLink)}
                    </div>
                </div>

                <div className="navbar-right">
                    {!isLoggedIn && (
                        <Link to="/register" className="news-login-cta news-login-cta--desktop">
                            ورود
                        </Link>
                    )}
                    {isLoggedIn && (
                        <Link to="/" className="news-login-cta news-login-cta--desktop">
                            خانه
                        </Link>
                    )}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'بستن منو' : 'باز کردن منو'}
                        aria-expanded={isMenuOpen}
                        aria-controls="news-mobile-drawer"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>
            <aside
                id="news-mobile-drawer"
                className={`news-drawer ${isMenuOpen ? 'is-open' : ''}`}
                aria-hidden={!isMenuOpen}
                aria-label="دسته‌های مجله"
            >
                <div className="news-drawer-head">
                    <strong>مجله سلامت</strong>
                    <button
                        type="button"
                        className="news-drawer-close"
                        onClick={closeMenu}
                        aria-label="بستن منو"
                    >
                        ✕
                    </button>
                </div>
                <nav className="news-drawer-nav">
                    <p className="news-drawer-label">دسته‌ها</p>
                    {CATEGORIES.map(categoryLink)}
                    <p className="news-drawer-label">حساب</p>
                    {isLoggedIn ? (
                        <Link to="/" onClick={closeMenu}>خانه تات کیدز</Link>
                    ) : (
                        <Link to="/register" onClick={closeMenu}>ورود / ثبت‌نام</Link>
                    )}
                </nav>
            </aside>
            {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu} />}
        </>
    );
};

export default NewsHeader;
