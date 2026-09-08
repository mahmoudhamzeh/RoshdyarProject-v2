import React, { useEffect, useState } from 'react';
import { formatPrice } from '../utils/cart';
import { ageBandLabel } from '../utils/shop';
import ProductImageGallery from './ProductImageGallery';
import './ProductDetailPage.css';

const VendorCatalogPick = ({ catalogChoices, catalogQ, setCatalogQ, offerForm, setOfferForm, onSubmit }) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const id = offerForm.productId;
        if (!id) {
            setPreview(null);
            return undefined;
        }
        let cancelled = false;
        setLoading(true);
        fetch(`/api/shop/products/${id}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!cancelled) setPreview(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [offerForm.productId]);

    const selectProduct = (item) => {
        setOfferForm((prev) => ({
            ...prev,
            productId: String(item.id),
            price: prev.price || String(item.price || ''),
            stock: prev.stock || String(item.stock || '')
        }));
    };

    return (
        <form className="product-form vendor-form vendor-catalog-pick" onSubmit={onSubmit}>
            <h3>فروش محصول موجود</h3>
            <p className="vendor-required-hint">محصول را انتخاب کنید تا عکس، توضیح، گروه و مشخصات کامل را ببینید؛ بعد قیمت و موجودی خودتان را بگذارید.</p>
            <input
                value={catalogQ}
                onChange={(e) => setCatalogQ(e.target.value)}
                placeholder="جستجوی نام یا توضیح محصول"
            />
            <div className="vendor-catalog-grid">
                {catalogChoices.length === 0 && <p>محصولی با این جستجو پیدا نشد.</p>}
                {catalogChoices.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`vendor-catalog-card${String(offerForm.productId) === String(item.id) ? ' is-on' : ''}`}
                        onClick={() => selectProduct(item)}
                    >
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                        ) : (
                            <span className="vendor-catalog-placeholder">بدون عکس</span>
                        )}
                        <strong>{item.name}</strong>
                        <small>{item.category} · {formatPrice(item.price)}</small>
                    </button>
                ))}
            </div>

            {loading && <p>در حال بارگذاری محتوای محصول...</p>}
            {preview && (
                <article className="vendor-catalog-preview">
                    <h4>محتوای کامل محصول</h4>
                    <ProductImageGallery
                        images={preview.images || []}
                        imageUrl={preview.imageUrl}
                        name={preview.name}
                    />
                    <h3>{preview.name}</h3>
                    <p className="vendor-catalog-meta">
                        گروه: {preview.category || '—'}
                        {preview.brand ? ` · برند ${preview.brand}` : ''}
                        {preview.ageBand ? ` · رده سنی ${ageBandLabel(preview.ageBand)}` : ''}
                    </p>
                    <p className="vendor-catalog-desc">{preview.description || 'توضیحی ثبت نشده است.'}</p>
                    {(preview.skills || []).length > 0 && (
                        <p>مهارت‌ها: {(preview.skills || []).map((skill) => skill.title).join('، ')}</p>
                    )}
                    {preview.safetyWarning ? <p>ایمنی: {preview.safetyWarning}</p> : null}
                    <p>
                        قیمت فعلی فروشگاه: {formatPrice(preview.price)}
                        {preview.compareAtPrice ? ` · قبل از تخفیف ${formatPrice(preview.compareAtPrice)}` : ''}
                        {' · '}
                        موجودی مرجع: {preview.stock}
                    </p>
                    {(preview.offers || []).length > 0 && (
                        <p>فروشندگان فعلی: {preview.offers.map((offer) => `${offer.vendorName} (${formatPrice(offer.price)})`).join('، ')}</p>
                    )}
                    {(preview.comments || []).length > 0 && (
                        <ul className="vendor-catalog-comments">
                            {(preview.comments || []).slice(0, 5).map((item) => (
                                <li key={item.id}>{item.author}: {item.body}</li>
                            ))}
                        </ul>
                    )}
                </article>
            )}

            <div className="product-form-row">
                <input
                    value={offerForm.price}
                    onChange={(e) => setOfferForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="قیمت فروش شما"
                    required
                />
                <input
                    value={offerForm.stock}
                    onChange={(e) => setOfferForm((p) => ({ ...p, stock: e.target.value }))}
                    placeholder="موجودی"
                    required
                />
            </div>
            <input type="hidden" value={offerForm.productId} required />
            <button type="submit" disabled={!offerForm.productId}>ثبت قیمت و موجودی</button>
        </form>
    );
};

export default VendorCatalogPick;
