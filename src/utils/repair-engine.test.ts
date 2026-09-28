import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateRepairActions, calculateSyncParents } from './repair-engine';
import { Relationship } from '../generated/prisma/client';

describe('Repair Engine', () => {
  test('no issues found', () => {
    const relationships: Relationship[] = [
      { id: '1', type: 'PARENT', fromId: 'p1', toId: 'c1', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() }
    ];
    const { idsToDelete, repairedCount } = calculateRepairActions(relationships);
    assert.strictEqual(idsToDelete.length, 0);
    assert.strictEqual(repairedCount, 0);
  });

  test('duplicate relationship repair', () => {
    const relationships: Relationship[] = [
      { id: '1', type: 'PARENT', fromId: 'p1', toId: 'c1', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'PARENT', fromId: 'p1', toId: 'c1', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() }
    ];
    const { idsToDelete, repairedCount } = calculateRepairActions(relationships);
    assert.strictEqual(idsToDelete.length, 1);
    assert.strictEqual(idsToDelete[0], '2');
    assert.strictEqual(repairedCount, 1);
  });

  test('invalid relationship repair (self-reference)', () => {
    const relationships: Relationship[] = [
      { id: '1', type: 'SPOUSE', fromId: 'p1', toId: 'p1', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() }
    ];
    const { idsToDelete, repairedCount } = calculateRepairActions(relationships);
    assert.strictEqual(idsToDelete.length, 1);
    assert.strictEqual(repairedCount, 1);
  });

  test('repair is idempotent', () => {
    const relationships: Relationship[] = [
      { id: '1', type: 'PARENT', fromId: 'p1', toId: 'c1', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'SPOUSE', fromId: 'p1', toId: 'p2', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    // First run
    const result1 = calculateRepairActions(relationships);
    assert.strictEqual(result1.repairedCount, 0);
    
    // Simulating no deletion since idsToDelete is empty
    const result2 = calculateRepairActions(relationships);
    assert.strictEqual(result2.repairedCount, 0);
  });
  
  test('sync parents adds missing parent', () => {
    const relationships: Relationship[] = [
      { id: '1', type: 'SPOUSE', fromId: 'p1', toId: 'p2', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', type: 'PARENT', fromId: 'p1', toId: 'c1', treeId: 'tree1', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    const { newParents, addedCount } = calculateSyncParents([...relationships], 'tree1');
    assert.strictEqual(addedCount, 1);
    assert.strictEqual(newParents.length, 1);
    assert.strictEqual(newParents[0].fromId, 'p2');
    assert.strictEqual(newParents[0].toId, 'c1');
  });
});
