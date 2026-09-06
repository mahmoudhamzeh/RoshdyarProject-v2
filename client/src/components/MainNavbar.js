import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Reminders from './Reminders';
import BrandLogo from './BrandLogo';
import { isLoggedIn, getLoggedInUser } from '../api';
import './MainNavbar.css';

const MainNavbar = () => {
    const history = useHistory();
    const location = useLocation();
    const shopParams = new URLSearchParams(location.search);
    const showShopFilter = location.pathname === '/shop';
    const shopFiltersActive = Boolean(
        shopParams.get('q')
        || shopParams.get('skill')
        || shopParams.get('age')
        || (shopParams.get('category') && shopParams.get('category') !== 'همه')
    );
    const [isAdmin, setIsAdmin] = useState(false);
    const [signedIn, setSignedIn] = useState(isLoggedIn());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        const user = getLoggedInUser();
        setSignedIn(!!(user && user.id));
        setIsAdmin(!!(user && user.isAdmin));
    }, []);

    useEffect(() => {
        document.body.classList.toggle('nav-drawer-open', isMenuOpen);
        return () => document.body.classList.remove('nav-drawer-open');
    }, [isMenuOpen]);

    useEffect(() => {
        if (!searchOpen) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [searchOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = searchQ.trim();
        setSearchOpen(false);
        history.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <Link to="/" onClick={closeMenu}>
                            <BrandLogo className="navbar-brand-icon" size={34} alt="" />
                            <span className="navbar-brand-text">
                                <span className="navbar-brand-fa">تات کیدز</span>
                                <span className="navbar-brand-en">TatKids</span>
                            </span>
                        </Link>
                    </div>
                </div>

                <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to="/" onClick={closeMenu}>خانه</Link>
                        <Link to="/about" onClick={closeMenu}>درباره ما</Link>
                        <Link to="/news" onClick={closeMenu}>مجله سلامت</Link>
                        <Link to="/shop" onClick={closeMenu}>فروشگاه</Link>
                        {isAdmin && (
                            <Link to="/admin" className="admin-link" onClick={closeMenu}>
                                پنل مدیریت
                            </Link>
                        )}
                        {signedIn ? (
                            <Link
                                to="/profile"
                                className="btn btn-profile mobile-only-profile"
                                onClick={closeMenu}
                            >
                                پروفایل من
                            </Link>
                        ) : (
                            <Link
                                to="/register"
                                className="btn btn-profile mobile-only-profile"
                                onClick={closeMenu}
                            >
                                ورود
                            </Link>
                        )}
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="navbar-profile">
                        <button
                            type="button"
                            className="navbar-search-btn"
                            aria-label="جستجوی محصول"
                            aria-expanded={searchOpen}
                            onClick={() => setSearchOpen((open) => !open)}
                        >
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        {signedIn && <Reminders />}
                    </div>
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-label="منو"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>
            {searchOpen && (
                <div className="navbar-search-overlay" onClick={() => setSearchOpen(false)} role="presentation">
                    <form className="navbar-search-panel" onSubmit={submitSearch} onClick={(e) => e.stopPropagation()}>
                        <input
                            type="search"
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            placeholder="جستجوی محصول..."
                            aria-label="جستجوی محصول"
                            autoFocus
                        />
                        <button type="submit">جستجو</button>
                    </form>
                </div>
            )}
            {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu} />}
            <div className="navbar-subbar">
                <nav className="navbar-subbar-links" aria-label="حساب و فروشنده">
                    <Link to="/vendor">فروشنده شوید</Link>
                    {signedIn ? (
                        <Link to="/profile">پروفایل من</Link>
                    ) : (
                        <Link to="/register">ورود</Link>
                    )}
                </nav>
                {showShopFilter && (
                    <button
                        type="button"
                        className="navbar-filter-btn"
                        onClick={() => window.dispatchEvent(new Event('shop-open-filter'))}
                    >
                        {shopFiltersActive ? 'فیلتر · فعال' : 'فیلتر'}
                    </button>
                )}
            </div>
        </>
    );
};

export default MainNavbar;
