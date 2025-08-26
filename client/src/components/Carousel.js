import React, { useState, useEffect } from 'react';
import './Carousel.css';

const slides = [
    {
        image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        title: 'به سامانه رشد خوش آمدید',
        subtitle: 'محلی برای پایش و مراقبت از سلامت فرزندان شما'
    },
    {
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        title: 'نمودارهای رشد استاندارد',
        subtitle: 'بر اساس آخرین داده‌های سازمان بهداشت جهانی'
    },
    {
        image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        title: 'یادآور واکسیناسیون',
        subtitle: 'دیگر هیچ واکسنی را فراموش نخواهید کرد'
    }
];

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slides.map((slide, i) => (
                    <div className="carousel-item" key={i}>
                        <img src={slide.image} alt={slide.title} />
                        <div className="carousel-caption">
                            <h2>{slide.title}</h2>
                            <p>{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;