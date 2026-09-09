export const IRAN_BANKS = [
    'ملی',
    'ملت',
    'صادرات',
    'تجارت',
    'سپه',
    'کشاورزی',
    'رفاه کارگران',
    'مسکن',
    'پاسارگاد',
    'سامان',
    'اقتصاد نوین',
    'پارسیان',
    'سینا',
    'کارآفرین',
    'شهر',
    'دی',
    'گردشگری',
    'ایران زمین',
    'خاورمیانه',
    'سرمایه',
    'پست بانک ایران',
    'توسعه تعاون',
    'صنعت و معدن',
    'توسعه صادرات ایران',
    'قرض‌الحسنه مهر ایران',
    'قرض‌الحسنه رسالت',
    'آینده'
];

export function toEnglishDigits(value) {
    return String(value || '')
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

export function digitsOnly(value) {
    return toEnglishDigits(value).replace(/\D/g, '');
}

export function shebaDigits(value) {
    let raw = toEnglishDigits(String(value || '')).toUpperCase().replace(/\s+/g, '');
    if (raw.startsWith('IR')) raw = raw.slice(2);
    return raw.replace(/\D/g, '').slice(0, 24);
}

export function identityFieldErrors(form) {
    const err = {};
    if (!String(form.displayName || '').trim() || String(form.displayName).trim().length < 3) {
        err.displayName = 'نام فروشگاه را وارد کنید';
    }
    if (!String(form.ownerName || '').trim()) err.ownerName = 'نام صاحب / نماینده را وارد کنید';
    const nationalDigits = digitsOnly(form.nationalId);
    if (form.personKind === 'company') {
        if (nationalDigits.length !== 11) err.nationalId = 'شناسه ملی باید ۱۱ رقم باشد';
        if (!String(form.legalName || '').trim()) err.legalName = 'نام حقوقی را وارد کنید';
        if (!String(form.registrationNo || '').trim()) err.registrationNo = 'شماره ثبت را وارد کنید';
    } else if (nationalDigits.length !== 10) {
        err.nationalId = 'کد ملی باید ۱۰ رقم باشد';
    }
    const phone = digitsOnly(form.phone);
    if (!/^09\d{9}$/.test(phone)) err.phone = 'شماره تماس معتبر نیست';
    if (form.phone2) {
        const phone2 = digitsOnly(form.phone2);
        if (phone2 && !/^09\d{9}$/.test(phone2)) err.phone2 = 'شماره دوم معتبر نیست';
    }
    if (!String(form.province || '').trim()) err.province = 'استان را انتخاب کنید';
    if (!String(form.city || '').trim()) err.city = 'شهر را انتخاب کنید';
    if (!String(form.address || '').trim()) err.address = 'نشانی کامل را وارد کنید';
    const postal = digitsOnly(form.postalCode);
    if (postal.length !== 10) err.postalCode = 'کد پستی باید ۱۰ رقم باشد';
    if (String(form.website || '').trim()) {
        const raw = String(form.website).trim();
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            const url = new URL(withProtocol);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad');
        } catch (_) {
            err.website = 'آدرس سایت معتبر نیست';
        }
    }
    if (String(form.instagram || '').trim()) {
        let handle = String(form.instagram).trim()
            .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
            .replace(/\/.*$/, '')
            .replace(/^@/, '');
        if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) err.instagram = 'آدرس اینستاگرام معتبر نیست';
    }
    return err;
}

export function identityErrors(form) {
    return Object.values(identityFieldErrors(form));
}

export function financeFieldErrors(form) {
    const err = {};
    if (!IRAN_BANKS.includes(String(form.bankName || '').trim())) {
        err.bankName = 'بانک را از فهرست انتخاب کنید';
    }
    if (shebaDigits(form.bankSheba).length !== 24) {
        err.bankSheba = 'شماره شبا باید ۲۴ رقم بعد از IR باشد';
    }
    return err;
}

export function financeErrors(form) {
    return Object.values(financeFieldErrors(form));
}
