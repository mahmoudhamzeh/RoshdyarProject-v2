import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NewsHeader.css';

const NewsHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="navbar">
                {/* Left Section: Brand */}
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <Link to="/news">مجله سلامت</Link>
                    </div>
                </div>

                {/* Center Section: Navigation Links */}
                <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to={{ pathname: "/news", state: { category: 'همه' } }}>همه</Link>
                        <Link to={{ pathname: "/news", state: { category: 'بیماری' } }}>بیماری</Link>
                        <Link to={{ pathname: "/news", state: { category: 'آموزشی' } }}>آموزش</Link>
                        <Link to={{ pathname: "/news", state: { category: 'تغذیه' } }}>تغذیه</Link>
                        <Link to={{ pathname: "/news", state: { category: 'مادر و کودک' } }}>مادر و کودک</Link>
                        <Link to={{ pathname: "/news", state: { category: 'تربیتی' } }}>تربیتی</Link>
                    </div>
                </div>

                {/* Right Section: Toggler */}
                <div className="navbar-right">
                    <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                        &#9776;
                    </button>
                </div>
            </nav>
            {isMenuOpen && <div className="menu-backdrop" onClick={toggleMenu}></div>}
        </>
    );
};

export default NewsHeader;