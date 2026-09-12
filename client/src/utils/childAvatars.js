export const CHILD_AVATARS = [
    { id: 'child-01', src: '/avatars/child-01.svg', gender: 'girl', label: 'دختر ۱' },
    { id: 'child-02', src: '/avatars/child-02.svg', gender: 'boy', label: 'پسر ۱' },
    { id: 'child-03', src: '/avatars/child-03.svg', gender: 'girl', label: 'دختر ۲' },
    { id: 'child-04', src: '/avatars/child-04.svg', gender: 'boy', label: 'پسر ۲' },
    { id: 'child-05', src: '/avatars/child-05.svg', gender: 'girl', label: 'دختر ۳' },
    { id: 'child-06', src: '/avatars/child-06.svg', gender: 'boy', label: 'پسر ۳' },
    { id: 'child-07', src: '/avatars/child-07.svg', gender: 'girl', label: 'دختر ۴' },
    { id: 'child-08', src: '/avatars/child-08.svg', gender: 'boy', label: 'پسر ۴' }
];

export function isRemotePlaceholder(avatar) {
    return /pravatar|ui-avatars|dicebear|robohash|randomuser/i.test(String(avatar || ''));
}

export function isStoredChildAvatar(avatar) {
    const value = String(avatar || '').trim();
    if (!value || isRemotePlaceholder(value)) return false;
    return value.startsWith('/uploads') || value.startsWith('/avatars') || value.startsWith('data:');
}

function hashKey(value) {
    const text = String(value || 'child');
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return hash;
}

export function pickChildAvatar(child = {}) {
    const gender = child.gender === 'girl' || child.gender === 'female' ? 'girl'
        : child.gender === 'boy' || child.gender === 'male' ? 'boy'
            : '';
    const pool = gender ? CHILD_AVATARS.filter((item) => item.gender === gender) : CHILD_AVATARS;
    const key = child.id || child.name || child.firstName || child.lastName || 'child';
    return (pool[hashKey(key) % pool.length] || CHILD_AVATARS[0]).src;
}

export function assignChildAvatar(child = {}) {
    if (isStoredChildAvatar(child.avatar)) return child.avatar;
    return pickChildAvatar(child);
}

export function resolveChildAvatar(child = {}) {
    if (isStoredChildAvatar(child.avatar)) return child.avatar;
    return pickChildAvatar(child);
}
