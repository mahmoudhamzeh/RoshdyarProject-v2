import React, { useState, useEffect } from 'react';
import './Carousel.css';

const images = [
    'https://placehold.co/1200x400/1565c0/ffffff?text=Banner+1',
    'https://placehold.co/1200x400/4CAF50/ffffff?text=Banner+2',
    'https://placehold.co/1200x400/f44336/ffffff?text=Banner+3',
];

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((src, i) => <img key={i} src={src} alt={`b${i}`} />)}
            </div>
        </div>
    );
};

export default Carousel;