import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Reminders from './Reminders';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();
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
                    <Link to="/dashboard">خانه</Link>
                    <Link to="/news">اخبار و مقالات</Link>
                    <Link to="/about">درباره ما</Link>
                    <Link to="/contact">تماس با ما</Link>
                    <Link to="/support">پشتیبانی</Link>
                    <Link to="/profile" className="btn btn-profile mobile-only-profile">پروفایل من</Link>
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
    );
};

export default Navbar;