import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './NewsPage.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const query = useQuery();
    const selectedCategory = query.get('category') || 'همه';


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
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
    }, [selectedCategory]);

    const filteredArticles = articles.filter(article =>
        selectedCategory === 'همه' || article.category === selectedCategory
    );

    const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
    const otherArticles = filteredArticles.slice(1);
    const parentingArticles = articles.filter(article => article.category === 'تربیتی');

    return (
        <div>
            <Navbar />
            <main className="news-page-container">
                <header className="news-page-header">
                    <h1>مجله سلامت رشد‌یار</h1>
                    <p>جدیدترین مقالات، ویدیوها و توصیه‌های تخصصی برای والدین</p>
                </header>

                {loading && <p>در حال بارگذاری...</p>}
                {error && <p className="error-message">{error}</p>}

                {featuredArticle && selectedCategory === 'همه' && (
                    <section className="featured-article-section">
                        <Link to={`/news/${featuredArticle.id}`} className="featured-article-card">
                            <img src={featuredArticle.imageUrl ? `http://localhost:5000${featuredArticle.imageUrl}` : 'https://placehold.co/600x400/3498db/FFFFFF?text=مقاله+ویژه'} alt={featuredArticle.title} />
                            <div className="featured-article-content">
                                <span className="featured-badge">مقاله ویژه</span>
                                <h3>{featuredArticle.title}</h3>
                                <p>{featuredArticle.summary}</p>
                            </div>
                        </Link>
                    </section>
                )}

                <section className="news-section">
                     <h2>{selectedCategory === 'همه' ? 'آخرین مقالات' : `مقالات دسته ${selectedCategory}`}</h2>
                    <div className="articles-grid">
                        {(selectedCategory === 'همه' ? otherArticles : filteredArticles).map(article => (
                            <Link to={`/news/${article.id}`} key={article.id} className="article-card">
                                <img src={article.imageUrl ? `http://localhost:5000${article.imageUrl}` : 'https://placehold.co/300x200/2c3e50/FFFFFF?text=مقاله'} alt={article.title} />
                                <div className="article-card-content">
                                    <h3>{article.title}</h3>
                                     <p className="article-category-badge">{article.category}</p>
                                    <p className="article-summary">{article.summary}</p>
                                    <span className="read-more">ادامه مطلب...</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {parentingArticles.length > 0 && selectedCategory === 'همه' && (
                    <section className="news-section">
                        <h2>موضوعات تربیتی</h2>
                        <div className="articles-grid">
                            {parentingArticles.map(article => (
                                <Link to={`/news/${article.id}`} key={article.id} className="article-card">
                                    <img src={article.imageUrl ? `http://localhost:5000${article.imageUrl}` : 'https://placehold.co/300x200/2c3e50/FFFFFF?text=مقاله'} alt={article.title} />
                                    <div className="article-card-content">
                                        <h3>{article.title}</h3>
                                        <p className="article-category-badge">{article.category}</p>
                                        <p className="article-summary">{article.summary}</p>
                                        <span className="read-more">ادامه مطلب...</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}


                {videos.length > 0 && (
                    <section className="news-section">
                        <h2>ویدیوهای آموزشی</h2>
                        <div className="videos-grid">
                             {videos.map(video => (
                                <a href={video.url} key={video.id} target="_blank" rel="noopener noreferrer" className="video-card">
                                    <div className="video-play-icon">▶</div>
                                    <div className="video-card-content">
                                        <h3>{video.title}</h3>
                                        <p>{video.summary}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </div>
    );
};

export default NewsPage;
