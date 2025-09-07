import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Carousel.css';

const defaultSlides = [
    {
        image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        title: 'به سامانه رشد خوش آمدید',
        subtitle: 'محلی برای پایش و مراقبت از سلامت فرزندان شما',
        link: '/about'
    },
    {
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        title: 'نمودارهای رشد استاندارد',
        subtitle: 'بر اساس آخرین داده‌های سازمان بهداشت جهانی',
        link: '/my-children'
    }
];

const Carousel = ({ slides = defaultSlides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (slides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    if (slides.length === 0) {
        return null; // Don't render anything if there are no slides
    }

    const handleImageError = (e) => {
        e.target.onerror = null; // prevent infinite loop
        e.target.src = 'https://placehold.co/1200x400/cccccc/ffffff?text=Image+Not+Found';
    };

    return (
        <div className="carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slides.map((slide) => {
                    const slideContent = (
                        <>
                            <img src={slide.image} alt={slide.title} onError={handleImageError} />
                            <div className="carousel-caption">
                                <h2>{slide.title}</h2>
                                {slide.subtitle && <p>{slide.subtitle}</p>}
                            </div>
                        </>
                    );

                    return (
                        <div className="carousel-item" key={slide.id || slide.title}>
                            {slide.link ? (
                                <Link to={slide.link}>{slideContent}</Link>
                            ) : (
                                <div>{slideContent}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Carousel;