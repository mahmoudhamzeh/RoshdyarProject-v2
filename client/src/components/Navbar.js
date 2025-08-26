import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Reminders from './Reminders';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();
    const [isAdmin, setIsAdmin] = useState(false);

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
                {isAdmin && <Link to="/admin" className="admin-link">پنل مدیریت</Link>}
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