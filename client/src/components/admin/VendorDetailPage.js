import React, { useEffect, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import './ProductManagement.css';
import './VendorDetailPage.css';

const DOC_LABELS = {
    national_card: 'کارت ملی / شناسنامه',
    company_id: 'آگهی تأسیس / شناسه ملی',
    business_license: 'جواز کسب یا پروانه',
    bank_certificate: 'تأییدیه شبا / کارت بانکی',
    other: 'سایر مدارک'
};

const STATUS_LABELS = {
    draft: 'پیش‌نویس',
    pending: 'در انتظار تأیید',
    returned: 'برگشت‌خورده',
    docs_requested: 'نیاز به مدرک تکمیلی',
    active: 'تأییدشده',
    suspended: 'تعلیق‌شده',
    rejected: 'رد شده'
};

const isImageDoc = (url) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(String(url || '').split('?')[0]);

const Field = ({ label, value }) => (
    <div className="vendor-field">
        <span>{label}</span>
        <strong>{value || '—'}</strong>
    </div>
);

const VendorDetailPage = () => {
    const { vendorId } = useParams();
    const history = useHistory();
    const [vendor, setVendor] = useState(null);
    const [commission, setCommission] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/vendors/${vendorId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.message || 'بارگذاری پرونده ناموفق بود');
            setVendor(null);
            setLoading(false);
            return;
        }
        setError('');
        setVendor(data);
        setCommission(String(data.commissionPct ?? ''));
        setAdminNote(data.adminNote || '');
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [vendorId]);

    const update = async (patch) => {
        const omit = new Set(['applicant', 'docs', 'missingFields', 'profileComplete']);
        const safeVendor = Object.fromEntries(
            Object.entries(vendor || {}).filter(([key]) => !omit.has(key))
        );
        const res = await fetch(`/api/admin/vendors/${vendorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...safeVendor, ...patch })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.message || 'به‌روزرسانی ناموفق بود');
            if (Array.isArray(data.missingFields) && data.missingFields.length) {
                setError(`${data.message}: ${data.missingFields.join('، ')}`);
            }
            return;
        }
        setError('');
        setVendor(data);
        setCommission(String(data.commissionPct ?? ''));
        setAdminNote(data.adminNote || '');
    };

    if (loading) return <p>در حال بارگذاری پرونده فروشنده...</p>;
    if (!vendor) {
        return (
            <div className="product-management vendor-dossier">
                <p className="error-message">{error || 'فروشنده یافت نشد.'}</p>
                <Link to="/admin/vendors">بازگشت به فهرست فروشندگان</Link>
            </div>
        );
    }

    const applicant = vendor.applicant || {};
    const missing = vendor.missingFields || [];
    const docs = vendor.docs || [];
    const kindLabel = vendor.kind === 'internal'
        ? 'فروشنده داخلی مجموعه'
        : (vendor.personKind === 'company' ? 'شخص حقوقی' : 'شخص حقیقی');
    const applicantName = [applicant.firstName, applicant.lastName].filter(Boolean).join(' ');

    return (
        <div className="product-management vendor-dossier">
            <p>
                <Link to="/admin/vendors">بازگشت به فهرست فروشندگان</Link>
            </p>
            <h2>پرونده فروشنده: {vendor.displayName}</h2>
            <p>
                {kindLabel}
                {' · '}
                وضعیت: {STATUS_LABELS[vendor.status] || vendor.status}
                {' · '}
                {vendor.profileComplete ? 'پرونده کامل است' : 'پرونده ناقص است'}
            </p>
            {error && <p className="error-message">{error}</p>}

            {!vendor.profileComplete && (
                <div className="vendor-missing">
                    <h3>موارد ناقص برای تأیید</h3>
                    <ul>
                        {missing.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            )}

            <section className="vendor-card">
                <h3>حساب درخواست‌دهنده</h3>
                {vendor.applicant ? (
                    <>
                        <div className="vendor-grid">
                            <Field label="نام کاربری" value={applicant.username} />
                            <Field label="موبایل حساب" value={applicant.mobile} />
                            <Field label="ایمیل" value={applicant.email} />
                            <Field label="نام در پروفایل" value={applicantName} />
                        </div>
                        {applicant.id ? (
                            <p className="vendor-note">
                                <Link to={`/admin/users/${applicant.id}`}>مشاهده حساب کاربری</Link>
                            </p>
                        ) : null}
                    </>
                ) : (
                    <p>حساب کاربری به این فروشنده متصل نیست.</p>
                )}
            </section>

            <section className="vendor-card">
                <h3>اطلاعات فروشگاه و هویت</h3>
                <div className="vendor-grid">
                    <Field label="نام فروشگاه" value={vendor.displayName} />
                    <Field label="نوع" value={kindLabel} />
                    <Field label="صاحب / نماینده" value={vendor.ownerName} />
                    <Field label="کد ملی / شناسه" value={vendor.nationalId} />
                    <Field label="تلفن فروشگاه" value={vendor.phone} />
                    <Field label="شماره دوم" value={vendor.phone2} />
                    {vendor.personKind === 'company' && (
                        <>
                            <Field label="نام حقوقی" value={vendor.legalName} />
                            <Field label="شماره ثبت" value={vendor.registrationNo} />
                            <Field label="کد اقتصادی" value={vendor.economicCode} />
                        </>
                    )}
                    <Field label="استان" value={vendor.province} />
                    <Field label="شهر" value={vendor.city} />
                    <Field label="نشانی" value={vendor.address} />
                    <Field label="کد پستی" value={vendor.postalCode} />
                    <Field label="سایت" value={vendor.website} />
                    <Field label="اینستاگرام" value={vendor.instagram ? `@${String(vendor.instagram).replace(/^@/, '')}` : ''} />
                </div>
            </section>

            <section className="vendor-card">
                <h3>اطلاعات مالی و تسویه</h3>
                <div className="vendor-grid">
                    <Field label="بانک" value={vendor.bankName} />
                    <Field label="شبا" value={vendor.bankSheba} />
                    <Field label="شماره حساب" value={vendor.bankAccount} />
                    <Field label="دوره تسویه" value={vendor.settlementCycle === 'monthly' ? 'ماهانه' : 'هفتگی'} />
                </div>
                {vendor.docsNote ? <p className="vendor-note">یادداشت فروشنده: {vendor.docsNote}</p> : null}
            </section>

            <section className="vendor-card">
                <h3>مدارک بارگذاری‌شده ({docs.length})</h3>
                {docs.length === 0 ? (
                    <p>مدرکی بارگذاری نشده است.</p>
                ) : (
                    <div className="vendor-docs">
                        {docs.map((doc) => (
                            <a key={doc.id} className="vendor-doc" href={doc.fileUrl} target="_blank" rel="noreferrer">
                                {isImageDoc(doc.fileUrl) ? (
                                    <img src={doc.fileUrl} alt={DOC_LABELS[doc.kind] || doc.kind} />
                                ) : (
                                    <span className="vendor-doc-file">فایل</span>
                                )}
                                <strong>{DOC_LABELS[doc.kind] || doc.kind}</strong>
                                <small>{doc.originalName || doc.fileUrl}</small>
                            </a>
                        ))}
                    </div>
                )}
            </section>

            <section className="vendor-card vendor-review-actions">
                <h3>{vendor.kind === 'internal' ? 'کمیسیون فروشنده داخلی' : 'بررسی و تأیید'}</h3>
                {vendor.adminNote ? (
                    <p className="vendor-note">پیام قبلی به فروشنده: {vendor.adminNote}</p>
                ) : null}
                <label>
                    کمیسیون ٪
                    <input
                        type="number"
                        min="0"
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        onBlur={() => {
                            if (String(commission) !== String(vendor.commissionPct)) {
                                update({ commissionPct: commission });
                            }
                        }}
                    />
                </label>
                {vendor.kind !== 'internal' && (
                    <>
                        <label className="vendor-admin-note">
                            پیام به فروشنده
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                rows="3"
                                placeholder="برای برگشت یا درخواست مدرک، توضیح بنویسید"
                            />
                        </label>
                        <div className="vendor-review-buttons">
                            {vendor.status !== 'active' && (
                                <button
                                    type="button"
                                    className="btn-edit"
                                    disabled={!vendor.profileComplete}
                                    onClick={() => update({ status: 'active', commissionPct: commission, adminNote: '' })}
                                >
                                    تکمیل درخواست
                                </button>
                            )}
                            {vendor.status !== 'returned' && vendor.status !== 'active' && (
                                <button
                                    type="button"
                                    className="btn-return"
                                    onClick={() => update({ status: 'returned', adminNote })}
                                >
                                    برگشت درخواست
                                </button>
                            )}
                            {vendor.status !== 'docs_requested' && vendor.status !== 'active' && (
                                <button
                                    type="button"
                                    className="btn-docs"
                                    onClick={() => update({ status: 'docs_requested', adminNote })}
                                >
                                    درخواست مدرک
                                </button>
                            )}
                            {vendor.status === 'pending' && (
                                <button type="button" className="btn-delete" onClick={() => update({ status: 'rejected', adminNote })}>
                                    رد درخواست
                                </button>
                            )}
                            {vendor.status === 'active' && (
                                <button type="button" className="btn-delete" onClick={() => update({ status: 'suspended', adminNote })}>
                                    تعلیق
                                </button>
                            )}
                            {vendor.status === 'suspended' && (
                                <button
                                    type="button"
                                    className="btn-edit"
                                    disabled={!vendor.profileComplete}
                                    onClick={() => update({ status: 'active' })}
                                >
                                    رفع تعلیق
                                </button>
                            )}
                        </div>
                        {!vendor.profileComplete && vendor.status !== 'active' && (
                            <p>تا وقتی موارد ناقص تکمیل نشود، تکمیل درخواست ممکن نیست.</p>
                        )}
                    </>
                )}
                <button type="button" className="vendor-back" onClick={() => history.push('/admin/vendors')}>
                    بازگشت به فهرست
                </button>
            </section>
        </div>
    );
};

export default VendorDetailPage;
