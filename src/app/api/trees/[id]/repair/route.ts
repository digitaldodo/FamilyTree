import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id: treeId } = await params;

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    const relationships = await prisma.relationship.findMany({
      where: { from: { treeId } },
      orderBy: { createdAt: 'asc' } // Keep older relationships if deleting duplicates
    });

    let repairedCount = 0;
    const idsToDelete = new Set<string>();

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
        // Remove from adjacency so we don't double count
        parentsAdjacency[rel.fromId] = parentsAdjacency[rel.fromId].filter(id => id !== rel.toId);
      }
    }

    // Execute deletions
    if (idsToDelete.size > 0) {
      await prisma.relationship.deleteMany({
        where: { id: { in: Array.from(idsToDelete) } }
      });
    }

    // 5. Existing Sync Spouses Children Logic
    const finalRelationships = await prisma.relationship.findMany({
      where: { from: { treeId } }
    });

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
            await prisma.relationship.create({
              data: { type: 'PARENT', fromId: spouseB, toId: childId, treeId }
            });
            finalRelationships.push({ id: 'temp', type: 'PARENT', fromId: spouseB, toId: childId } as any);
            repairedCount++;
          }
        }
      }
      for (const childId of childrenB) {
        if (!childrenA.includes(childId)) {
          const parentCount = finalRelationships.filter(r => r.type === 'PARENT' && r.toId === childId).length;
          if (parentCount < 2) {
            await prisma.relationship.create({
              data: { type: 'PARENT', fromId: spouseA, toId: childId, treeId }
            });
            finalRelationships.push({ id: 'temp', type: 'PARENT', fromId: spouseA, toId: childId } as any);
            repairedCount++;
          }
        }
      }
    }

    return successResponse({ repaired: repairedCount }, `Successfully repaired ${repairedCount} corrupted records or relationships`, 200);
  } catch (error) {
    console.error('[API Error] POST /api/trees/[treeId]/repair', error);
    return errorResponse('REPAIR_ERROR', 'Failed to repair relationships', 500);
  }
}
