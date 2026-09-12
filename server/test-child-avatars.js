#!/usr/bin/env node
const assert = require('assert');
const { pickChildAvatar, assignChildAvatar, resolveChildAvatar } = require('./child-avatars');

const a = pickChildAvatar({ id: 7, gender: 'girl', name: 'آوا' });
const b = pickChildAvatar({ id: 7, gender: 'girl', name: 'آوا' });
assert.strictEqual(a, b, 'same child must keep the same avatar');
assert.ok(a.startsWith('/avatars/'), a);

const boy = pickChildAvatar({ id: 3, gender: 'boy' });
assert.ok(['/avatars/child-02.svg', '/avatars/child-04.svg', '/avatars/child-06.svg', '/avatars/child-08.svg'].includes(boy));

assert.strictEqual(assignChildAvatar({ avatar: '/uploads/x.jpg' }), '/uploads/x.jpg');
assert.ok(resolveChildAvatar({ avatar: 'https://i.pravatar.cc/100', id: 9 }).startsWith('/avatars/'));
assert.ok(resolveChildAvatar({ avatar: '', id: 9 }).startsWith('/avatars/'));

console.log('child avatar tests passed');
