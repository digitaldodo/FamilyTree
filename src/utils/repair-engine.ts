import { Relationship } from '@/generated/prisma/client';

export function calculateRepairActions(relationships: Relationship[]) {
  const idsToDelete = new Set<string>();
  let repairedCount = 0;

  // 1. Self-References
  for (const rel of relationships) {
    if (rel.fromId === rel.toId) {
      idsToDelete.add(rel.id);
      repairedCount++;
    }
  }

  // 2. Duplicates
  const seenPairs = new Set<string>();
  for (const rel of relationships) {
    if (idsToDelete.has(rel.id)) continue;
    
    let key = '';
    if (rel.type === 'PARENT') {
      key = `PARENT-${rel.fromId}-${rel.toId}`;
    } else {
      const [a, b] = [rel.fromId, rel.toId].sort();
      key = `${rel.type}-${a}-${b}`;
    }

    if (seenPairs.has(key)) {
      idsToDelete.add(rel.id);
      repairedCount++;
    } else {
      seenPairs.add(key);
    }
  }

  // 3. Excess Parents (>2)
  const childParentsMap: Record<string, string[]> = {};
  for (const rel of relationships) {
    if (idsToDelete.has(rel.id)) continue;
    if (rel.type === 'PARENT') {
      if (!childParentsMap[rel.toId]) childParentsMap[rel.toId] = [];
      childParentsMap[rel.toId].push(rel.id);
    }
  }

  for (const parentRelIds of Object.values(childParentsMap)) {
    if (parentRelIds.length > 2) {
      // Keep the first 2 (oldest), delete the rest
      for (let i = 2; i < parentRelIds.length; i++) {
        idsToDelete.add(parentRelIds[i]);
        repairedCount++;
      }
    }
  }

  // 4. Circular Parent Chains
  const parentsAdjacency: Record<string, string[]> = {};
  for (const rel of relationships) {
    if (idsToDelete.has(rel.id)) continue;
    if (rel.type === 'PARENT') {
      if (!parentsAdjacency[rel.fromId]) parentsAdjacency[rel.fromId] = [];
      parentsAdjacency[rel.fromId].push(rel.toId);
    }
  }

  for (const rel of relationships) {
    if (idsToDelete.has(rel.id)) continue;
    if (rel.type !== 'PARENT') continue;

    const visited = new Set<string>();
    const dfs = (curr: string, target: string): boolean => {
      if (curr === target) return true;
      if (visited.has(curr)) return false;
      visited.add(curr);
      for (const child of parentsAdjacency[curr] || []) {
        if (dfs(child, target)) return true;
      }
      return false;
    };

    if (dfs(rel.toId, rel.fromId)) {
      idsToDelete.add(rel.id);
      repairedCount++;
      parentsAdjacency[rel.fromId] = parentsAdjacency[rel.fromId].filter(id => id !== rel.toId);
    }
  }

  return { idsToDelete: Array.from(idsToDelete), repairedCount };
}

export function calculateSyncParents(finalRelationships: Relationship[], treeId: string) {
  const newParents: Partial<Relationship>[] = [];
  let addedCount = 0;
  
  const spouses = finalRelationships.filter(r => r.type === 'SPOUSE');
  for (const spouseRel of spouses) {
    const spouseA = spouseRel.fromId;
    const spouseB = spouseRel.toId;

    const childrenA = finalRelationships.filter(r => r.type === 'PARENT' && r.fromId === spouseA).map(r => r.toId);
    const childrenB = finalRelationships.filter(r => r.type === 'PARENT' && r.fromId === spouseB).map(r => r.toId);

    for (const childId of childrenA) {
      if (!childrenB.includes(childId)) {
        const parentCount = finalRelationships.filter(r => r.type === 'PARENT' && r.toId === childId).length;
        if (parentCount < 2) {
          newParents.push({ type: 'PARENT', fromId: spouseB, toId: childId, treeId } as any);
          finalRelationships.push({ id: 'temp-' + addedCount, type: 'PARENT', fromId: spouseB, toId: childId } as any);
          addedCount++;
        }
      }
    }
    for (const childId of childrenB) {
      if (!childrenA.includes(childId)) {
        const parentCount = finalRelationships.filter(r => r.type === 'PARENT' && r.toId === childId).length;
        if (parentCount < 2) {
          newParents.push({ type: 'PARENT', fromId: spouseA, toId: childId, treeId } as any);
          finalRelationships.push({ id: 'temp-' + addedCount, type: 'PARENT', fromId: spouseA, toId: childId } as any);
          addedCount++;
        }
      }
    }
  }
  
  return { newParents, addedCount };
}
