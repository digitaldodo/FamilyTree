import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';

import { calculateRepairActions, calculateSyncParents } from '@/utils/repair-engine';

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
      where: { treeId },
      orderBy: { createdAt: 'asc' } // Keep older relationships if deleting duplicates
    });

    const { idsToDelete, repairedCount: deletedCount } = calculateRepairActions(relationships);

    // Execute deletions
    if (idsToDelete.length > 0) {
      await prisma.relationship.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // 5. Existing Sync Spouses Children Logic
    const finalRelationships = await prisma.relationship.findMany({
      where: { treeId }
    });

    const { newParents, addedCount } = calculateSyncParents(finalRelationships, treeId);
    
    if (newParents.length > 0) {
      await prisma.relationship.createMany({
        data: newParents as any
      });
    }

    const totalRepaired = deletedCount + addedCount;

    return successResponse({ repaired: totalRepaired, duplicates: deletedCount }, `Successfully repaired ${totalRepaired} corrupted records or relationships`, 200);
  } catch (error) {
    console.error('[API Error] POST /api/trees/[treeId]/repair', error);
    return errorResponse('REPAIR_ERROR', 'Failed to repair relationships', 500);
  }
}
