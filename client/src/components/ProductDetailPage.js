import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCartPlus,
    faChevronLeft,
    faStar,
    faThumbsDown,
    faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import MainNavbar from './MainNavbar';
import Footer from './Footer';
import ShopProductCard from './ShopProductCard';
import { addToCart, formatPrice } from '../utils/cart';
import { isLoggedIn, loginUrl } from '../api';
import { ageBandLabel, displayCommentAuthor, findCategoryPath, formatRating, stars } from '../utils/shop';
import ProductImageGallery from './ProductImageGallery';
import './ProductDetailPage.css';
import './ShopWorld.css';
import './ShopPage.css';

const API = '';
const TABS = [
    { id: 'intro', label: 'معرفی' },
    { id: 'specs', label: 'مشخصات' },
    { id: 'reviews', label: 'نظرات' }
];

const asProductList = (payload) => (Array.isArray(payload) ? payload : (payload && payload.items) || []);

const ProductDetailPage = () => {
    const { id } = useParams();
    const history = useHistory();
    const clickingTab = useRef(false);
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [rating, setRating] = useState(5);
    const [offerId, setOfferId] = useState(null);
    const [tab, setTab] = useState('intro');

    const loadComments = async () => {
        const res = await fetch(`${API}/api/shop/products/${id}/comments`);
        if (!res.ok) return;
        setComments(await res.json());
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            setSimilar([]);
            try {
                const [productRes, catRes] = await Promise.all([
                    fetch(`${API}/api/shop/products/${id}`),
                    fetch(`${API}/api/shop/categories`)
                ]);
                if (!productRes.ok) throw new Error('محصول یافت نشد');
                const data = await productRes.json();
                setProduct(data);
                setQuantity(1);
                setComments(data.comments || []);
                setOfferId(data.offerId || (data.offers && data.offers[0] && data.offers[0].id) || null);
                setTab('intro');
                if (catRes.ok) setCategories(await catRes.json());
            } catch (err) {
                setError(err.message || 'خطا در دریافت محصول');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (!product) return undefined;
        let cancelled = false;
        const loadSimilar = async () => {
            try {
                const qs = new URLSearchParams();
                if (product.category) qs.set('category', product.category);
                const res = await fetch(`${API}/api/shop/products?${qs.toString()}`);
                const list = asProductList(res.ok ? await res.json() : []);
                let next = list.filter((item) => Number(item.id) !== Number(product.id));
                if (next.length < 4) {
                    const extraRes = await fetch(`${API}/api/shop/products`);
                    const extra = asProductList(extraRes.ok ? await extraRes.json() : []);
                    extra.forEach((item) => {
                        if (Number(item.id) === Number(product.id)) return;
                        if (next.some((row) => Number(row.id) === Number(item.id))) return;
                        next.push(item);
                    });
                }
                if (!cancelled) setSimilar(next.slice(0, 8));
            } catch (err) {
                if (!cancelled) setSimilar([]);
            }
        };
        loadSimilar();
        return () => {
            cancelled = true;
        };
    }, [product]);

    useEffect(() => {
        if (!product) return undefined;
        const nodes = TABS.map((item) => document.getElementById(`product-${item.id}`)).filter(Boolean);
        if (!nodes.length) return undefined;
        const observer = new IntersectionObserver((entries) => {
            if (clickingTab.current) return;
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible && visible.target.dataset.tab) setTab(visible.target.dataset.tab);
        }, { rootMargin: '-28% 0px -55% 0px', threshold: [0.15, 0.4, 0.7] });
        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [product]);

    const selectedOffer = useMemo(
        () => (product && product.offers ? product.offers.find((item) => item.id === offerId) : null),
        [product, offerId]
    );
    const salePrice = selectedOffer ? selectedOffer.price : (product && product.price);
    const saleStock = selectedOffer ? selectedOffer.stock : (product && product.stock);
    const compareAt = selectedOffer ? selectedOffer.compareAtPrice : (product && product.compareAtPrice);
    const crumbs = useMemo(() => {
        if (!product) return [];
        const path = findCategoryPath(categories, product.category);
        if (path.length) return path;
        return product.category ? [{ name: product.category }] : [];
    }, [categories, product]);
    const ratingStats = useMemo(() => {
        const rated = comments.filter((item) => Number(item.rating) > 0);
        const counts = [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: rated.filter((item) => Number(item.rating) === star).length
        }));
        const avg = rated.length
            ? rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length
            : Number(product && product.ratingAvg) || 0;
        return { counts, avg, total: rated.length || Number(product && product.ratingCount) || 0 };
    }, [comments, product]);

    const handleAddToCart = () => {
        if (!product || saleStock < 1) return;
        addToCart({
            ...product,
            price: salePrice,
            stock: saleStock,
            compareAtPrice: compareAt,
            ...(selectedOffer ? {
                offerId: selectedOffer.id,
                vendorId: selectedOffer.vendorId,
                vendorName: selectedOffer.vendorName
            } : {})
        }, quantity);
        setMessage('محصول به سبد اضافه شد');
        window.setTimeout(() => setMessage(''), 2200);
    };

    const handleVote = async (commentId, vote) => {
        if (!isLoggedIn()) {
            history.push(loginUrl(`/shop/${id}`));
            return;
        }
        const current = comments.find((item) => item.id === commentId);
        const nextVote = current && current.myVote === vote ? 0 : vote;
        const res = await fetch(`${API}/api/shop/comments/${commentId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote: nextVote })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setMessage(data.message || 'برای رأی دادن وارد شوید');
            return;
        }
        setComments((prev) => prev.map((item) => (item.id === commentId ? data : item)));
    };

    const scrollToTab = (tabId) => {
        setTab(tabId);
        clickingTab.current = true;
        const node = document.getElementById(`product-${tabId}`);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => {
            clickingTab.current = false;
        }, 800);
    };

    const submitComment = async (event) => {
        event.preventDefault();
        if (!comment.trim()) return;
        const res = await fetch(`${API}/api/shop/products/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: comment.trim(), rating })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setMessage(data.message || 'ثبت نظر ناموفق بود');
            return;
        }
        setComment('');
        setMessage(data.message || 'نظر شما پس از تأیید کارشناس نمایش داده می‌شود');
        loadComments();
    };

    return (
        <div className="product-detail-page shop-world">
            <MainNavbar />
            <main className="product-detail-main">
                {product && (
                    <nav className="product-breadcrumb" aria-label="مسیر دسته محصول">
                        <Link to="/shop">فروشگاه</Link>
                        {crumbs.map((node) => (
                            <React.Fragment key={node.id || node.name}>
                                <FontAwesomeIcon icon={faChevronLeft} className="product-breadcrumb-sep" />
                                <Link to={`/shop?category=${encodeURIComponent(node.name)}`}>{node.name}</Link>
                            </React.Fragment>
                        ))}
                        <FontAwesomeIcon icon={faChevronLeft} className="product-breadcrumb-sep" />
                        <span aria-current="page">{product.name}</span>
                    </nav>
                )}

                {loading && <p className="shop-status">در حال بارگذاری...</p>}
                {error && <p className="shop-status shop-error">{error}</p>}

                {!loading && !error && product && (
                    <>
                        <article className="product-detail animate-fade-up">
                            <div className="product-detail-media">
                                <ProductImageGallery
                                    images={product.images}
                                    imageUrl={product.imageUrl}
                                    name={product.name}
                                    api={API}
                                />
                            </div>
                            <div className="product-detail-info">
                                <span className="product-detail-cat">{product.category}</span>
                                {product.ageBand && <span className="shop-age-badge">{ageBandLabel(product.ageBand)}</span>}
                                <h1>{product.name}</h1>
                                {(product.offers || []).length > 0 && (
                                    <div className="product-offers">
                                        <p>فروشندگان این کالا</p>
                                        {(product.offers || []).map((offer) => (
                                            <label key={offer.id} className={offerId === offer.id ? 'is-active' : ''}>
                                                <input
                                                    type="radio"
                                                    name="offer"
                                                    checked={offerId === offer.id}
                                                    onChange={() => {
                                                        setOfferId(offer.id);
                                                        setQuantity(1);
                                                    }}
                                                />
                                                {offer.vendorName} · {formatPrice(offer.price)}
                                                {offer.stock < 1 ? ' · ناموجود' : ''}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {product.ratingCount > 0 && (
                                    <p className="shop-rating">
                                        <strong className="shop-rating-num">{formatRating(product.ratingAvg)}</strong>
                                        {stars(product.ratingAvg)}
                                        <span> ({product.ratingCount})</span>
                                    </p>
                                )}
                                <p className="product-detail-price">
                                    {formatPrice(salePrice)}
                                    {compareAt > salePrice && (
                                        <span className="shop-price-was"> {formatPrice(compareAt)}</span>
                                    )}
                                </p>
                                <div className="shop-chip-row">
                                    {(product.skills || []).map((skill) => (
                                        <span key={skill.slug || skill.id} className="shop-skill-tag">{skill.title}</span>
                                    ))}
                                </div>
                                {product.safetyWarning && (
                                    <p className="product-safety">{product.safetyWarning}</p>
                                )}
                                <p className={`product-detail-stock ${saleStock > 0 ? 'in-stock' : 'out-stock'}`}>
                                    {saleStock > 0 ? `موجودی: ${saleStock} عدد` : 'این محصول فعلاً ناموجود است'}
                                </p>

                                {saleStock > 0 && (
                                    <div className="product-detail-actions">
                                        <label>
                                            تعداد
                                            <input
                                                type="number"
                                                min="1"
                                                max={saleStock}
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10) || 1;
                                                    setQuantity(Math.min(Math.max(val, 1), saleStock));
                                                }}
                                            />
                                        </label>
                                        <button type="button" className="product-add-btn" onClick={handleAddToCart}>
                                            <FontAwesomeIcon icon={faCartPlus} />
                                            افزودن به سبد
                                        </button>
                                        <button
                                            type="button"
                                            className="product-cart-link"
                                            onClick={() => history.push('/cart')}
                                        >
                                            مشاهده سبد
                                        </button>
                                    </div>
                                )}
                                {message && <p className="product-toast">{message}</p>}
                            </div>
                        </article>

                        <div className="product-tab-bar" role="tablist" aria-label="بخش‌های محصول">
                            {TABS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === item.id}
                                    className={tab === item.id ? 'is-active' : ''}
                                    onClick={() => scrollToTab(item.id)}
                                >
                                    {item.label}
                                    {item.id === 'reviews' && comments.length > 0 ? ` (${comments.length})` : ''}
                                </button>
                            ))}
                        </div>

                        <section
                            className="product-section"
                            id="product-intro"
                            data-tab="intro"
                            aria-labelledby="product-intro-title"
                        >
                            <h2 id="product-intro-title">معرفی محصول</h2>
                            <p className="product-detail-desc">
                                {product.description || 'توضیحی برای این محصول ثبت نشده است.'}
                            </p>
                        </section>

                        <section
                            className="product-section"
                            id="product-specs"
                            data-tab="specs"
                            aria-labelledby="product-specs-title"
                        >
                            <h2 id="product-specs-title">مشخصات</h2>
                            <dl className="product-specs">
                                <div>
                                    <dt>دسته‌بندی</dt>
                                    <dd>{product.category || '—'}</dd>
                                </div>
                                <div>
                                    <dt>گروه سنی</dt>
                                    <dd>{product.ageBand ? ageBandLabel(product.ageBand) : '—'}</dd>
                                </div>
                                <div>
                                    <dt>برند</dt>
                                    <dd>{product.brand || '—'}</dd>
                                </div>
                                <div>
                                    <dt>مهارت‌ها</dt>
                                    <dd>
                                        {(product.skills || []).map((skill) => skill.title).join('، ') || '—'}
                                    </dd>
                                </div>
                                {product.safetyWarning && (
                                    <div>
                                        <dt>ایمنی</dt>
                                        <dd>{product.safetyWarning}</dd>
                                    </div>
                                )}
                                {(product.offers || []).length > 0 && (
                                    <div>
                                        <dt>فروشندگان</dt>
                                        <dd>{product.offers.map((offer) => offer.vendorName).join('، ')}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        <section
                            className="product-section product-reviews"
                            id="product-reviews"
                            data-tab="reviews"
                            aria-labelledby="product-reviews-title"
                        >
                            <h2 id="product-reviews-title">نظر کاربران</h2>
                            <div className="product-reviews-grid">
                                <div className="product-review-summary">
                                    <p className="product-review-score">
                                        <strong>{formatRating(ratingStats.avg)}</strong>
                                        <span>از ۵</span>
                                    </p>
                                    <p className="shop-rating" aria-hidden="true">{stars(ratingStats.avg)}</p>
                                    <p className="product-review-count">
                                        {ratingStats.total ? `${ratingStats.total} امتیاز ثبت‌شده` : 'هنوز امتیازی ثبت نشده'}
                                    </p>
                                    <ul className="product-review-bars">
                                        {ratingStats.counts.map((row) => {
                                            const pct = ratingStats.total ? Math.round((row.count / ratingStats.total) * 100) : 0;
                                            return (
                                                <li key={row.star}>
                                                    <span>{row.star} ستاره</span>
                                                    <div className="product-review-bar" aria-hidden="true">
                                                        <i style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span>{row.count}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {isLoggedIn() ? (
                                    <form className="product-review-form" onSubmit={submitComment}>
                                        <h3>نظر خود را بنویسید</h3>
                                        <p>امتیاز شما</p>
                                        <div className="shop-stars-input" role="radiogroup" aria-label="امتیاز">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    className={value <= rating ? 'is-on' : ''}
                                                    onClick={() => setRating(value)}
                                                    aria-label={`${value} ستاره`}
                                                >
                                                    <FontAwesomeIcon icon={faStar} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows="4"
                                            placeholder="کیفیت، مناسب بودن سن، یا تجربه استفاده‌تان را بنویسید"
                                        />
                                        <button type="submit">ثبت نظر</button>
                                    </form>
                                ) : (
                                    <div className="product-review-login">
                                        <h3>برای ثبت نظر وارد شوید</h3>
                                        <p>بعد از ورود می‌توانید امتیاز و دیدگاه بگذارید.</p>
                                        <Link to={loginUrl(`/shop/${id}`)} className="product-add-btn">ورود / ثبت‌نام</Link>
                                    </div>
                                )}
                            </div>

                            {comments.length === 0 ? (
                                <p className="product-reviews-empty">هنوز نظر تأیید‌شده‌ای ثبت نشده است. اولین نفر باشید.</p>
                            ) : (
                                <ul className="product-comment-list">
                                    {comments.map((item) => {
                                        const author = displayCommentAuthor(item);
                                        return (
                                            <li key={item.id}>
                                                <article className="product-comment">
                                                    <span className="product-comment-avatar" aria-hidden="true">
                                                        {author.charAt(0)}
                                                    </span>
                                                    <div className="product-comment-body">
                                                        <header>
                                                            <strong>{author}</strong>
                                                            {item.createdAt && (
                                                                <time dateTime={item.createdAt}>
                                                                    {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                                                                </time>
                                                            )}
                                                        </header>
                                                        {item.rating ? (
                                                            <p className="shop-rating">
                                                                <strong className="shop-rating-num">{formatRating(item.rating)}</strong>
                                                                {stars(item.rating)}
                                                            </p>
                                                        ) : null}
                                                        <p>{item.body}</p>
                                                        <div className="product-comment-votes">
                                                            <button
                                                                type="button"
                                                                className={item.myVote === 1 ? 'is-on' : ''}
                                                                onClick={() => handleVote(item.id, 1)}
                                                                aria-label="پسندیدن نظر"
                                                            >
                                                                <FontAwesomeIcon icon={faThumbsUp} />
                                                                {item.likeCount || 0}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={item.myVote === -1 ? 'is-on is-down' : ''}
                                                                onClick={() => handleVote(item.id, -1)}
                                                                aria-label="نپسندیدن نظر"
                                                            >
                                                                <FontAwesomeIcon icon={faThumbsDown} />
                                                                {item.dislikeCount || 0}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>

                        {similar.length > 0 && (
                            <section className="product-similar" aria-labelledby="product-similar-title">
                                <div className="shop-section-title">
                                    <h2 id="product-similar-title">کالای مشابه</h2>
                                    {product.category && (
                                        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>مشاهده گروه</Link>
                                    )}
                                </div>
                                <div className="shop-grid">
                                    {similar.map((item, index) => (
                                        <ShopProductCard key={item.id} product={item} index={index} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetailPage;
