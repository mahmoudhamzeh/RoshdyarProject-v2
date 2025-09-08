import React, { useState, useEffect } from 'react';
import './Carousel.css';

// Using a simple default for structure, but it will be replaced by props.
const defaultSlides = [
    { id: 1, image: 'https://placehold.co/1200x400/cccccc/ffffff?text=Default+Slide' }
];

const Carousel = ({ slides = defaultSlides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (slides.length < 2) return; // No need to slide if there's only one or zero slides
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    if (!slides || slides.length === 0) {
        return null; // Don't render anything if there are no slides
    }

    return (
        <div className="carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slides.map((slide) => (
                    <div className="carousel-item" key={slide.id || slide.title}>
                        <img src={slide.image} alt={slide.title || 'Banner Image'} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;