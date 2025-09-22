import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reminders from './Reminders';
import './MainNavbar.css';

const MainNavbar = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        try {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                const user = JSON.parse(loggedInUser);
                if (user && user.isAdmin) {
                    setIsAdmin(true);
                }
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage", error);
        }
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="navbar">
                {/* Left Section: Brand */}
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <Link to="/dashboard">رشدیار 👶</Link>
                    </div>
                </div>

                {/* Center Section: Navigation Links */}
                <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to="/dashboard">داشبورد</Link>
                        <Link to="/news">مجله سلامت</Link>
                        <Link to="/my-children">فرزندان من</Link>
                        {isAdmin && <Link to="/admin" className="admin-link">پنل مدیریت</Link>}
                    </div>
                </div>

                {/* Right Section: Profile, Reminders, and Toggler */}
                <div className="navbar-right">
                    <div className="navbar-profile">
                        <Reminders />
                        <Link to="/profile" className="btn btn-profile desktop-only-profile">پروفایل من</Link>
                    </div>
                    <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                        &#9776;
                    </button>
                </div>
            </nav>
            {isMenuOpen && <div className="menu-backdrop" onClick={toggleMenu}></div>}
        </>
    );
};

export default MainNavbar;
