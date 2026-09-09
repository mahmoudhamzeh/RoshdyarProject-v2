#!/usr/bin/env node
const assert = require('assert');
const {
    validateVendorApply,
    normalizeSheba,
    normalizeNationalId,
    normalizePostalCode
} = require('./vendor-apply');

const base = {
    displayName: 'فروشگاه بازی‌کده تست',
    personKind: 'individual',
    ownerName: 'علی فروشنده',
    nationalId: '0012345678',
    phone: '09121112233',
    province: 'تهران',
    city: 'تهران',
    address: 'خیابان تست',
    postalCode: '1234567890',
    bankName: 'ملی',
    bankSheba: 'IR120170000000123456789001'
};

assert.strictEqual(normalizeNationalId('۱۲۳', 'individual').ok, false);
assert.strictEqual(normalizeNationalId('0012345678', 'individual').value, '0012345678');
assert.strictEqual(normalizeSheba('120170000000123456789001').value, 'IR120170000000123456789001');
assert.strictEqual(normalizePostalCode('۱۲۳۴۵۶۷۸۹۰').value, '1234567890');
assert.strictEqual(normalizePostalCode('12345').ok, false);
assert.strictEqual(validateVendorApply({ ...base, nationalId: '123' }).ok, false);
assert.strictEqual(validateVendorApply({ ...base, postalCode: '111' }).ok, false);
assert.strictEqual(validateVendorApply({ ...base, province: '' }).ok, false);
assert.strictEqual(validateVendorApply({ ...base, bankName: 'بانک ساختگی' }).ok, false);
const ok = validateVendorApply({ ...base, website: 'shop.ir', instagram: '@foo_bar', phone2: '09120000000' });
assert.strictEqual(ok.ok, true, ok.message);
assert.strictEqual(ok.payload.instagram, 'foo_bar');
assert.ok(ok.payload.website.includes('shop.ir'));
assert.strictEqual(ok.payload.phone2, '09120000000');
console.log('vendor apply unit tests passed');
