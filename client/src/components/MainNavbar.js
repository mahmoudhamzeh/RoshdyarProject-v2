import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reminders from './Reminders';
import BrandLogo from './BrandLogo';
import './MainNavbar.css';

const MainNavbar = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const syncAuth = () => {
            try {
                const raw = localStorage.getItem('loggedInUser');
                const user = raw ? JSON.parse(raw) : null;
                setIsAdmin(!!(user && user.isAdmin));
            } catch (error) {
                console.error('Error parsing user data from localStorage', error);
                setIsAdmin(false);
            }
        };
        syncAuth();
        window.addEventListener('auth-changed', syncAuth);
        window.addEventListener('storage', syncAuth);
        return () => {
            window.removeEventListener('auth-changed', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, []);

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

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen((open) => !open);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <Link to="/dashboard" onClick={closeMenu}>
                            <BrandLogo className="navbar-brand-icon" size={34} alt="" />
                            <span className="navbar-brand-text">
                                <span className="navbar-brand-fa">تات کیدز</span>
                                <span className="navbar-brand-en">TatKids</span>
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="navbar-center">
                    <div className="navbar-links">
                        <Link to="/dashboard">داشبورد</Link>
                        <Link to="/news">مجله سلامت</Link>
                        <Link to="/shop">فروشگاه</Link>
                        {isAdmin && (
                            <Link to="/admin" className="admin-link">
                                پنل مدیریت
                            </Link>
                        )}
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="navbar-profile">
                        <Reminders />
                        <Link to="/profile" className="btn btn-profile desktop-only-profile">پروفایل من</Link>
                    </div>
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'بستن منو' : 'باز کردن منو'}
                        aria-expanded={isMenuOpen}
                        aria-controls="navbar-mobile-drawer"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>
            <aside
                id="navbar-mobile-drawer"
                className={`navbar-drawer ${isMenuOpen ? 'is-open' : ''}`}
                aria-hidden={!isMenuOpen}
                aria-label="منوی صفحات"
            >
                <div className="navbar-drawer-head">
                    <Link to="/dashboard" className="navbar-drawer-brand" onClick={closeMenu}>
                        <BrandLogo className="navbar-brand-icon" size={34} alt="" />
                        <span>
                            <strong>تات کیدز</strong>
                            <em>TatKids</em>
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="navbar-drawer-close"
                        onClick={closeMenu}
                        aria-label="بستن منو"
                    >
                        ✕
                    </button>
                </div>
                <nav className="navbar-drawer-nav">
                    <p className="navbar-drawer-label">صفحات</p>
                    <Link to="/dashboard" onClick={closeMenu}>داشبورد</Link>
                    <Link to="/news" onClick={closeMenu}>مجله سلامت</Link>
                    <Link to="/shop" onClick={closeMenu}>فروشگاه</Link>
                    <p className="navbar-drawer-label">حساب</p>
                    <Link to="/profile" onClick={closeMenu}>پروفایل من</Link>
                    {isAdmin && (
                        <Link to="/admin" className="admin-link" onClick={closeMenu}>
                            پنل مدیریت
                        </Link>
                    )}
                </nav>
            </aside>
            {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu} />}
        </>
    );
};

export default MainNavbar;
