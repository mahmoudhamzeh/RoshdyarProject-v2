import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxOpen,
    faBuilding,
    faChartLine,
    faClipboardList,
    faStore,
    faUser,
    faWallet
} from '@fortawesome/free-solid-svg-icons';
import MainNavbar from './MainNavbar';
import Footer from './Footer';
import { formatPrice } from '../utils/cart';
import { findCategoryPath } from '../utils/shop';
import {
    IRAN_BANKS,
    digitsOnly,
    shebaDigits,
    identityFieldErrors,
    financeFieldErrors
} from '../utils/vendor-apply';
import { VENDOR_TERMS } from '../utils/vendor-terms';
import { clearAuthSession } from '../api';
import CategoryCascade from './CategoryCascade';
import CitySelector from './CitySelector';
import './ShopWorld.css';
import './VendorPanelPage.css';
import './admin/ProductManagement.css';

const DOC_KINDS = [
    { id: 'national_card', label: 'کارت ملی / شناسنامه' },
    { id: 'company_id', label: 'آگهی تأسیس / شناسه ملی' },
    { id: 'business_license', label: 'جواز کسب یا پروانه' },
    { id: 'bank_certificate', label: 'تأییدیه شبا / کارت بانکی' },
    { id: 'other', label: 'سایر مدارک' }
];

const LINE_STATUSES = [
    { id: 'pending', label: 'ثبت‌شده' },
    { id: 'preparing', label: 'در حال آماده‌سازی' },
    { id: 'shipped', label: 'ارسال‌شده' },
    { id: 'delivered', label: 'تحویل‌شده' },
    { id: 'cancelled', label: 'لغو' }
];

const STATUS_LABELS = {
    draft: 'پیش‌نویس',
    pending: 'در انتظار تأیید',
    returned: 'برگشت‌خورده',
    docs_requested: 'نیاز به مدرک تکمیلی',
    active: 'تأییدشده',
    suspended: 'تعلیق‌شده',
    rejected: 'رد شده'
};

const PRODUCT_REVIEW_LABELS = {
    pending: 'در انتظار تأیید ادمین',
    approved: 'تأییدشده و در فروش',
    rejected: 'رد شده',
    needs_revision: 'نیاز به اصلاح'
};
    displayName: '',
    personKind: 'individual',
    ownerName: '',
    nationalId: '',
    legalName: '',
    registrationNo: '',
    economicCode: '',
    phone: '',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    bankName: '',
    bankSheba: '',
    bankAccount: '',
    website: '',
    instagram: '',
    phone2: '',
    docsNote: ''
};

const Field = ({ label, error, required, children }) => (
    <label className={`vendor-label${error ? ' is-invalid' : ''}`}>
        {label}{required ? ' *' : ''}
        {children}
        {error ? <span className="vendor-field-error">{error}</span> : null}
    </label>
);

const VendorPanelPage = () => {
    const history = useHistory();
    const [me, setMe] = useState(null);
    const [form, setForm] = useState(emptyApply);
    const [step, setStep] = useState(1);
    const [tab, setTab] = useState('products');
    const [listings, setListings] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [catalogQ, setCatalogQ] = useState('');
    const [productMode, setProductMode] = useState('existing');
    const [offerForm, setOfferForm] = useState({ productId: '', price: '', stock: '' });
    const [reviseId, setReviseId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [finance, setFinance] = useState(null);
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [messageError, setMessageError] = useState(false);
    const [docKind, setDocKind] = useState('national_card');
    const [docFiles, setDocFiles] = useState(null);
    const [showIdentityErrors, setShowIdentityErrors] = useState(false);
    const [showFinanceErrors, setShowFinanceErrors] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [pendingModal, setPendingModal] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '', description: '', category: '', price: '', stock: '', compareAtPrice: '', images: null
    });

    const notify = (text, isError = false) => {
        setMessage(text);
        setMessageError(isError);
    };

    const load = async () => {
        const vendor = await fetch('/api/shop/vendors/me').then((r) => (r.ok ? r.json() : null));
        setMe(vendor);
        if (vendor) {
            setForm((prev) => ({
                ...prev,
                displayName: vendor.displayName || '',
                personKind: vendor.personKind || 'individual',
                ownerName: vendor.ownerName || '',
                nationalId: vendor.nationalId || '',
                legalName: vendor.legalName || '',
                registrationNo: vendor.registrationNo || '',
                economicCode: vendor.economicCode || '',
                phone: vendor.phone || '',
                province: vendor.province || '',
                city: vendor.city || '',
                address: vendor.address || '',
                postalCode: vendor.postalCode || '',
                bankName: vendor.bankName || '',
                bankSheba: vendor.bankSheba || '',
                bankAccount: vendor.bankAccount || '',
                website: vendor.website || '',
                instagram: vendor.instagram || '',
                phone2: vendor.phone2 || '',
                docsNote: vendor.docsNote || ''
            }));
        }
        const cats = await fetch('/api/shop/categories').then((r) => (r.ok ? r.json() : []));
        setCategories(Array.isArray(cats) ? cats : (cats.tree || []));
        if (vendor && vendor.status === 'active') {
            const [offerRes, orderRes, financeRes] = await Promise.all([
                fetch('/api/vendor/offers'),
                fetch('/api/vendor/orders'),
                fetch('/api/vendor/finance')
            ]);
            setListings(offerRes.ok ? await offerRes.json() : []);
            setOrders(orderRes.ok ? await orderRes.json() : []);
            setFinance(financeRes.ok ? await financeRes.json() : null);
            const catRes = await fetch('/api/shop/products');
            if (catRes.ok) {
                const payload = await catRes.json();
                setCatalog(Array.isArray(payload) ? payload : (payload.items || payload.data || []));
            }
        }
    };

    useEffect(() => {
        load();
    }, []);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const identityErr = identityFieldErrors(form);
    const financeErr = financeFieldErrors(form);
    const shownIdentity = showIdentityErrors ? identityErr : {};
    const shownFinance = showFinanceErrors ? financeErr : {};

    const goFinance = () => {
        const errors = identityFieldErrors(form);
        if (Object.keys(errors).length) {
            setShowIdentityErrors(true);
            notify(Object.values(errors)[0], true);
            return;
        }
        notify('');
        setStep(2);
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        const idErr = identityFieldErrors(form);
        const finErr = financeFieldErrors(form);
        if (Object.keys(idErr).length || Object.keys(finErr).length) {
            setShowIdentityErrors(true);
            setShowFinanceErrors(true);
            notify(Object.values({ ...idErr, ...finErr })[0], true);
            if (Object.keys(idErr).length) setStep(1);
            return;
        }
        const res = await fetch('/api/shop/vendors/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                bankSheba: `IR${shebaDigits(form.bankSheba)}`
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify(data.message || 'ثبت اطلاعات ناموفق بود', true);
            return;
        }
        setMe(data);
        notify('اطلاعات ذخیره شد.');
        setStep(3);
    };

    const uploadDocs = async (e) => {
        e.preventDefault();
        if (!docFiles || !docFiles.length) {
            notify('دست‌کم یک فایل انتخاب کنید', true);
            return;
        }
        const body = new FormData();
        Array.from(docFiles).forEach((file) => body.append('docs', file));
        body.append('kind', docKind);
        const res = await fetch('/api/shop/vendors/me/docs', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify(data.message || 'بارگذاری مدرک ناموفق بود', true);
            return;
        }
        setMe(data);
        setDocFiles(null);
        notify('مدرک ثبت شد. پس از تکمیل مدارک، شرایط را تأیید کنید.');
    };

    const submitRequest = async () => {
        if (!termsOpen) {
            notify('ابتدا شرایط و قوانین را باز کنید و مطالعه کنید', true);
            return;
        }
        if (!termsAccepted) {
            notify('تأیید مطالعه شرایط و قوانین الزامی است', true);
            return;
        }
        const res = await fetch('/api/shop/vendors/me/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ termsAccepted: true })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify(data.message || 'ارسال درخواست ناموفق بود', true);
            return;
        }
        setMe(data);
        setPendingModal(true);
        notify('');
    };

    const createOffer = async (e) => {
        e.preventDefault();
        if (!offerForm.productId) {
            notify('یک محصول موجود انتخاب کنید', true);
            return;
        }
        const res = await fetch('/api/vendor/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(offerForm)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify(data.message || 'ثبت قیمت و موجودی ناموفق بود', true);
            return;
        }
        setOfferForm({ productId: '', price: '', stock: '' });
        load();
        notify('قیمت و موجودی این محصول برای فروشگاه شما ثبت شد.');
    };

    const createProduct = async (e) => {
        e.preventDefault();
        const path = findCategoryPath(categories, productForm.category);
        const leaf = path[path.length - 1];
        if (!productForm.category || (leaf && (leaf.children || []).length)) {
            notify('گروه و زیرگروه محصول را تا آخرین سطح انتخاب کنید.', true);
            return;
        }
        if (!productForm.images || !productForm.images.length) {
            notify('دست‌کم یک عکس محصول بارگذاری کنید', true);
            return;
        }
        if (!String(productForm.description || '').trim() || String(productForm.description).trim().length < 10) {
            notify('توضیحات کامل محصول را بنویسید', true);
            return;
        }
        const body = new FormData();
        Object.entries(productForm).forEach(([key, value]) => {
            if (key !== 'images' && value != null) body.append(key, value);
        });
        if (productForm.images) {
            Array.from(productForm.images).forEach((file) => body.append('images', file));
        }
        const url = reviseId ? `/api/vendor/products/${reviseId}` : '/api/vendor/products';
        const res = await fetch(url, { method: reviseId ? 'PUT' : 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify(data.message || 'ثبت محصول ناموفق بود', true);
            return;
        }
        setProductForm({ name: '', description: '', category: '', price: '', stock: '', compareAtPrice: '', images: null });
        setReviseId(null);
        setProductMode('existing');
        load();
        notify(reviseId ? 'اصلاح ارسال شد و دوباره در صف بررسی است.' : 'محصول جدید برای تأیید ادمین ارسال شد.');
    };

    const updateLine = async (itemId, status) => {
        const res = await fetch(`/api/vendor/orders/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) return;
        load();
    };

    const onboarding = !me || me.status !== 'active';
    const offeredIds = new Set(listings.map((item) => Number(item.productId)));
    const catalogChoices = catalog.filter((item) => {
        if (offeredIds.has(Number(item.id))) return false;
        if (catalogQ && !String(item.name || '').includes(catalogQ)) return false;
        return true;
    });
    const reviewLabel = (status) => PRODUCT_REVIEW_LABELS[status] || status;
    const docsCount = (me && me.docs ? me.docs : []).length;

    const tabs = useMemo(() => ([
        { id: 'products', label: 'محصولات', icon: faBoxOpen },
        { id: 'orders', label: 'سفارش‌ها', icon: faClipboardList },
        { id: 'sales', label: 'گزارش فروش', icon: faChartLine },
        { id: 'finance', label: 'گزارش مالی', icon: faWallet }
    ]), []);

    return (
        <div className="shop-page shop-world vendor-panel-page">
            <MainNavbar />
            <main className="shop-main vendor-main">
                <header className="vendor-hero">
                    <FontAwesomeIcon icon={faStore} />
                    <div>
                        <h1>پنل مدیریت فروشنده</h1>
                        <p>ورود جدا از حساب کاربری تات کیدز؛ مدیریت کالا، سفارش و تسویه.</p>
                    </div>
                </header>
                {message && <p className={`vendor-toast${messageError ? ' is-error' : ''}`}>{message}</p>}

                {onboarding && (
                    <section className="vendor-onboard">
                        <ol className="vendor-steps">
                            {['هویت', 'مالی', 'مدارک', 'بررسی'].map((label, index) => (
                                <li key={label} className={step === index + 1 ? 'is-on' : ''}>{index + 1}. {label}</li>
                            ))}
                        </ol>

                        {me && me.adminNote && (me.status === 'returned' || me.status === 'docs_requested') && (
                            <aside className="vendor-admin-banner">
                                <strong>{STATUS_LABELS[me.status] || me.status}</strong>
                                <p>{me.adminNote}</p>
                            </aside>
                        )}

                        {(step === 1 || step === 2) && (
                            <form className="product-form vendor-form" onSubmit={saveProfile} noValidate>
                                {step === 1 && (
                                    <>
                                        <h3>۱. اطلاعات حقیقی یا حقوقی</h3>
                                        <p className="vendor-required-hint">موارد ستاره‌دار اجباری هستند. اگر خالی بمانند با حاشیه قرمز مشخص می‌شوند.</p>
                                        <div className="vendor-kind" role="tablist" aria-label="نوع شخصیت">
                                            <button
                                                type="button"
                                                role="tab"
                                                aria-selected={form.personKind === 'individual'}
                                                className={form.personKind === 'individual' ? 'is-on' : ''}
                                                onClick={() => setField('personKind', 'individual')}
                                            >
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>
                                                    <strong>حقیقی</strong>
                                                    <small>شخص حقیقی با کد ملی ۱۰ رقمی</small>
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                role="tab"
                                                aria-selected={form.personKind === 'company'}
                                                className={form.personKind === 'company' ? 'is-on' : ''}
                                                onClick={() => setField('personKind', 'company')}
                                            >
                                                <FontAwesomeIcon icon={faBuilding} />
                                                <span>
                                                    <strong>حقوقی</strong>
                                                    <small>شرکت با شناسه ملی ۱۱ رقمی و شماره ثبت</small>
                                                </span>
                                            </button>
                                        </div>
                                        <Field label="نام فروشگاه" required error={shownIdentity.displayName}>
                                            <input value={form.displayName} onChange={(e) => setField('displayName', e.target.value)} placeholder="نام فروشگاه روی ویترین" />
                                        </Field>
                                        <Field label="نام صاحب حساب / مدیرعامل" required error={shownIdentity.ownerName}>
                                            <input value={form.ownerName} onChange={(e) => setField('ownerName', e.target.value)} placeholder="نام و نام خانوادگی" />
                                        </Field>
                                        <Field
                                            label={form.personKind === 'company' ? 'شناسه ملی شرکت' : 'کد ملی'}
                                            required
                                            error={shownIdentity.nationalId}
                                        >
                                            <input
                                                value={form.nationalId}
                                                onChange={(e) => setField('nationalId', digitsOnly(e.target.value).slice(0, form.personKind === 'company' ? 11 : 10))}
                                                inputMode="numeric"
                                                maxLength={form.personKind === 'company' ? 11 : 10}
                                                placeholder={form.personKind === 'company' ? '۱۱ رقم' : '۱۰ رقم'}
                                            />
                                        </Field>
                                        {form.personKind === 'company' && (
                                            <>
                                                <Field label="نام حقوقی" required error={shownIdentity.legalName}>
                                                    <input value={form.legalName} onChange={(e) => setField('legalName', e.target.value)} placeholder="نام حقوقی شرکت" />
                                                </Field>
                                                <Field label="شماره ثبت" required error={shownIdentity.registrationNo}>
                                                    <input value={form.registrationNo} onChange={(e) => setField('registrationNo', e.target.value)} placeholder="شماره ثبت" />
                                                </Field>
                                                <Field label="کد اقتصادی">
                                                    <input value={form.economicCode} onChange={(e) => setField('economicCode', e.target.value)} placeholder="اختیاری" />
                                                </Field>
                                            </>
                                        )}
                                        <Field label="شماره تماس" required error={shownIdentity.phone}>
                                            <input
                                                value={form.phone}
                                                onChange={(e) => setField('phone', digitsOnly(e.target.value).slice(0, 11))}
                                                inputMode="numeric"
                                                placeholder="0912xxxxxxx"
                                            />
                                        </Field>
                                        <Field label="شماره دوم" error={shownIdentity.phone2}>
                                            <input
                                                value={form.phone2}
                                                onChange={(e) => setField('phone2', digitsOnly(e.target.value).slice(0, 11))}
                                                inputMode="numeric"
                                                placeholder="اختیاری"
                                            />
                                        </Field>
                                        <div className="vendor-city-row">
                                            <CitySelector
                                                required
                                                selectedProvince={form.province}
                                                selectedCity={form.city}
                                                invalidProvince={Boolean(shownIdentity.province)}
                                                invalidCity={Boolean(shownIdentity.city)}
                                                provinceError={shownIdentity.province}
                                                cityError={shownIdentity.city}
                                                onProvinceChange={(e) => {
                                                    setForm((prev) => ({ ...prev, province: e.target.value, city: '' }));
                                                }}
                                                onCityChange={(e) => setField('city', e.target.value)}
                                            />
                                        </div>
                                        <Field label="نشانی کامل" required error={shownIdentity.address}>
                                            <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="خیابان، پلاک، واحد" rows="3" />
                                        </Field>
                                        <Field label="کد پستی" required error={shownIdentity.postalCode}>
                                            <input
                                                value={form.postalCode}
                                                onChange={(e) => setField('postalCode', digitsOnly(e.target.value).slice(0, 10))}
                                                inputMode="numeric"
                                                maxLength={10}
                                                placeholder="۱۰ رقم"
                                            />
                                        </Field>
                                        <Field label="آدرس سایت" error={shownIdentity.website}>
                                            <input value={form.website} onChange={(e) => setField('website', e.target.value)} placeholder="https://example.com" dir="ltr" />
                                        </Field>
                                        <Field label="اینستاگرام" error={shownIdentity.instagram}>
                                            <input value={form.instagram} onChange={(e) => setField('instagram', e.target.value)} placeholder="@username" dir="ltr" />
                                        </Field>
                                        <button type="button" onClick={goFinance}>ادامه اطلاعات مالی</button>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <h3>۲. اطلاعات مالی و تسویه</h3>
                                        <Field label="بانک" required error={shownFinance.bankName}>
                                            <select value={form.bankName} onChange={(e) => setField('bankName', e.target.value)}>
                                                <option value="">انتخاب بانک</option>
                                                {form.bankName && !IRAN_BANKS.includes(form.bankName) && (
                                                    <option value={form.bankName}>{form.bankName}</option>
                                                )}
                                                {IRAN_BANKS.map((bank) => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="شماره شبا" required error={shownFinance.bankSheba}>
                                            <div className={`vendor-sheba${shownFinance.bankSheba ? ' is-invalid' : ''}`}>
                                                <span className="vendor-sheba-prefix">IR</span>
                                                <input
                                                    value={shebaDigits(form.bankSheba)}
                                                    onChange={(e) => setField('bankSheba', shebaDigits(e.target.value))}
                                                    inputMode="numeric"
                                                    maxLength={24}
                                                    placeholder="۲۴ رقم"
                                                />
                                            </div>
                                        </Field>
                                        <Field label="شماره حساب">
                                            <input value={form.bankAccount} onChange={(e) => setField('bankAccount', e.target.value)} placeholder="اختیاری" />
                                        </Field>
                                        <Field label="توضیح مجوزها و نوع کالا">
                                            <textarea value={form.docsNote} onChange={(e) => setField('docsNote', e.target.value)} placeholder="اختیاری" rows="3" />
                                        </Field>
                                        <div className="product-form-actions">
                                            <button type="button" className="btn-cancel" onClick={() => setStep(1)}>بازگشت</button>
                                            <button type="submit">ذخیره و رفتن به مدارک</button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}

                        {step === 3 && (
                            <form className="product-form vendor-form" onSubmit={uploadDocs} noValidate>
                                <h3>۳. مدارک احراز هویت</h3>
                                <p>دست‌کم دو مدرک لازم است: کارت شناسایی و تأییدیه شبا. برای حقوقی، آگهی تأسیس هم بارگذاری شود.</p>
                                <select value={docKind} onChange={(e) => setDocKind(e.target.value)}>
                                    {DOC_KINDS.map((item) => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                    ))}
                                </select>
                                <input type="file" accept="image/*,.pdf" multiple onChange={(e) => setDocFiles(e.target.files)} />
                                <button type="submit">بارگذاری مدرک</button>
                                <ul className="vendor-docs">
                                    {(me && me.docs ? me.docs : []).map((doc) => (
                                        <li key={doc.id}>
                                            <a href={doc.fileUrl} target="_blank" rel="noreferrer">{doc.originalName || doc.kind}</a>
                                            <span>{DOC_KINDS.find((item) => item.id === doc.kind)?.label || doc.kind}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="product-form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setStep(2)}>بازگشت</button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (docsCount < 2) {
                                                notify('دست‌کم دو مدرک بارگذاری کنید', true);
                                                return;
                                            }
                                            notify('');
                                            setStep(4);
                                        }}
                                    >
                                        ادامه بررسی نهایی
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 4 && (
                            <div className="product-form vendor-form">
                                <h3>۴. بررسی و تأیید شرایط</h3>
                                <ul className="vendor-review-list">
                                    <li>فروشگاه: {form.displayName || '—'}</li>
                                    <li>نوع: {form.personKind === 'company' ? 'حقوقی' : 'حقیقی'}</li>
                                    <li>کد پستی: {form.postalCode || '—'}</li>
                                    <li>مدارک بارگذاری‌شده: {docsCount}</li>
                                </ul>
                                {!termsOpen ? (
                                    <button type="button" className="vendor-terms-open" onClick={() => setTermsOpen(true)}>
                                        مشاهده شرایط و قوانین
                                    </button>
                                ) : (
                                    <div className="vendor-terms">
                                        <h4>شرایط و قوانین همکاری فروشندگان</h4>
                                        <ol>
                                            {VENDOR_TERMS.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ol>
                                        <label className="vendor-terms-check">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                            />
                                            تمام موارد مطالعه شده و مورد تایید می‌باشد
                                        </label>
                                    </div>
                                )}
                                <div className="product-form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setStep(3)}>بازگشت</button>
                                    <button type="button" disabled={!termsAccepted} onClick={submitRequest}>
                                        تأیید و ارسال درخواست
                                    </button>
                                </div>
                            </div>
                        )}

                        {me && (
                            <aside className="vendor-status-card">
                                <h3>وضعیت درخواست</h3>
                                <p>{STATUS_LABELS[me.status] || me.status}</p>
                                <p>{me.profileComplete ? 'پرونده کامل است.' : 'برای تکمیل، هویت، شبا، کد پستی و حداقل دو مدرک لازم است.'}</p>
                            </aside>
                        )}
                    </section>
                )}

                {me && me.status === 'active' && (
                    <section className="vendor-workspace">
                        <p className="vendor-active-line">
                            فروشگاه فعال: {me.displayName} · کمیسیون {me.commissionPct}٪
                            <button
                                type="button"
                                className="vendor-logout"
                                onClick={() => {
                                    clearAuthSession();
                                    history.push('/register?next=/vendor');
                                }}
                            >
                                خروج از پنل
                            </button>
                        </p>
                        <div className="vendor-tabs">
                            {tabs.map((item) => (
                                <button key={item.id} type="button" className={tab === item.id ? 'is-on' : ''} onClick={() => setTab(item.id)}>
                                    <FontAwesomeIcon icon={item.icon} />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {tab === 'products' && (
                            <>
                                <div className="vendor-kind vendor-product-mode" role="tablist">
                                    <button
                                        type="button"
                                        className={productMode === 'existing' ? 'is-on' : ''}
                                        onClick={() => { setProductMode('existing'); setReviseId(null); }}
                                    >
                                        <span>
                                            <strong>محصول موجود فروشگاه</strong>
                                            <small>از کاتالوگ انتخاب کنید و فقط قیمت و موجودی بگذارید</small>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className={productMode === 'new' ? 'is-on' : ''}
                                        onClick={() => setProductMode('new')}
                                    >
                                        <span>
                                            <strong>محصول جدید</strong>
                                            <small>عکس، توضیح کامل و گروه را بفرستید تا ادمین بررسی کند</small>
                                        </span>
                                    </button>
                                </div>

                                {productMode === 'existing' && (
                                    <form className="product-form vendor-form" onSubmit={createOffer}>
                                        <h3>فروش محصول موجود</h3>
                                        <input
                                            value={catalogQ}
                                            onChange={(e) => setCatalogQ(e.target.value)}
                                            placeholder="جستجوی نام محصول"
                                        />
                                        <select
                                            value={offerForm.productId}
                                            onChange={(e) => setOfferForm((p) => ({ ...p, productId: e.target.value }))}
                                            required
                                        >
                                            <option value="">انتخاب محصول کاتالوگ</option>
                                            {catalogChoices.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} · {item.category}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="product-form-row">
                                            <input value={offerForm.price} onChange={(e) => setOfferForm((p) => ({ ...p, price: e.target.value }))} placeholder="قیمت فروش شما" required />
                                            <input value={offerForm.stock} onChange={(e) => setOfferForm((p) => ({ ...p, stock: e.target.value }))} placeholder="موجودی" required />
                                        </div>
                                        <button type="submit">ثبت قیمت و موجودی</button>
                                    </form>
                                )}

                                {productMode === 'new' && (
                                    <form className="product-form vendor-form" onSubmit={createProduct}>
                                        <h3>{reviseId ? 'اصلاح و ارسال دوباره محصول' : 'تعریف محصول جدید برای تأیید ادمین'}</h3>
                                        <input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="نام محصول" required />
                                        <textarea value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} placeholder="توضیحات کامل" rows="4" required />
                                        <CategoryCascade
                                            tree={categories}
                                            value={productForm.category}
                                            onChange={(name) => setProductForm((p) => ({ ...p, category: name }))}
                                            emptyLabel="انتخاب گروه"
                                            required
                                            forceLeaf
                                        />
                                        <div className="product-form-row">
                                            <input value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} placeholder="قیمت فروش" required />
                                            <input value={productForm.compareAtPrice} onChange={(e) => setProductForm((p) => ({ ...p, compareAtPrice: e.target.value }))} placeholder="قیمت قبل از تخفیف" />
                                            <input value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} placeholder="موجودی" />
                                        </div>
                                        <input type="file" accept="image/*" multiple onChange={(e) => setProductForm((p) => ({ ...p, images: e.target.files }))} />
                                        <div className="product-form-actions">
                                            {reviseId && (
                                                <button
                                                    type="button"
                                                    className="btn-cancel"
                                                    onClick={() => {
                                                        setReviseId(null);
                                                        setProductForm({ name: '', description: '', category: '', price: '', stock: '', compareAtPrice: '', images: null });
                                                    }}
                                                >
                                                    انصراف از اصلاح
                                                </button>
                                            )}
                                            <button type="submit">{reviseId ? 'ارسال اصلاح برای ادمین' : 'ارسال برای تأیید ادمین'}</button>
                                        </div>
                                    </form>
                                )}

                                <div className="products-admin-list">
                                    {listings.length === 0 && <p>هنوز محصولی برای این فروشگاه ثبت نشده است.</p>}
                                    {listings.map((listing) => {
                                        const product = listing.product || {};
                                        const status = product.reviewStatus || 'approved';
                                        return (
                                            <div key={listing.id} className="product-admin-item">
                                                <div>
                                                    <h3>{product.name}</h3>
                                                    <p>
                                                        {formatPrice(listing.price)} · موجودی {listing.stock}
                                                        {' · '}
                                                        {status === 'approved' ? 'فروش روی محصول موجود' : reviewLabel(status)}
                                                    </p>
                                                    {product.reviewNote ? <p className="vendor-admin-banner">{product.reviewNote}</p> : null}
                                                </div>
                                                {product.active && <Link to={`/shop/${product.id}`}>مشاهده</Link>}
                                                {(status === 'needs_revision' || status === 'rejected') && (
                                                    <button
                                                        type="button"
                                                        className="btn-edit"
                                                        onClick={() => {
                                                            setProductMode('new');
                                                            setReviseId(product.id);
                                                            setProductForm({
                                                                name: product.name || '',
                                                                description: product.description || '',
                                                                category: product.category || '',
                                                                price: String(listing.price || ''),
                                                                stock: String(listing.stock || ''),
                                                                compareAtPrice: '',
                                                                images: null
                                                            });
                                                        }}
                                                    >
                                                        اصلاح و ارسال دوباره
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {tab === 'orders' && (
                            <div className="vendor-orders">
                                {orders.length === 0 && <p>سفارشی برای این فروشگاه ثبت نشده است.</p>}
                                {orders.map((order) => (
                                    <article key={order.id} className="vendor-order-card">
                                        <h3>سفارش #{order.id}</h3>
                                        <ul>
                                            {(order.items || []).map((item) => (
                                                <li key={item.id || item.productId}>
                                                    <span>{item.name} × {item.quantity} — {formatPrice(item.lineTotal)}</span>
                                                    <select
                                                        value={item.lineStatus || 'pending'}
                                                        onChange={(e) => updateLine(item.id, e.target.value)}
                                                    >
                                                        {LINE_STATUSES.map((opt) => (
                                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        )}

                        {tab === 'sales' && finance && (
                            <div className="vendor-report">
                                <p>جمع فروش: <strong>{formatPrice(finance.salesTotal)}</strong></p>
                                {finance.sales.length === 0 ? <p>هنوز فروشی ثبت نشده است.</p> : (
                                    <ul>
                                        {finance.sales.map((row) => (
                                            <li key={row.name}>{row.name} · {row.quantity} عدد · {formatPrice(row.total)}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {tab === 'finance' && finance && (
                            <div className="vendor-report">
                                <p>کمیسیون کسرشده: <strong>{formatPrice(finance.commissionTotal)}</strong></p>
                                <p>مانده امانی (قابل تسویه پس از تحویل و مهلت مرجوعی): <strong>{formatPrice(finance.holdTotal)}</strong></p>
                                <p>بازگشت/بدهی: <strong>{formatPrice(finance.refundTotal)}</strong></p>
                                <h3>اسناد مالی</h3>
                                <ul>
                                    {finance.recent.map((row) => (
                                        <li key={row.id}>{row.kind} · {formatPrice(row.amount)} · {row.note}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
            </main>
            <Footer />
            {pendingModal && (
                <div className="vendor-modal" role="dialog" aria-modal="true" aria-labelledby="vendor-pending-title">
                    <div className="vendor-modal-card">
                        <h3 id="vendor-pending-title">درخواست شما در انتظار تایید می‌باشد</h3>
                        <p>کارشناس پرونده را بررسی می‌کند و در صورت نیاز مدرک یا اصلاح می‌خواهد.</p>
                        <button type="button" onClick={() => setPendingModal(false)}>متوجه شدم</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPanelPage;
