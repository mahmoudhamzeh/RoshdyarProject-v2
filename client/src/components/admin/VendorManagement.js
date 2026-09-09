import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductManagement.css';

const STATUS_LABELS = {
    draft: 'پیش‌نویس',
    pending: 'در انتظار تأیید',
    returned: 'برگشت‌خورده',
    docs_requested: 'نیاز به مدرک تکمیلی',
    active: 'تأییدشده',
    suspended: 'تعلیق‌شده',
    rejected: 'رد شده'
};

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [error, setError] = useState('');

    const load = async () => {
        const res = await fetch('/api/admin/vendors');
        if (!res.ok) {
            setError('بارگذاری فروشندگان ناموفق بود');
            return;
        }
        setVendors(await res.json());
        setError('');
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="product-management">
            <h2>فروشندگان مارکت‌پلیس</h2>
            <p>برای دیدن مدارک، هویت و اطلاعات مالی هر درخواست‌دهنده، پرونده را باز کنید. می‌توانید درخواست را برگردانید، مدرک بخواهید یا تکمیل کنید.</p>
            {error && <p className="error-message">{error}</p>}
            <div className="products-admin-list">
                {vendors.map((vendor) => (
                    <div key={vendor.id} className="product-admin-item">
                        <div className="product-admin-info">
                            <h3>{vendor.displayName}</h3>
                            <p>
                                {vendor.kind === 'internal' ? 'فروشنده داخلی مجموعه' : (vendor.personKind === 'company' ? 'حقوقی' : 'حقیقی')}
                                {' · '}
                                وضعیت: {STATUS_LABELS[vendor.status] || vendor.status}
                                {vendor.profileComplete ? ' · پرونده کامل' : ' · ناقص'}
                            </p>
                            <small>
                                {vendor.applicant && vendor.applicant.username
                                    ? `درخواست‌دهنده: ${vendor.applicant.username}`
                                    : (vendor.ownerName || 'بدون نام صاحب')}
                                {vendor.phone ? ` · ${vendor.phone}` : ''}
                                {` · ${(vendor.docs || []).length} مدرک`}
                            </small>
                        </div>
                        <div className="product-admin-actions">
                            <Link to={`/admin/vendors/${vendor.id}`} className="btn-edit" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                                مشاهده پرونده
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorManagement;
