import React from 'react';
import { Link } from 'react-router-dom';
import { postHref } from '../../utils/magazine';

const AuthorBox = ({ authors = [] }) => {
    if (!authors.length) return null;
    return (
        <section className="magazine-authors">
            {authors.map((author) => (
                <article key={author.id} className="magazine-author-card">
                    {author.photoUrl ? (
                        <img src={author.photoUrl} alt="" loading="lazy" decoding="async" />
                    ) : (
                        <div className="magazine-author-fallback" aria-hidden="true">{(author.firstName || 'ن').slice(0, 1)}</div>
                    )}
                    <div>
                        <h3>{author.fullName}</h3>
                        {author.specialty && <p className="magazine-author-role">{author.specialty}</p>}
                        {author.bio && <p>{author.bio}</p>}
                        <Link to={`/news/author/${author.slug}`}>سایر مقالات این نویسنده</Link>
                    </div>
                </article>
            ))}
        </section>
    );
};

export const RelatedArticles = ({ items = [] }) => {
    if (!items.length) return null;
    return (
        <section className="magazine-related">
            <h2>مقالات مرتبط</h2>
            <div className="magazine-related-grid">
                {items.map((item) => (
                    <Link key={item.id} to={postHref(item)} className="magazine-related-card">
                        {item.featuredImageUrl && (
                            <img src={item.featuredImageUrl} alt="" loading="lazy" decoding="async" />
                        )}
                        <div>
                            {item.categoryName && <span>{item.categoryName}</span>}
                            <h3>{item.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default AuthorBox;
