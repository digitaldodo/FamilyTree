import test from 'node:test';
import assert from 'node:assert';

test('Timeline Array Normalization Safety Tests', async (t) => {
  await t.test('Normalizes missing members correctly', () => {
    const data: any = { members: undefined };
    const members = Array.isArray(data.members) ? data.members : [];
    assert.strictEqual(members.length, 0);
  });

  await t.test('Normalizes null members correctly', () => {
    const data: any = { members: null };
    const members = Array.isArray(data.members) ? data.members : [];
    assert.strictEqual(members.length, 0);
  });

  await t.test('Normalizes object instead of array members correctly', () => {
    const data: any = { members: { '1': 'John Doe' } };
    const members = Array.isArray(data.members) ? data.members : [];
    assert.strictEqual(members.length, 0);
  });

  await t.test('Normalizes undefined relations correctly', () => {
    const member: any = { id: '1', relationsTo: undefined, relationsFrom: null };
    const relationsTo = Array.isArray(member.relationsTo) ? member.relationsTo : [];
    const relationsFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
    assert.strictEqual(relationsTo.length, 0);
    assert.strictEqual(relationsFrom.length, 0);
  });

  await t.test('Sorts safely when events are corrupted (null/undefined)', () => {
    const corruptEvents: any = null;
    const safeEvents = Array.isArray(corruptEvents) ? corruptEvents : [];
    // Should not throw TypeError: e is not iterable
    const sortedEvents = [...safeEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    assert.strictEqual(sortedEvents.length, 0);
  });

  await t.test('Handles valid array properly', () => {
    const validEvents = [{ id: '1', date: new Date('2026-01-01') }];
    const safeEvents = Array.isArray(validEvents) ? validEvents : [];
    assert.strictEqual(safeEvents.length, 1);
    assert.strictEqual(safeEvents[0].id, '1');
  });
});
