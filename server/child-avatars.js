'use strict';

const CHILD_AVATARS = [
    { id: 'child-01', src: '/avatars/child-01.svg', gender: 'girl' },
    { id: 'child-02', src: '/avatars/child-02.svg', gender: 'boy' },
    { id: 'child-03', src: '/avatars/child-03.svg', gender: 'girl' },
    { id: 'child-04', src: '/avatars/child-04.svg', gender: 'boy' },
    { id: 'child-05', src: '/avatars/child-05.svg', gender: 'girl' },
    { id: 'child-06', src: '/avatars/child-06.svg', gender: 'boy' },
    { id: 'child-07', src: '/avatars/child-07.svg', gender: 'girl' },
    { id: 'child-08', src: '/avatars/child-08.svg', gender: 'boy' }
];

function isRemotePlaceholder(avatar) {
    return /pravatar|ui-avatars|dicebear|robohash|randomuser/i.test(String(avatar || ''));
}

function isStoredChildAvatar(avatar) {
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

function pickChildAvatar(child = {}) {
    const gender = child.gender === 'girl' || child.gender === 'female' ? 'girl'
        : child.gender === 'boy' || child.gender === 'male' ? 'boy'
            : '';
    const pool = gender ? CHILD_AVATARS.filter((item) => item.gender === gender) : CHILD_AVATARS;
    const key = child.id || child.name || child.firstName || child.lastName || 'child';
    return (pool[hashKey(key) % pool.length] || CHILD_AVATARS[0]).src;
}

function assignChildAvatar(child = {}) {
    if (isStoredChildAvatar(child.avatar)) return child.avatar;
    return pickChildAvatar(child);
}

function resolveChildAvatar(child = {}) {
    if (isStoredChildAvatar(child.avatar)) return child.avatar;
    return pickChildAvatar(child);
}

module.exports = {
    CHILD_AVATARS,
    isRemotePlaceholder,
    isStoredChildAvatar,
    pickChildAvatar,
    assignChildAvatar,
    resolveChildAvatar
};
