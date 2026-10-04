import test from 'node:test';
import assert from 'node:assert';
import { getMemoryCover } from '../lib/memory-cover';

test('getMemoryCover never falls back to member photos', async (t) => {
  await t.test('explicit/attached photo is used', () => {
    assert.strictEqual(getMemoryCover({ media: [{ url: 'a.jpg' }, { url: 'b.jpg' }] }), 'a.jpg');
  });
  await t.test('album cover used when no media', () => {
    assert.strictEqual(getMemoryCover({ media: [], albumCoverUrl: 'album.jpg' }), 'album.jpg');
  });
  await t.test('no photos -> null even with members attached', () => {
    const memory: any = { media: [], albumCoverUrl: null, members: [{ member: { imageUrl: 'face.jpg' } }] };
    assert.strictEqual(getMemoryCover(memory), null);
    assert.strictEqual(getMemoryCover(null), null);
    assert.strictEqual(getMemoryCover({}), null);
  });
});
