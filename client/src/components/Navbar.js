import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Reminders from './Reminders';

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
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">

                    {/* Left Section: Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/dashboard" className="text-2xl font-bold whitespace-nowrap">رشدیار 👶</Link>
                    </div>

                    {/* Center Section: Navigation Links */}
                    <div className="hidden md:flex flex-grow justify-center items-center space-x-4">
                        <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">خانه</Link>
                        <Link to="/news" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">اخبار و مقالات</Link>
                        <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">درباره ما</Link>
                        <Link to="/contact" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">تماس با ما</Link>
                        <Link to="/support" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">پشتیبانی</Link>
                        {isAdmin && <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-yellow-300 hover:bg-blue-700">پنل مدیریت</Link>}
                    </div>

                    {/* Right Section: Profile and Reminders */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Reminders />
                        <Link to="/profile" className="px-4 py-2 rounded-md text-sm font-medium border border-white hover:bg-white hover:text-blue-600">پروفایل من</Link>
                    </div>

                    {/* Mobile Menu Toggler */}
                    <div className="md:hidden flex items-center">
                        <button onClick={toggleMenu} className="text-white focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">خانه</Link>
                    <Link to="/news" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">اخبار و مقالات</Link>
                    <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">درباره ما</Link>
                    <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">تماس با ما</Link>
                    <Link to="/support" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">پشتیبانی</Link>
                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">پروفایل من</Link>
                    {isAdmin && <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-yellow-300 hover:bg-blue-700">پنل مدیریت</Link>}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;