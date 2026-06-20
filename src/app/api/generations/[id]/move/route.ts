import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { id } = await params;

    const generation = await prisma.generation.findUnique({
      where: { id },
      include: {
        tree: {
          include: {
            collaborators: { where: { userId: session.user.id } }
          }
        }
      }
    });

    if (!generation) return errorResponse('NOT_FOUND', 'Generation not found', 404);

    const { tree } = generation;
    const role = tree.ownerId === session.user.id ? 'OWNER' : tree.collaborators[0]?.role;

    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'EDITOR') {
      return errorResponse('FORBIDDEN', 'Insufficient permissions', 403);
    }

    const { direction } = await request.json();

    if (direction !== 'up' && direction !== 'down') {
      return errorResponse('VALIDATION_ERROR', 'Direction must be up or down', 400);
    }

    // Find the generation to swap with
    const adjacentGen = await prisma.generation.findFirst({
      where: {
        treeId: generation.treeId,
        orderIndex: direction === 'up' 
          ? { lt: generation.orderIndex }
          : { gt: generation.orderIndex }
      },
      orderBy: { orderIndex: direction === 'up' ? 'desc' : 'asc' }
    });

    if (!adjacentGen) {
      return errorResponse('CONFLICT', `Cannot move generation ${direction}`, 400);
    }

    // --- Relationship Consistency Validation ---
    // Moving a generation changes its orderIndex. We must ensure this doesn't break
    // engine rules (e.g., Parent must be exactly 1 generation older than Child).
    const membersInGenerations = await prisma.member.findMany({
      where: { generationId: { in: [id, adjacentGen.id] } },
      select: { id: true }
    });
    const memberIds = membersInGenerations.map(m => m.id);

    if (memberIds.length > 0) {
      const relationships = await prisma.relationship.findMany({
        where: { OR: [{ fromId: { in: memberIds } }, { toId: { in: memberIds } }] },
        include: {
          from: { include: { generation: true } },
          to: { include: { generation: true } }
        }
      });

      for (const rel of relationships) {
        const getSimulatedGenIndex = (memberGenId: string, originalIndex: number) => {
          if (memberGenId === id) return adjacentGen.orderIndex;
          if (memberGenId === adjacentGen.id) return generation.orderIndex;
          return originalIndex;
        };

        const fromGenIndex = getSimulatedGenIndex(rel.from.generationId, rel.from.generation.orderIndex);
        const toGenIndex = getSimulatedGenIndex(rel.to.generationId, rel.to.generation.orderIndex);

        if (rel.type === 'PARENT') {
          if (fromGenIndex !== toGenIndex - 1) {
            return errorResponse('VALIDATION_ERROR', `Cannot move generation: this would break the chronological parent-child relationship between ${rel.from.firstName} and ${rel.to.firstName}.`, 400);
          }
        } else if (rel.type === 'SPOUSE' || rel.type === 'SIBLING') {
          if (fromGenIndex !== toGenIndex) {
            return errorResponse('VALIDATION_ERROR', `Cannot move generation: this would break the chronological ${rel.type.toLowerCase()} relationship between ${rel.from.firstName} and ${rel.to.firstName}.`, 400);
          }
        }
      }
    }

    await prisma.$transaction([
      prisma.generation.update({
        where: { id },
        data: { orderIndex: adjacentGen.orderIndex }
      }),
      prisma.generation.update({
        where: { id: adjacentGen.id },
        data: { orderIndex: generation.orderIndex }
      })
    ]);

    return successResponse(null, 'Generation moved successfully');
  } catch (error) {
    console.error('[GENERATION_MOVE_ERROR]', error);
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}
