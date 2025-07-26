import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceTiles.css';

const services = [
    { name: 'کودکان من', icon: '👶', link: '/my-children' },
    { name: 'نمودار رشد', icon: '📈', link: '/my-children' },
    { name: 'واکسیناسیون', icon: '💉', link: '#' },
    { name: 'مشاوره با متخصص', icon: '👨‍⚕️', link: '#' },
    { name: 'مشاوره روانشناسی', icon: '🧠', link: '#' },
    { name: 'آزمایش در محل', icon: '🔬', link: '#' },
    { name: 'فروشگاه', icon: '🛒', link: '#' },
    { name: 'سرگرمی', icon: '🎮', link: '#' },
];

const ServiceTiles = () => {
    return (
        <div className="tiles-container">
            {services.map(service => (
                <Link to={service.link} key={service.name} className="tile-link">
                    <div className="tile">
                        <div className="tile-icon">{service.icon}</div>
                        <div className="tile-name">{service.name}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ServiceTiles;