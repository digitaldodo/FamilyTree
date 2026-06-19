import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { treeId } = await params;

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    // Find all spouses in this tree
    const spouses = await prisma.relationship.findMany({
      where: {
        type: 'SPOUSE',
        from: { treeId }
      }
    });

    let repairedCount = 0;

    for (const spouseRel of spouses) {
      const spouseA = spouseRel.fromId;
      const spouseB = spouseRel.toId;

      // Children of A
      const childrenA = await prisma.relationship.findMany({
        where: { type: 'PARENT', fromId: spouseA }
      });
      
      // Children of B
      const childrenB = await prisma.relationship.findMany({
        where: { type: 'PARENT', fromId: spouseB }
      });

      const childIdsA = childrenA.map(c => c.toId);
      const childIdsB = childrenB.map(c => c.toId);

      // Add missing to B
      for (const childId of childIdsA) {
        if (!childIdsB.includes(childId)) {
          const parentCount = await prisma.relationship.count({
            where: { type: 'PARENT', toId: childId }
          });
          if (parentCount < 2) {
            await prisma.relationship.create({
              data: { type: 'PARENT', fromId: spouseB, toId: childId }
            });
            repairedCount++;
          }
        }
      }

      // Add missing to A
      for (const childId of childIdsB) {
        if (!childIdsA.includes(childId)) {
          const parentCount = await prisma.relationship.count({
            where: { type: 'PARENT', toId: childId }
          });
          if (parentCount < 2) {
            await prisma.relationship.create({
              data: { type: 'PARENT', fromId: spouseA, toId: childId }
            });
            repairedCount++;
          }
        }
      }
    }

    return successResponse({ repaired: repairedCount }, `Successfully repaired ${repairedCount} relationships`, 200);
  } catch (error) {
    console.error('[API Error] POST /api/trees/[treeId]/repair', error);
    return errorResponse('REPAIR_ERROR', 'Failed to repair relationships', 500);
  }
}
