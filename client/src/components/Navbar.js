import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Reminders from './Reminders';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

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
            <div className="navbar-brand">
                <Link to="/dashboard">رشدیار 👶</Link>
            </div>
            <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                &#9776;
            </button>
            <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/dashboard">خانه</Link>
                <div
                    className="dropdown"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                >
                    <Link to="/news" className="dropdown-toggle">مجله سلامت</Link>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/news?category=بیماری">بیماری</Link>
                            <Link to="/news?category=آموزشی">آموزشی</Link>
                            <Link to="/news?category=تغذیه">تغذیه</Link>
                            <Link to="/news?category=مادر و کودک">مادر و کودک</Link>
                            <Link to="/news?category=تربیتی">تربیتی</Link>
                        </div>
                    )}
                </div>
                <Link to="/about">درباره ما</Link>
                <Link to="/contact">تماس با ما</Link>
                <Link to="/support">پشتیبانی</Link>
                {isAdmin && <Link to="/admin" className="admin-link">پنل مدیریت</Link>}
                <div className="navbar-profile-mobile">
                    <Link to="/profile" className="btn btn-profile">پروفایل من</Link>
                    <button onClick={handleLogout} className="btn btn-logout" type="button">خروج</button>
                </div>
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