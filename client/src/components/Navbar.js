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

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        history.push('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-profile">
                    <Reminders />
                    <Link to="/profile" className="btn btn-profile">پروفایل من</Link>
                    <button onClick={handleLogout} className="btn btn-logout" type="button">خروج</button>
                </div>
            </div>
            <div className="navbar-center">
                <div className="navbar-brand">
                    <Link to="/dashboard">رشدیار 👶</Link>
                </div>
            </div>
            <div className="navbar-right">
                <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                    &#9776;
                </button>
                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/dashboard">خانه</Link>
                    <Link to="/news">اخبار و مقالات</Link>
                    <Link to="/about">درباره ما</Link>
                    <Link to="/contact">تماس با ما</Link>
                    <Link to="/support">پشتیبانی</Link>
                    {isAdmin && <Link to="/admin" className="admin-link">پنل مدیریت</Link>}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;