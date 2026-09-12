export const getChildDisplayName = (child) => {
    if (!child) return 'کودک';
    if (child.name) return child.name;
    const fullName = `${child.firstName || ''} ${child.lastName || ''}`.trim();
    return fullName || 'کودک';
};

export const childGender = (child) => {
    const value = String((child && child.gender) || '').trim().toLowerCase();
    if (value === 'girl' || value === 'female' || value === 'دختر') return 'girl';
    return 'boy';
};

export const childPhotoUrl = (avatar) => {
    const value = String(avatar || '').trim();
    if (!value) return null;
    if (/pravatar\.cc|placeholder|via\.placeholder/i.test(value)) return null;
    return value;
};
