import React, { useEffect, useState } from 'react';
import {
    IRAN_BANKS,
    digitsOnly,
    shebaDigits,
    identityFieldErrors,
    financeFieldErrors
} from '../utils/vendor-apply';
import CitySelector from './CitySelector';

const DOC_KINDS = [
    { id: 'national_card', label: 'کارت ملی / شناسنامه' },
    { id: 'company_id', label: 'آگهی تأسیس / شناسه ملی' },
    { id: 'business_license', label: 'جواز کسب یا پروانه' },
    { id: 'bank_certificate', label: 'تأییدیه شبا / کارت بانکی' },
    { id: 'other', label: 'سایر مدارک' }
];

const CHANGE_LABELS = {
    pending: 'درخواست تغییر در انتظار بررسی ادمین است',
    approved: 'آخرین درخواست تغییر تأیید شد',
    rejected: 'آخرین درخواست تغییر رد شد'
};

const isImageDoc = (url) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(String(url || '').split('?')[0]);

const formFromVendor = (vendor) => ({
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
    bankSheba: String(vendor.bankSheba || '').replace(/^IR/i, ''),
    bankAccount: vendor.bankAccount || '',
    website: vendor.website || '',
    instagram: vendor.instagram || '',
    phone2: vendor.phone2 || '',
    docsNote: vendor.docsNote || '',
    note: ''
});

const Info = ({ label, value }) => (
    <div className="vendor-field">
        <span>{label}</span>
        <strong>{value || '—'}</strong>
    </div>
);

const VendorProfileSection = ({ me, onReload, notify }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(() => formFromVendor(me || {}));
    const [showErrors, setShowErrors] = useState(false);
    const [docKind, setDocKind] = useState('national_card');
    const [docFiles, setDocFiles] = useState(null);

    useEffect(() => {
        setForm(formFromVendor(me || {}));
    }, [me]);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const errors = { ...identityFieldErrors(form), ...financeFieldErrors(form) };
    const shown = showErrors ? errors : {};
    const docs = me.docs || [];
    const pending = me.changeRequestStatus === 'pending';
    const proposed = pending && me.changeRequest && me.changeRequest.payload ? me.changeRequest.payload : null;

    const submitChange = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length) {
            setShowErrors(true);
            notify(Object.values(errors)[0], true);
            return;
        }
        const res = await fetch('/api/vendor/profile/change-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                bankSheba: `IR${shebaDigits(form.bankSheba)}`,
                note: form.note
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify(data.message || 'ارسال درخواست تغییر ناموفق بود', true);
            return;
        }
        setEditing(false);
        setShowErrors(false);
        onReload();
        notify('درخواست تغییر اطلاعات برای بررسی ادمین ارسال شد.');
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
        setDocFiles(null);
        onReload();
        notify('مدرک جدید ثبت شد و در پرونده نمایش داده می‌شود.');
    };

    return (
        <div className="vendor-profile">
            {me.changeRequestStatus ? (
                <aside className={`vendor-admin-banner${me.changeRequestStatus === 'rejected' ? ' is-error' : ''}`}>
                    <strong>{CHANGE_LABELS[me.changeRequestStatus] || me.changeRequestStatus}</strong>
                    {me.changeRequest && me.changeRequest.note ? <p>یادداشت شما: {me.changeRequest.note}</p> : null}
                    {me.changeRequestStatus === 'rejected' && (me.changeRequest.rejectNote || me.adminNote) ? (
                        <p>{me.changeRequest.rejectNote || me.adminNote}</p>
                    ) : null}
                </aside>
            ) : null}

            <section className="vendor-card">
                <h3>اطلاعات هویتی</h3>
                <div className="vendor-grid">
                    <Info label="نام فروشگاه" value={me.displayName} />
                    <Info label="نوع" value={me.personKind === 'company' ? 'شخص حقوقی' : 'شخص حقیقی'} />
                    <Info label="صاحب / نماینده" value={me.ownerName} />
                    <Info label="کد ملی / شناسه" value={me.nationalId} />
                    <Info label="تلفن" value={me.phone} />
                    <Info label="شماره دوم" value={me.phone2} />
                    {me.personKind === 'company' && (
                        <>
                            <Info label="نام حقوقی" value={me.legalName} />
                            <Info label="شماره ثبت" value={me.registrationNo} />
                            <Info label="کد اقتصادی" value={me.economicCode} />
                        </>
                    )}
                    <Info label="استان" value={me.province} />
                    <Info label="شهر" value={me.city} />
                    <Info label="نشانی" value={me.address} />
                    <Info label="کد پستی" value={me.postalCode} />
                    <Info label="سایت" value={me.website} />
                    <Info label="اینستاگرام" value={me.instagram ? `@${String(me.instagram).replace(/^@/, '')}` : ''} />
                </div>
            </section>

            <section className="vendor-card">
                <h3>اطلاعات مالی</h3>
                <div className="vendor-grid">
                    <Info label="بانک" value={me.bankName} />
                    <Info label="شبا" value={me.bankSheba} />
                    <Info label="شماره حساب" value={me.bankAccount} />
                    <Info label="کمیسیون" value={`${me.commissionPct}٪`} />
                    <Info label="دوره تسویه" value={me.settlementCycle === 'monthly' ? 'ماهانه' : 'هفتگی'} />
                </div>
            </section>

            <section className="vendor-card">
                <h3>مدارک ({docs.length})</h3>
                {docs.length === 0 ? <p>مدرکی ثبت نشده است.</p> : (
                    <div className="vendor-profile-docs">
                        {docs.map((doc) => (
                            <a key={doc.id} className="vendor-profile-doc" href={doc.fileUrl} target="_blank" rel="noreferrer">
                                {isImageDoc(doc.fileUrl) ? (
                                    <img src={doc.fileUrl} alt={doc.originalName || doc.kind} />
                                ) : (
                                    <span className="vendor-profile-doc-file">فایل</span>
                                )}
                                <strong>{DOC_KINDS.find((item) => item.id === doc.kind)?.label || doc.kind}</strong>
                                <small>{doc.originalName || doc.fileUrl}</small>
                            </a>
                        ))}
                    </div>
                )}
                <form className="vendor-form vendor-doc-upload" onSubmit={uploadDocs}>
                    <select value={docKind} onChange={(e) => setDocKind(e.target.value)}>
                        {DOC_KINDS.map((item) => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                    </select>
                    <input type="file" multiple onChange={(e) => setDocFiles(e.target.files)} />
                    <button type="submit">بارگذاری مدرک جدید</button>
                </form>
            </section>

            {proposed && (
                <section className="vendor-card">
                    <h3>مقادیر پیشنهادی در انتظار تأیید</h3>
                    <div className="vendor-grid">
                        <Info label="نام فروشگاه" value={proposed.displayName} />
                        <Info label="صاحب / نماینده" value={proposed.ownerName} />
                        <Info label="تلفن" value={proposed.phone} />
                        <Info label="نشانی" value={proposed.address} />
                        <Info label="کد پستی" value={proposed.postalCode} />
                        <Info label="بانک" value={proposed.bankName} />
                        <Info label="شبا" value={proposed.bankSheba} />
                    </div>
                </section>
            )}

            {!editing ? (
                <button type="button" className="vendor-change-btn" onClick={() => setEditing(true)}>
                    درخواست تغییر اطلاعات
                </button>
            ) : (
                <form className="product-form vendor-form" onSubmit={submitChange} noValidate>
                    <h3>درخواست تغییر اطلاعات پرونده</h3>
                    <p className="vendor-required-hint">اطلاعات فعلی تا تأیید ادمین عوض نمی‌شود.</p>
                    <label className={`vendor-label${shown.displayName ? ' is-invalid' : ''}`}>
                        نام فروشگاه *
                        <input value={form.displayName} onChange={(e) => setField('displayName', e.target.value)} />
                        {shown.displayName ? <span className="vendor-field-error">{shown.displayName}</span> : null}
                    </label>
                    <label className={`vendor-label${shown.ownerName ? ' is-invalid' : ''}`}>
                        نام صاحب / نماینده *
                        <input value={form.ownerName} onChange={(e) => setField('ownerName', e.target.value)} />
                        {shown.ownerName ? <span className="vendor-field-error">{shown.ownerName}</span> : null}
                    </label>
                    <label className={`vendor-label${shown.nationalId ? ' is-invalid' : ''}`}>
                        کد ملی / شناسه *
                        <input
                            value={form.nationalId}
                            onChange={(e) => setField('nationalId', digitsOnly(e.target.value).slice(0, form.personKind === 'company' ? 11 : 10))}
                            inputMode="numeric"
                        />
                        {shown.nationalId ? <span className="vendor-field-error">{shown.nationalId}</span> : null}
                    </label>
                    <label className={`vendor-label${shown.phone ? ' is-invalid' : ''}`}>
                        شماره تماس *
                        <input
                            value={form.phone}
                            onChange={(e) => setField('phone', digitsOnly(e.target.value).slice(0, 11))}
                            inputMode="numeric"
                        />
                        {shown.phone ? <span className="vendor-field-error">{shown.phone}</span> : null}
                    </label>
                    <div className="vendor-city-row">
                        <CitySelector
                            required
                            selectedProvince={form.province}
                            selectedCity={form.city}
                            invalidProvince={Boolean(shown.province)}
                            invalidCity={Boolean(shown.city)}
                            provinceError={shown.province}
                            cityError={shown.city}
                            onProvinceChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value, city: '' }))}
                            onCityChange={(e) => setField('city', e.target.value)}
                        />
                    </div>
                    <label className={`vendor-label${shown.address ? ' is-invalid' : ''}`}>
                        نشانی *
                        <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} rows="2" />
                        {shown.address ? <span className="vendor-field-error">{shown.address}</span> : null}
                    </label>
                    <label className={`vendor-label${shown.postalCode ? ' is-invalid' : ''}`}>
                        کد پستی *
                        <input
                            value={form.postalCode}
                            onChange={(e) => setField('postalCode', digitsOnly(e.target.value).slice(0, 10))}
                            inputMode="numeric"
                        />
                        {shown.postalCode ? <span className="vendor-field-error">{shown.postalCode}</span> : null}
                    </label>
                    <label className={`vendor-label${shown.bankName ? ' is-invalid' : ''}`}>
                        بانک *
                        <select value={form.bankName} onChange={(e) => setField('bankName', e.target.value)}>
                            <option value="">انتخاب بانک</option>
                            {IRAN_BANKS.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        {shown.bankName ? <span className="vendor-field-error">{shown.bankName}</span> : null}
                    </label>
                    <label className={`vendor-label${shown.bankSheba ? ' is-invalid' : ''}`}>
                        شبا *
                        <div className={`vendor-sheba${shown.bankSheba ? ' is-invalid' : ''}`}>
                            <span className="vendor-sheba-prefix">IR</span>
                            <input
                                value={form.bankSheba}
                                onChange={(e) => setField('bankSheba', shebaDigits(e.target.value))}
                                inputMode="numeric"
                            />
                        </div>
                        {shown.bankSheba ? <span className="vendor-field-error">{shown.bankSheba}</span> : null}
                    </label>
                    <label className="vendor-label">
                        توضیح برای ادمین
                        <textarea value={form.note} onChange={(e) => setField('note', e.target.value)} rows="2" placeholder="مثلاً تغییر نشانی یا شبا" />
                    </label>
                    <div className="product-form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                                setEditing(false);
                                setForm(formFromVendor(me));
                            }}
                        >
                            انصراف
                        </button>
                        <button type="submit">{pending ? 'ارسال دوباره درخواست تغییر' : 'ارسال درخواست تغییر'}</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default VendorProfileSection;
