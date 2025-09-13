import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './NewsPage.css';

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/news');
                if (!response.ok) throw new Error('Failed to fetch articles');
                const data = await response.json();
                setArticles(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    return (
        <div>
            <Navbar />
            <main className="news-page-container">
                <header className="news-page-header">
                    <h1>اخبار و مقالات</h1>
                    <p>آخرین اخبار و مقالات آموزشی را در اینجا بیابید.</p>
                </header>
                <div className="articles-grid">
                    {loading && <p>در حال بارگذاری مقالات...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {articles.map(article => (
                        <Link to={`/news/${article.id}`} key={article.id} className="article-card">
                            <img src={article.imageUrl ? article.imageUrl : 'https://placehold.co/300x200/2c3e50/FFFFFF?text=مقاله'} alt={article.title} />
                            <div className="article-card-content">
                                <h3>{article.title}</h3>
                                <p>{article.summary}</p>
                                <span className="read-more">ادامه مطلب...</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NewsPage;
