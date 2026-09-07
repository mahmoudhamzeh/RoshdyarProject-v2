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

export function identityErrors(form) {
    const errors = [];
    if (!String(form.displayName || '').trim() || String(form.displayName).trim().length < 3) {
        errors.push('نام فروشگاه الزامی است');
    }
    if (!String(form.ownerName || '').trim()) errors.push('نام صاحب / نماینده الزامی است');
    const nationalDigits = digitsOnly(form.nationalId);
    if (form.personKind === 'company') {
        if (nationalDigits.length !== 11) errors.push('شناسه ملی شرکت باید ۱۱ رقم باشد');
        if (!String(form.legalName || '').trim()) errors.push('نام حقوقی الزامی است');
        if (!String(form.registrationNo || '').trim()) errors.push('شماره ثبت الزامی است');
    } else if (nationalDigits.length !== 10) {
        errors.push('کد ملی باید ۱۰ رقم و فقط عدد باشد');
    }
    const phone = digitsOnly(form.phone);
    if (!/^09\d{9}$/.test(phone)) errors.push('شماره تماس معتبر نیست');
    if (form.phone2) {
        const phone2 = digitsOnly(form.phone2);
        if (phone2 && !/^09\d{9}$/.test(phone2)) errors.push('شماره دوم معتبر نیست');
    }
    if (!String(form.province || '').trim()) errors.push('استان را انتخاب کنید');
    if (!String(form.city || '').trim()) errors.push('شهر را انتخاب کنید');
    if (!String(form.address || '').trim()) errors.push('نشانی کامل الزامی است');
    if (String(form.website || '').trim()) {
        const raw = String(form.website).trim();
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            const url = new URL(withProtocol);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad');
        } catch (_) {
            errors.push('آدرس سایت معتبر نیست');
        }
    }
    if (String(form.instagram || '').trim()) {
        let handle = String(form.instagram).trim()
            .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
            .replace(/\/.*$/, '')
            .replace(/^@/, '');
        if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) errors.push('آدرس اینستاگرام معتبر نیست');
    }
    return errors;
}

export function financeErrors(form) {
    const errors = [];
    if (!IRAN_BANKS.includes(String(form.bankName || '').trim())) {
        errors.push('بانک را از فهرست انتخاب کنید');
    }
    if (shebaDigits(form.bankSheba).length !== 24) {
        errors.push('شماره شبا باید ۲۴ رقم بعد از IR باشد');
    }
    return errors;
}
