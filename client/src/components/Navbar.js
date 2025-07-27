import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();

    const handleProfileClick = () => {
        history.push('/profile');
    };

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
                <button onClick={handleProfileClick} className="profile-btn">پروفایل من</button>
            </div>
        </nav>
    );
};

export default Navbar;