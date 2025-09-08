import React from 'react';
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import './Carousel.css'; // Your custom styles

const Carousel = ({ slides = [] }) => {

    if (!slides || slides.length === 0) {
        return null; // Don't render anything if there are no slides
    }

    const handleItemClick = (index, item) => {
        // The library gives us the item clicked, which has the link property
        if (item.props.url) {
            // A simple redirect. For internal links, React Router's useHistory would be better.
            // Using window.open to open in a new tab if the link is external.
            if (item.props.url.startsWith('http')) {
                window.open(item.props.url, '_blank', 'noopener,noreferrer');
            } else {
                 window.location.href = item.props.url;
            }
        }
    }

    return (
        // The library's Carousel component handles all the state and sliding logic
        <ResponsiveCarousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            useKeyboardArrows
            autoPlay
            interval={5000}
            onClickItem={handleItemClick}
            className="presentation-mode"
        >
            {slides.map((slide) => (
                // The library expects simple children. We pass the link as a custom prop 'url'.
                <div key={slide.id} url={slide.link}>
                    <img src={slide.image} alt={slide.title} />
                    <p className="legend">{slide.title}</p>
                </div>
            ))}
        </ResponsiveCarousel>
    );
};

export default Carousel;