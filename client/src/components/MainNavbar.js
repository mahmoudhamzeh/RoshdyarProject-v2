import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Reminders from './Reminders';
import BrandLogo from './BrandLogo';
import { isLoggedIn, getLoggedInUser } from '../api';
import { getCartCount } from '../utils/cart';
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
    const [cartCount, setCartCount] = useState(getCartCount());

    useEffect(() => {
        const syncAuth = () => {
            const user = getLoggedInUser();
            setSignedIn(!!(user && user.id));
            setIsAdmin(!!(user && user.isAdmin));
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
        const syncCart = () => setCartCount(getCartCount());
        syncCart();
        window.addEventListener('cart-updated', syncCart);
        window.addEventListener('storage', syncCart);
        return () => {
            window.removeEventListener('cart-updated', syncCart);
            window.removeEventListener('storage', syncCart);
        };
    }, []);

    useEffect(() => {
        document.body.classList.toggle('nav-drawer-open', isMenuOpen);
        return () => document.body.classList.remove('nav-drawer-open');
    }, [isMenuOpen]);

    useEffect(() => {
        if (!searchOpen && !isMenuOpen) return undefined;
        const onKey = (event) => {
            if (event.key !== 'Escape') return;
            setSearchOpen(false);
            setIsMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [searchOpen, isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => {
        setSearchOpen(false);
        setIsMenuOpen((open) => !open);
    };

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

                <div className="navbar-center">
                    <div className="navbar-links">
                        <Link to="/">خانه</Link>
                        <Link to="/about">درباره ما</Link>
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
                        <button
                            type="button"
                            className="navbar-search-btn"
                            aria-label="جستجوی محصول"
                            aria-expanded={searchOpen}
                            onClick={() => setSearchOpen((open) => !open)}
                        >
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <Link
                            to="/cart"
                            className="navbar-cart-link"
                            aria-label={cartCount ? `سبد خرید، ${cartCount} کالا` : 'سبد خرید'}
                            onClick={closeMenu}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            {cartCount > 0 && (
                                <span className="navbar-cart-badge">
                                    {cartCount > 99 ? '۹۹+' : cartCount.toLocaleString('fa-IR')}
                                </span>
                            )}
                        </Link>
                        {signedIn ? (
                            <Link to="/profile" className="navbar-account-link">پروفایل</Link>
                        ) : (
                            <Link to="/register" className="navbar-account-link">ورود</Link>
                        )}
                        {signedIn && <Reminders />}
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
                    <Link to="/" className="navbar-drawer-brand" onClick={closeMenu}>
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
                    <Link to="/" onClick={closeMenu}>خانه</Link>
                    <Link to="/about" onClick={closeMenu}>درباره ما</Link>
                    <Link to="/news" onClick={closeMenu}>مجله سلامت</Link>
                    <Link to="/shop" onClick={closeMenu}>فروشگاه</Link>
                    <p className="navbar-drawer-label">حساب</p>
                    {signedIn ? (
                        <Link to="/profile" onClick={closeMenu}>پروفایل من</Link>
                    ) : (
                        <Link to="/register" onClick={closeMenu}>ورود / ثبت‌نام</Link>
                    )}
                    <Link to="/cart" onClick={closeMenu}>
                        سبد خرید
                        {cartCount > 0 ? ` (${cartCount.toLocaleString('fa-IR')})` : ''}
                    </Link>
                    <Link to="/vendor" onClick={closeMenu}>فروشنده شوید</Link>
                    {isAdmin && (
                        <Link to="/admin" className="admin-link" onClick={closeMenu}>
                            پنل مدیریت
                        </Link>
                    )}
                </nav>
            </aside>
            {searchOpen && (
                <div className="navbar-search-overlay" onClick={() => setSearchOpen(false)} role="presentation">
                    <form
                        className="navbar-search-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="جستجوی محصول"
                        onSubmit={submitSearch}
                        onClick={(e) => e.stopPropagation()}
                    >
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
            <div className={`navbar-subbar${showShopFilter ? '' : ' navbar-subbar--desktop-only'}`}>
                <nav className="navbar-subbar-links" aria-label="فروشندگان">
                    <Link to="/vendor">فروشنده شوید</Link>
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
