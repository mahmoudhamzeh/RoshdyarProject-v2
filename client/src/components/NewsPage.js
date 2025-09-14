import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './NewsPage.css';

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('همه');

    const categories = ['همه', 'بیماری', 'آموزشی', 'تغذیه', 'مادر و کودک', 'تربیتی'];


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articlesRes, videosRes] = await Promise.all([
                    fetch('http://localhost:5000/api/news'),
                    fetch('http://localhost:5000/api/videos')
                ]);
                if (!articlesRes.ok || !videosRes.ok) throw new Error('Failed to fetch data');
                const articlesData = await articlesRes.json();
                const videosData = await videosRes.json();
                setArticles(articlesData);
                setVideos(videosData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredArticles = articles.filter(article =>
        selectedCategory === 'همه' || article.category === selectedCategory
    );

    const parentingArticles = articles.filter(article => article.category === 'تربیتی');

    return (
        <div>
            <Navbar />
            <main className="news-page-container">
                <header className="news-page-header">
                    <h1>اخبار و مقالات</h1>
                    <p>آخرین اخبار و مقالات آموزشی را در اینجا بیابید.</p>
                </header>

                <nav className="category-nav">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                     <a href="/" className="category-btn roshdyar-btn">رشد یار</a>
                </nav>

                <section className="news-section">
                    <h2>{selectedCategory === 'همه' ? 'جدیدترین مقالات' : `مقالات دسته ${selectedCategory}`}</h2>
                    <div className="articles-grid">
                        {loading && <p>در حال بارگذاری...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {filteredArticles.map(article => (
                            <Link to={`/news/${article.id}`} key={article.id} className="article-card">
                                <img src={article.imageUrl ? `http://localhost:5000${article.imageUrl}` : 'https://placehold.co/300x200/2c3e50/FFFFFF?text=مقاله'} alt={article.title} />
                                <div className="article-card-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.summary}</p>
                                    <span className="read-more">ادامه مطلب...</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="news-section">
                    <h2>موضوعات تربیتی</h2>
                    <div className="articles-grid">
                        {parentingArticles.length > 0 ? parentingArticles.map(article => (
                            <Link to={`/news/${article.id}`} key={article.id} className="article-card">
                                <img src={article.imageUrl ? `http://localhost:5000${article.imageUrl}` : 'https://placehold.co/300x200/2c3e50/FFFFFF?text=مقاله'} alt={article.title} />
                                <div className="article-card-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.summary}</p>
                                    <span className="read-more">ادامه مطلب...</span>
                                </div>
                            </Link>
                        )) : <p>مقاله‌ای در این دسته یافت نشد.</p>}
                    </div>
                </section>

                <section className="news-section">
                    <h2>ویدیوهای آموزشی</h2>
                    <div className="videos-grid">
                         {videos.map(video => (
                            <a href={video.url} key={video.id} target="_blank" rel="noopener noreferrer" className="video-card">
                                <div className="video-card-content">
                                    <h3>{video.title}</h3>
                                    <p>{video.summary}</p>
                                    <span className="watch-video">مشاهده ویدیو</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default NewsPage;
