import React, { useState, useEffect } from 'react';
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
    const [banners, setBanners] = useState([]);
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Banners
            try {
                const bannersResponse = await fetch('http://localhost:5000/api/banners');
                if (bannersResponse.ok) {
                    const data = await bannersResponse.json();
                    const formattedBanners = data.map(banner => ({
                        image: `http://localhost:5000${banner.imageUrl}`,
                        title: banner.title,
                        link: banner.link,
                    }));
                    setBanners(formattedBanners);
                }
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            }

            // Fetch Articles
            try {
                const articlesResponse = await fetch('http://localhost:5000/api/news');
                if (articlesResponse.ok) {
                    const data = await articlesResponse.json();
                    const formattedArticles = data.slice(0, 8).map(article => ({ // Take first 8
                        id: article.id,
                        title: article.title,
                        image: article.imageUrl ? `http://localhost:5000${article.imageUrl}` : `https://placehold.co/220x140/f44336/FFFFFF?text=مقاله`,
                        link: `/news/${article.id}`
                    }));
                    setArticles(formattedArticles);
                }
            } catch (error) {
                console.error("Failed to fetch articles:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <Navbar />
            <main>
                <Carousel slides={banners} />
                <ServiceTiles />

                <ContentRow title="ویدیوهای آموزشی و تربیتی" items={mockVideos} />
                <ContentRow title="جدیدترین مقالات" items={articles} viewAllLink="/news" />
            </main>
            <Footer />
        </div>
    );
};

export default DashboardPage;
