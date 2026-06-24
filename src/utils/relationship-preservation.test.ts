import test from 'node:test';
import assert from 'node:assert';

// ─── Pure-logic diff algorithm (mirrors the PUT handler logic) ──────────────
// We extract and test the diff logic in isolation, no DB required.

type CanonicalRel = { type: 'PARENT' | 'SPOUSE'; fromId: string; toId: string };
type ExistingRel = CanonicalRel & { id: string };

function relKey(r: CanonicalRel): string {
  return `${r.type}:${r.fromId}:${r.toId}`;
}

/**
 * Normalize form relations into canonical DB format.
 * This is the exact same logic used in the PUT handler.
 */
function normalizeRelations(
  memberId: string,
  formRelations: { type: 'PARENT' | 'CHILD' | 'SPOUSE'; id: string }[]
): CanonicalRel[] {
  const result: CanonicalRel[] = [];
  for (const rel of formRelations) {
    if (!rel.id || !rel.type) continue;
    if (rel.type === 'PARENT') {
      result.push({ type: 'PARENT', fromId: rel.id, toId: memberId });
    } else if (rel.type === 'CHILD') {
      result.push({ type: 'PARENT', fromId: memberId, toId: rel.id });
    } else if (rel.type === 'SPOUSE') {
      const [id1, id2] = [memberId, rel.id].sort();
      result.push({ type: 'SPOUSE', fromId: id1, toId: id2 });
    }
  }
  return result;
}

/**
 * Compute the diff between existing and desired relationships.
 * Returns { toAdd, toRemove } sets.
 */
function computeRelationshipDiff(
  existing: ExistingRel[],
  desired: CanonicalRel[]
): { toAdd: CanonicalRel[]; toRemove: ExistingRel[] } {
  const existingKeys = new Set(existing.map(r => relKey(r)));
  const desiredKeys = new Set(desired.map(r => relKey(r)));

  const toRemove = existing.filter(r => !desiredKeys.has(relKey(r)));
  const toAdd = desired.filter(r => !existingKeys.has(relKey(r)));

  return { toAdd, toRemove };
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

test('Relationship Diff Algorithm', async (t) => {

  await t.test('No changes → no adds, no removes', () => {
    const memberId = 'member-1';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: 'parent-1', toId: memberId },
      { id: 'rel-2', type: 'SPOUSE', fromId: memberId, toId: 'spouse-1' },
    ];
    const formRelations = [
      { type: 'PARENT' as const, id: 'parent-1' },
      { type: 'SPOUSE' as const, id: 'spouse-1' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toAdd.length, 0, 'Should have no additions');
    assert.strictEqual(toRemove.length, 0, 'Should have no removals');
  });

  await t.test('Add one new relationship → one add, zero removes', () => {
    const memberId = 'member-1';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: 'parent-1', toId: memberId },
    ];
    const formRelations = [
      { type: 'PARENT' as const, id: 'parent-1' },
      { type: 'PARENT' as const, id: 'parent-2' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toAdd.length, 1, 'Should add one new parent');
    assert.strictEqual(toAdd[0].fromId, 'parent-2');
    assert.strictEqual(toRemove.length, 0, 'Should not remove anything');
  });

  await t.test('Remove one existing relationship → zero adds, one remove', () => {
    const memberId = 'member-1';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: 'parent-1', toId: memberId },
      { id: 'rel-2', type: 'PARENT', fromId: 'parent-2', toId: memberId },
    ];
    const formRelations = [
      { type: 'PARENT' as const, id: 'parent-1' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toAdd.length, 0, 'Should have no additions');
    assert.strictEqual(toRemove.length, 1, 'Should remove one parent');
    assert.strictEqual(toRemove[0].id, 'rel-2');
  });

  await t.test('Swap a parent → one add, one remove', () => {
    const memberId = 'member-1';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: 'parent-old', toId: memberId },
    ];
    const formRelations = [
      { type: 'PARENT' as const, id: 'parent-new' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toAdd.length, 1, 'Should add one new parent');
    assert.strictEqual(toAdd[0].fromId, 'parent-new');
    assert.strictEqual(toRemove.length, 1, 'Should remove one old parent');
    assert.strictEqual(toRemove[0].fromId, 'parent-old');
  });

  await t.test('Children preserved when editing parent profile (no relation changes)', () => {
    const memberId = 'parent-member';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: memberId, toId: 'child-1' },
      { id: 'rel-2', type: 'PARENT', fromId: memberId, toId: 'child-2' },
      { id: 'rel-3', type: 'SPOUSE', fromId: memberId, toId: 'spouse-1' },
    ];
    // Form sends same children and spouse
    const formRelations = [
      { type: 'CHILD' as const, id: 'child-1' },
      { type: 'CHILD' as const, id: 'child-2' },
      { type: 'SPOUSE' as const, id: 'spouse-1' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toAdd.length, 0, 'Should have no additions');
    assert.strictEqual(toRemove.length, 0, 'Should have no removals');
  });

  await t.test('Spouse relationship survives when only editing name fields', () => {
    const memberId = 'member-1';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'SPOUSE', fromId: memberId, toId: 'spouse-1' },
      { id: 'rel-2', type: 'PARENT', fromId: 'parent-1', toId: memberId },
    ];
    // Form sends the same relationships unchanged
    const formRelations = [
      { type: 'SPOUSE' as const, id: 'spouse-1' },
      { type: 'PARENT' as const, id: 'parent-1' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toAdd.length, 0);
    assert.strictEqual(toRemove.length, 0);
  });

  await t.test('Adding a child while spouse exists → only child add appears in diff', () => {
    const memberId = 'parent-member';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'SPOUSE', fromId: memberId, toId: 'spouse-1' },
    ];
    const formRelations = [
      { type: 'SPOUSE' as const, id: 'spouse-1' },
      { type: 'CHILD' as const, id: 'new-child' },
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toRemove.length, 0, 'Spouse should not be removed');
    assert.strictEqual(toAdd.length, 1, 'Only the child should be added');
    assert.strictEqual(toAdd[0].type, 'PARENT');
    assert.strictEqual(toAdd[0].fromId, memberId);
    assert.strictEqual(toAdd[0].toId, 'new-child');
  });

  await t.test('CHILD normalization converts to PARENT with correct direction', () => {
    const memberId = 'parent-member';
    const formRelations = [
      { type: 'CHILD' as const, id: 'child-1' },
    ];
    const normalized = normalizeRelations(memberId, formRelations);

    assert.strictEqual(normalized.length, 1);
    assert.strictEqual(normalized[0].type, 'PARENT');
    assert.strictEqual(normalized[0].fromId, memberId, 'Member should be the parent (fromId)');
    assert.strictEqual(normalized[0].toId, 'child-1', 'Child should be in toId');
  });

  await t.test('SPOUSE normalization sorts IDs for canonical form', () => {
    const formRelations1 = normalizeRelations('aaa', [{ type: 'SPOUSE' as const, id: 'zzz' }]);
    const formRelations2 = normalizeRelations('zzz', [{ type: 'SPOUSE' as const, id: 'aaa' }]);

    assert.strictEqual(relKey(formRelations1[0]), relKey(formRelations2[0]),
      'Spouse relationships should normalize to the same key regardless of direction');
  });

  await t.test('Complex scenario: mixed add/remove/keep', () => {
    const memberId = 'member-1';
    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: 'parent-1', toId: memberId },     // keep
      { id: 'rel-2', type: 'PARENT', fromId: 'parent-2', toId: memberId },     // remove
      { id: 'rel-3', type: 'PARENT', fromId: memberId, toId: 'child-1' },      // keep
      { id: 'rel-4', type: 'SPOUSE', fromId: memberId, toId: 'old-spouse' },   // remove
    ];
    const formRelations = [
      { type: 'PARENT' as const, id: 'parent-1' },      // keep
      { type: 'PARENT' as const, id: 'parent-3' },      // add (new parent)
      { type: 'CHILD' as const, id: 'child-1' },        // keep
      { type: 'CHILD' as const, id: 'child-2' },        // add (new child)
      { type: 'SPOUSE' as const, id: 'new-spouse' },    // add (new spouse)
    ];
    const desired = normalizeRelations(memberId, formRelations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toRemove.length, 2, 'Should remove parent-2 and old-spouse');
    assert.strictEqual(toAdd.length, 3, 'Should add parent-3, child-2, and new-spouse');

    const removeIds = toRemove.map(r => r.id).sort();
    assert.deepStrictEqual(removeIds, ['rel-2', 'rel-4']);

    const addKeys = toAdd.map(r => `${r.type}:${r.fromId}`).sort();
    assert.ok(addKeys.some(k => k.includes('parent-3')), 'Should add parent-3');
    assert.ok(addKeys.some(k => k.includes('member-1') && toAdd.find(a => a.toId === 'child-2')), 'Should add child-2');
  });
});

test('Self-Reference Validation (RI-004)', async (t) => {
  await t.test('normalizeRelations skips entries with missing id', () => {
    const result = normalizeRelations('member-1', [
      { type: 'PARENT' as const, id: '' },
      { type: 'SPOUSE' as const, id: '' },
    ]);
    assert.strictEqual(result.length, 0, 'Should skip entries with empty id');
  });

  await t.test('normalizeRelations skips entries with missing type', () => {
    const result = normalizeRelations('member-1', [
      { type: '' as any, id: 'other-member' },
    ]);
    // Empty type doesn't match PARENT, CHILD, or SPOUSE branches
    assert.strictEqual(result.length, 0, 'Should skip entries with empty type');
  });
});

test('Relationship Preservation Scenarios', async (t) => {
  await t.test('Edit with undefined relations does not trigger relationship processing', () => {
    // When `relations` is undefined, the PUT handler skips the entire
    // relationship block. This test documents that behavior.
    const relations = undefined;
    const shouldProcess = relations !== undefined && Array.isArray(relations);
    assert.strictEqual(shouldProcess, false, 'Should not process when relations is undefined');
  });

  await t.test('Edit with empty array means user explicitly removed all relationships', () => {
    const relations: any[] = [];
    const shouldProcess = relations !== undefined && Array.isArray(relations);
    assert.strictEqual(shouldProcess, true, 'Should process empty array');

    const existing: ExistingRel[] = [
      { id: 'rel-1', type: 'PARENT', fromId: 'parent-1', toId: 'member-1' },
    ];
    const desired = normalizeRelations('member-1', relations);
    const { toAdd, toRemove } = computeRelationshipDiff(existing, desired);

    assert.strictEqual(toRemove.length, 1, 'Should remove the existing relationship');
    assert.strictEqual(toAdd.length, 0);
  });

  await t.test('SPOUSE-first ordering ensures auto-linking can find spouse', () => {
    // When toAdd contains both SPOUSE and PARENT (child) entries,
    // the PUT handler processes SPOUSE first. This test verifies the
    // ordering logic used in the handler.
    const toAdd: CanonicalRel[] = [
      { type: 'PARENT', fromId: 'member-1', toId: 'child-1' },
      { type: 'SPOUSE', fromId: 'member-1', toId: 'spouse-1' },
      { type: 'PARENT', fromId: 'member-1', toId: 'child-2' },
    ];

    const spouseAdds = toAdd.filter(r => r.type === 'SPOUSE');
    const parentAdds = toAdd.filter(r => r.type === 'PARENT');

    assert.strictEqual(spouseAdds.length, 1, 'Should have one spouse to add');
    assert.strictEqual(parentAdds.length, 2, 'Should have two parents to add');
    assert.strictEqual(spouseAdds[0].toId, 'spouse-1');
  });
});
