import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">👶 رشدیار</Link>
            </div>
            <div className="navbar-links">
                <Link to="/dashboard">خانه</Link>
                <Link to="/about">درباره ما</Link>
                <Link to="/contact">تماس با ما</Link>
                <Link to="/support">پشتیبانی</Link>
            </div>
            <div className="navbar-profile">
                <span>🔔</span>
                <Link to="/profile">پروفایل من</Link>
            </div>
        </nav>
    );
};

export default Navbar;