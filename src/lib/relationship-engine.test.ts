import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { RelationshipEngine } from '@/lib/relationship-engine';
import prisma from '@/lib/prisma';

describe('validateParentCoupleRule', () => {
  let originalRelationship: any;

  beforeEach(() => {
    originalRelationship = prisma.relationship;
    (prisma as any).relationship = {
      findMany: mock.fn()
    } as any;
  });

  afterEach(() => {
    (prisma as any).relationship = originalRelationship;
    mock.restoreAll();
  });

  it('allows adding a parent when the child has no parents', async () => {
    (prisma.relationship.findMany as any).mock.mockImplementation(async () => []);
    
    await assert.doesNotReject(RelationshipEngine.validateParentCoupleRule('child1', 'parentA'));
    mock.restoreAll();
  });

  it('throws when the child already has 2 parents', async () => {
    (prisma.relationship.findMany as any).mock.mockImplementation(async () => [
      { fromId: 'parentA', toId: 'child1', type: 'PARENT' },
      { fromId: 'parentB', toId: 'child1', type: 'PARENT' }
    ]);
    
    await assert.rejects(
      RelationshipEngine.validateParentCoupleRule('child1', 'parentC'),
      { message: 'This child is already associated with another parent couple.' }
    );
  });

  it('allows adding a parent when the prospective parent is already one of the parents', async () => {
    (prisma.relationship.findMany as any).mock.mockImplementation(async () => [
      { fromId: 'parentA', toId: 'child1', type: 'PARENT' }
    ]);
    
    await assert.doesNotReject(RelationshipEngine.validateParentCoupleRule('child1', 'parentA'));
  });

  it('throws when the child has 1 parent who has a spouse, and the prospective parent is NOT that spouse', async () => {
    let callCount = 0;
    (prisma.relationship.findMany as any).mock.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return [{ fromId: 'parentA', toId: 'child1', type: 'PARENT' }];
      return [{ fromId: 'parentA', toId: 'parentB', type: 'SPOUSE' }];
    });
    
    await assert.rejects(
      RelationshipEngine.validateParentCoupleRule('child1', 'parentC'),
      { message: 'This child is already associated with another parent couple.' }
    );
  });

  it('allows adding the prospective parent when they ARE the spouse of the first parent', async () => {
    let callCount = 0;
    (prisma.relationship.findMany as any).mock.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return [{ fromId: 'parentA', toId: 'child1', type: 'PARENT' }];
      return [{ fromId: 'parentA', toId: 'parentB', type: 'SPOUSE' }];
    });
    
    await assert.doesNotReject(RelationshipEngine.validateParentCoupleRule('child1', 'parentB'));
  });

  it('allows adding a second parent when the first parent has no spouse (forming a new couple)', async () => {
    let callCount = 0;
    (prisma.relationship.findMany as any).mock.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return [{ fromId: 'parentA', toId: 'child1', type: 'PARENT' }];
      return []; // No spouses
    });
    
    await assert.doesNotReject(RelationshipEngine.validateParentCoupleRule('child1', 'parentB'));
  });
});
