import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import Reminders from './Reminders';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();

    const handleProfileClick = () => {
        history.push('/profile');
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        history.push('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">رشدیار 👶</Link>
            </div>
            <div className="navbar-links">
                <Link to="/dashboard">خانه</Link>
                <Link to="/about">درباره ما</Link>
                <Link to="/contact">تماس با ما</Link>
                <Link to="/support">پشتیبانی</Link>
            </div>
            <div className="navbar-profile">
                <Reminders />
                <Link to="/profile" className="btn btn-profile">پروفایل من</Link>
                <button onClick={handleLogout} className="btn btn-logout" type="button">خروج</button>
            </div>
        </nav>
    );
};

export default Navbar;
