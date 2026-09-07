const IRAN_BANKS = [
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

function toEnglishDigits(value) {
    return String(value || '')
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

function digitsOnly(value) {
    return toEnglishDigits(value).replace(/\D/g, '');
}

function requiredText(value, label) {
    const text = String(value || '').trim();
    if (!text) return { ok: false, message: `${label} الزامی است` };
    return { ok: true, value: text };
}

function normalizeNationalId(value, personKind) {
    const digits = digitsOnly(value);
    if (personKind === 'company') {
        if (digits.length !== 11) {
            return { ok: false, message: 'شناسه ملی شرکت باید ۱۱ رقم و فقط عدد باشد' };
        }
    } else if (digits.length !== 10) {
        return { ok: false, message: 'کد ملی باید ۱۰ رقم و فقط عدد باشد' };
    }
    return { ok: true, value: digits };
}

function normalizeMobile(value, { required = false, label = 'شماره تماس' } = {}) {
    let phone = digitsOnly(value);
    if (phone.startsWith('98') && phone.length === 12) phone = `0${phone.slice(2)}`;
    if (!phone) {
        if (!required) return { ok: true, value: '' };
        return { ok: false, message: `${label} الزامی است` };
    }
    if (!/^09\d{9}$/.test(phone)) {
        return { ok: false, message: `${label} معتبر نیست` };
    }
    return { ok: true, value: phone };
}

function normalizeSheba(value) {
    let raw = toEnglishDigits(String(value || '')).toUpperCase().replace(/\s+/g, '');
    if (raw.startsWith('IR')) raw = raw.slice(2);
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 24) {
        return { ok: false, message: 'شماره شبا باید ۲۴ رقم بعد از IR باشد' };
    }
    return { ok: true, value: `IR${digits}` };
}

function normalizeBankName(value) {
    const name = String(value || '').trim();
    if (!name) return { ok: false, message: 'انتخاب بانک الزامی است' };
    if (!IRAN_BANKS.includes(name)) return { ok: false, message: 'بانک را از فهرست انتخاب کنید' };
    return { ok: true, value: name };
}

function normalizeWebsite(value) {
    const raw = String(value || '').trim();
    if (!raw) return { ok: true, value: '' };
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
        const url = new URL(withProtocol);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad');
        return { ok: true, value: url.toString() };
    } catch (_) {
        return { ok: false, message: 'آدرس سایت معتبر نیست' };
    }
}

function normalizeInstagram(value) {
    let handle = String(value || '').trim();
    if (!handle) return { ok: true, value: '' };
    handle = handle.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
    handle = handle.replace(/\/.*$/, '').replace(/^@/, '').trim();
    if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
        return { ok: false, message: 'آدرس اینستاگرام معتبر نیست' };
    }
    return { ok: true, value: handle };
}

function validateVendorApply(body, user) {
    const personKind = body && body.personKind === 'company' ? 'company' : 'individual';
    const displayName = requiredText(body && body.displayName, 'نام فروشگاه');
    if (!displayName.ok) return displayName;
    if (displayName.value.length < 3) return { ok: false, message: 'نام فروشگاه خیلی کوتاه است' };

    const ownerName = requiredText(body && body.ownerName, 'نام صاحب / نماینده');
    if (!ownerName.ok) return ownerName;

    const nationalId = normalizeNationalId(body && body.nationalId, personKind);
    if (!nationalId.ok) return nationalId;

    const phone = normalizeMobile(body && body.phone || (user && user.mobile), { required: true, label: 'شماره تماس' });
    if (!phone.ok) return phone;

    const phone2 = normalizeMobile(body && body.phone2, { required: false, label: 'شماره دوم' });
    if (!phone2.ok) return phone2;

    const province = requiredText(body && body.province, 'استان');
    if (!province.ok) return province;
    const city = requiredText(body && body.city, 'شهر');
    if (!city.ok) return city;
    const address = requiredText(body && body.address, 'نشانی');
    if (!address.ok) return address;

    let legalName = '';
    let registrationNo = '';
    let economicCode = String((body && body.economicCode) || '').trim();
    if (personKind === 'company') {
        const legal = requiredText(body && body.legalName, 'نام حقوقی');
        if (!legal.ok) return legal;
        const reg = requiredText(body && body.registrationNo, 'شماره ثبت');
        if (!reg.ok) return reg;
        legalName = legal.value;
        registrationNo = reg.value;
    }

    const bankName = normalizeBankName(body && body.bankName);
    if (!bankName.ok) return bankName;
    const bankSheba = normalizeSheba(body && body.bankSheba);
    if (!bankSheba.ok) return bankSheba;

    const website = normalizeWebsite(body && body.website);
    if (!website.ok) return website;
    const instagram = normalizeInstagram(body && body.instagram);
    if (!instagram.ok) return instagram;

    return {
        ok: true,
        payload: {
            displayName: displayName.value,
            personKind,
            ownerName: ownerName.value,
            nationalId: nationalId.value,
            legalName,
            registrationNo,
            economicCode,
            phone: phone.value,
            phone2: phone2.value,
            province: province.value,
            city: city.value,
            address: address.value,
            bankName: bankName.value,
            bankSheba: bankSheba.value,
            bankAccount: String((body && body.bankAccount) || '').trim(),
            website: website.value,
            instagram: instagram.value,
            docsNote: String((body && body.docsNote) || '').trim()
        }
    };
}

module.exports = {
    IRAN_BANKS,
    toEnglishDigits,
    digitsOnly,
    normalizeNationalId,
    normalizeMobile,
    normalizeSheba,
    normalizeWebsite,
    normalizeInstagram,
    validateVendorApply
};
