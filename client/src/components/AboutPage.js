import React from 'react';
import MainNavbar from './MainNavbar';
import Footer from './Footer';
import HomeAbout from './HomeAbout';
import './DashboardPage.css';
import './HomeAbout.css';

const AboutPage = () => (
    <div className="dashboard-page about-page">
        <MainNavbar />
        <main className="dashboard-main">
            <HomeAbout />
        </main>
        <Footer />
    </div>
);

export default AboutPage;
