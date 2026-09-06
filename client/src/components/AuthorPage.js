import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NewsHeader from './NewsHeader';
import Footer from './Footer';
import { postHref, typeLabel } from '../utils/magazine';
import './NewsPage.css';
import './magazine/Magazine.css';

const AuthorPage = () => {
    const { slug } = useParams();
    const [author, setAuthor] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/magazine/authors/${slug}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error('نویسنده یافت نشد'))))
            .then(setAuthor)
            .catch((err) => setError(err.message));
    }, [slug]);

    return (
        <div>
            <NewsHeader />
            <main className="news-page-container">
                {error && <p className="error-message">{error}</p>}
                {author && (
                    <>
                        <header className="news-page-header">
                            {author.photoUrl && <img src={author.photoUrl} alt="" width="96" height="96" style={{ borderRadius: '50%' }} />}
                            <h1>{author.fullName}</h1>
                            <p>{author.specialty}</p>
                            {author.bio && <p>{author.bio}</p>}
                        </header>
                        <div className="articles-list">
                            {(author.posts || []).map((post) => (
                                <Link key={post.id} to={postHref(post)} className="article-list-item">
                                    <img src={post.featuredImageUrl} alt="" loading="lazy" />
                                    <div className="article-list-item-content">
                                        <span className="article-type-badge">{typeLabel(post.type)}</span>
                                        <h3>{post.title}</h3>
                                        <p className="article-summary">{post.summary}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AuthorPage;
