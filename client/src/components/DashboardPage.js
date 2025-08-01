import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Carousel from './Carousel';
import ServiceTiles from './ServiceTiles';
import ContentRow from './ContentRow';

const mockVideos = Array.from({ length: 8 }, (_, i) => ({
    id: i, title: `ویدیو آموزشی ${i + 1}`,
    image: `https://placehold.co/220x140/4CAF50/FFFFFF?text=ویدیو+${i+1}`
}));

const mockArticles = Array.from({ length: 8 }, (_, i) => ({
    id: i, title: `مقاله شماره ${i + 1}`,
    image: `https://placehold.co/220x140/f44336/FFFFFF?text=مقاله+${i+1}`
}));

const DashboardPage = () => {

    return (
        <div>
            <Navbar />
            <main>
                <Carousel />
                <ServiceTiles />

                <ContentRow title="ویدیوهای آموزشی و تربیتی" items={mockVideos} />
                <ContentRow title="جدیدترین مقالات" items={mockArticles} />
            </main>
            <Footer />
        </div>
    );
};

export default DashboardPage;
