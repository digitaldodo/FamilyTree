import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { deriveFamilyConnections } from './family-connections';
import { MemberWithRelations } from '@/types/member';

function createMockMember(id: string, relationsFrom: any[] = [], relationsTo: any[] = []): MemberWithRelations {
  return {
    id,
    firstName: 'Mock',
    lastName: id,
    relationsFrom,
    relationsTo,
  } as unknown as MemberWithRelations;
}

describe('deriveFamilyConnections', () => {
  test('Member with parents -> parents displayed', () => {
    const child = createMockMember('child', [], [
      { id: '1', type: 'PARENT', fromId: 'p1', toId: 'child' },
      { id: '2', type: 'PARENT', fromId: 'p2', toId: 'child' },
    ]);
    const p1 = createMockMember('p1', [{ id: '1', type: 'PARENT', fromId: 'p1', toId: 'child' }], []);
    const p2 = createMockMember('p2', [{ id: '2', type: 'PARENT', fromId: 'p2', toId: 'child' }], []);

    const allMembers = [child, p1, p2];
    const connections = deriveFamilyConnections(child, allMembers);

    assert.deepStrictEqual(connections.parents.sort(), ['p1', 'p2']);
    assert.deepStrictEqual(connections.children, []);
    assert.deepStrictEqual(connections.spouses, []);
  });

  test('Member with spouse -> spouse displayed', () => {
    // A -> B spouse link. From A's perspective.
    const m1 = createMockMember('m1', [{ id: '1', type: 'SPOUSE', fromId: 'm1', toId: 'm2' }], []);
    const m2 = createMockMember('m2', [], [{ id: '1', type: 'SPOUSE', fromId: 'm1', toId: 'm2' }]);

    const allMembers = [m1, m2];
    const connections1 = deriveFamilyConnections(m1, allMembers);
    const connections2 = deriveFamilyConnections(m2, allMembers);

    assert.deepStrictEqual(connections1.spouses, ['m2']);
    assert.deepStrictEqual(connections2.spouses, ['m1']);
  });

  test('Member with children -> children displayed', () => {
    const parent = createMockMember('parent', [{ id: '1', type: 'PARENT', fromId: 'parent', toId: 'c1' }], []);
    const c1 = createMockMember('c1', [], [{ id: '1', type: 'PARENT', fromId: 'parent', toId: 'c1' }]);

    const allMembers = [parent, c1];
    const connections = deriveFamilyConnections(parent, allMembers);

    assert.deepStrictEqual(connections.children, ['c1']);
    assert.deepStrictEqual(connections.parents, []);
  });

  test('Member with siblings -> siblings displayed', () => {
    const parent = createMockMember('parent', [
      { id: '1', type: 'PARENT', fromId: 'parent', toId: 'c1' },
      { id: '2', type: 'PARENT', fromId: 'parent', toId: 'c2' },
    ], []);
    
    const c1 = createMockMember('c1', [], [{ id: '1', type: 'PARENT', fromId: 'parent', toId: 'c1' }]);
    const c2 = createMockMember('c2', [], [{ id: '2', type: 'PARENT', fromId: 'parent', toId: 'c2' }]);

    const allMembers = [parent, c1, c2];
    const c1Connections = deriveFamilyConnections(c1, allMembers);
    
    assert.deepStrictEqual(c1Connections.siblings, ['c2']);
    assert.deepStrictEqual(c1Connections.parents, ['parent']);
  });

  test('Member with no relationships -> empty state', () => {
    const m1 = createMockMember('m1');
    const allMembers = [m1];
    const connections = deriveFamilyConnections(m1, allMembers);

    assert.deepStrictEqual(connections.parents, []);
    assert.deepStrictEqual(connections.children, []);
    assert.deepStrictEqual(connections.spouses, []);
    assert.deepStrictEqual(connections.siblings, []);
  });
  
  test('Grandparents and grandchildren displayed correctly', () => {
    // GP -> P -> C
    const gp = createMockMember('gp', [{ id: '1', type: 'PARENT', fromId: 'gp', toId: 'p' }]);
    const p = createMockMember('p', [{ id: '2', type: 'PARENT', fromId: 'p', toId: 'c' }], [{ id: '1', type: 'PARENT', fromId: 'gp', toId: 'p' }]);
    const c = createMockMember('c', [], [{ id: '2', type: 'PARENT', fromId: 'p', toId: 'c' }]);
    
    const allMembers = [gp, p, c];
    
    const cConnections = deriveFamilyConnections(c, allMembers);
    assert.deepStrictEqual(cConnections.grandparents, ['gp']);
    assert.deepStrictEqual(cConnections.parents, ['p']);
    
    const gpConnections = deriveFamilyConnections(gp, allMembers);
    assert.deepStrictEqual(gpConnections.grandchildren, ['c']);
    assert.deepStrictEqual(gpConnections.children, ['p']);
  });
});
