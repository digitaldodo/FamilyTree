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
