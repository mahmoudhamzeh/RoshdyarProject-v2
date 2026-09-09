import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faSeedling, faStore } from '@fortawesome/free-solid-svg-icons';
import MainNavbar from './MainNavbar';
import Footer from './Footer';
import HomeAbout from './HomeAbout';
import BrandLogo from './BrandLogo';
import { AboutHeroArt, AboutStoryArt } from './AboutHeroArt';
import { isLoggedIn } from '../api';
import './DashboardPage.css';
import './HomeAbout.css';
import './AboutPage.css';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1800&q=80';

const VALUES = [
    {
        icon: faSeedling,
        title: 'رشد آگاهانه',
        text: 'مسیر قد، وزن، مهارت و واکسن را در یک پرونده می‌بینید؛ نه پراکنده در چند جا.',
        tone: 'mint'
    },
    {
        icon: faHeart,
        title: 'آرامش والدین',
        text: 'راهنمای سنی، یادآوری و محتوای آموزشی کنار هم هستند تا تصمیم‌گیری ساده‌تر شود.',
        tone: 'amber'
    },
    {
        icon: faStore,
        title: 'انتخاب مناسب سن',
        text: 'فروشگاه و مجله برای همه باز است؛ کالای رشدی و مطلب آموزشی هم‌مسیر با سن کودک.',
        tone: 'teal'
    }
];

const AboutPage = () => {
    const signedIn = isLoggedIn();

    return (
        <div className="dashboard-page about-page">
            <MainNavbar />
            <main className="dashboard-main">
                <section className="about-hero" aria-labelledby="about-hero-title">
                    <img
                        className="about-hero-photo"
                        src={HERO_PHOTO}
                        alt=""
                        onError={(event) => {
                            event.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="about-hero-wash" aria-hidden="true" />
                    <div className="about-hero-shapes" aria-hidden="true">
                        <span className="s1" />
                        <span className="s2" />
                        <span className="s3" />
                    </div>
                    <div className="about-hero-inner">
                        <div className="about-hero-copy">
                            <p className="eyebrow">
                                <BrandLogo size={28} alt="" className="about-hero-logo" />
                                درباره تات کیدز
                            </p>
                            <h1 id="about-hero-title">همراه رشد و سلامت کودک شما</h1>
                            <p>
                                تات کیدز جای والدین است برای دیدن مسیر رشد، واکسن، آموزش و خرید کالای مناسب سن کودک.
                                فروشگاه و مجله برای همه باز است؛ سرویس‌های شخصی بعد از ورود فعال می‌شوند.
                            </p>
                            <div className="home-about-actions">
                                {signedIn ? (
                                    <Link to="/my-children" className="home-about-btn home-about-btn-primary">
                                        سرویس‌های من
                                    </Link>
                                ) : (
                                    <Link to="/register" className="home-about-btn home-about-btn-primary">
                                        ورود و شروع سرویس
                                    </Link>
                                )}
                                <Link to="/shop" className="home-about-btn home-about-btn-ghost">مشاهده فروشگاه</Link>
                                <Link to="/news" className="home-about-btn home-about-btn-ghost">خواندن مجله</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="about-section">
                    <section className="about-story" aria-labelledby="about-story-title">
                        <div className="about-story-visuals">
                            <AboutHeroArt />
                            <AboutStoryArt />
                        </div>
                        <div>
                            <h2 id="about-story-title">یک پرونده، مسیر کامل رشد</h2>
                            <p>
                                به‌جای چند اپ جدا برای نمودار، واکسن و خرید، تات کیدز همه را کنار هم می‌گذارد.
                                رشد را ثبت می‌کنید، با منحنی استاندارد می‌سنجید، نوبت واکسن را از دست نمی‌دهید
                                و کالای مناسب سن را از فروشگاه انتخاب می‌کنید.
                            </p>
                            <p>
                                مجله سلامت هم برای مطالعه آزاد است؛ مقاله، ویدیو و پادکست آموزشی بدون ورود در دسترس است.
                            </p>
                        </div>
                    </section>

                    <section className="about-values" aria-labelledby="about-values-title">
                        <h2 id="about-values-title">چرا تات کیدز</h2>
                        <ul className="about-value-grid">
                            {VALUES.map((item) => (
                                <li key={item.title} className={`about-value-card is-${item.tone}`}>
                                    <span className="about-value-icon" aria-hidden="true">
                                        <FontAwesomeIcon icon={item.icon} />
                                    </span>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <HomeAbout showIntro={false} />

                <div className="about-section">
                    <section className="about-cta" aria-labelledby="about-cta-title">
                        <div>
                            <h2 id="about-cta-title">از همین‌جا شروع کنید</h2>
                            <p>سرویس‌های رشد را فعال کنید یا اول فروشگاه و مجله را بگردید.</p>
                        </div>
                        <div className="home-about-actions">
                            {signedIn ? (
                                <Link to="/my-children" className="home-about-btn home-about-btn-primary">
                                    رفتن به پرونده کودک
                                </Link>
                            ) : (
                                <Link to="/register" className="home-about-btn home-about-btn-primary">
                                    ورود / ثبت‌نام
                                </Link>
                            )}
                            <span className="about-cta-mark" aria-hidden="true">✦</span>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
