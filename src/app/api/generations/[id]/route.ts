import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateGenerationSchema } from '@/validations/generation.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Helper to verify tree access for a generation */
async function verifyGenerationAccess(generationId: string, userId: string) {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    include: {
      tree: {
        include: {
          collaborators: { where: { userId } }
        }
      }
    }
  });

  if (!generation) return { error: errorResponse('NOT_FOUND', 'Generation not found', 404) };

  const { tree } = generation;
  const role = tree.ownerId === userId ? 'OWNER' : tree.collaborators[0]?.role;

  if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'EDITOR') {
    return { error: errorResponse('FORBIDDEN', 'Insufficient permissions', 403) };
  }

  return { generation, role };
}

/** PUT /api/generations/[id] — Rename a generation */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { id } = await params;

    const access = await verifyGenerationAccess(id, session.user.id);
    if (access.error) return access.error;

    const body = await request.json();
    const validation = updateGenerationSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.issues.map(e => e.message).join(', '), 400);
    }

    const updatedGen = await prisma.generation.update({
      where: { id },
      data: { name: validation.data.name },
    });

    return successResponse(updatedGen, 'Generation renamed successfully');
  } catch (error) {
    console.error('[GENERATION_PUT_ERROR]', error);
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/generations/[id] — Delete an empty generation */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { id } = await params;

    const access = await verifyGenerationAccess(id, session.user.id);
    if (access.error) return access.error;

    // Check if generation is empty
    const membersCount = await prisma.member.count({
      where: { generationId: id }
    });

    if (membersCount > 0) {
      return errorResponse('CONFLICT', 'Cannot delete a generation that contains members', 409);
    }

    const generation = access.generation!;
    
    // Delete and shift subsequent generations orderIndex down by 1
    await prisma.$transaction(async (tx) => {
      await tx.generation.delete({ where: { id } });
      
      await tx.generation.updateMany({
        where: {
          treeId: generation.treeId,
          orderIndex: { gt: generation.orderIndex }
        },
        data: {
          orderIndex: { decrement: 1 }
        }
      });
    });

    return successResponse(null, 'Generation deleted successfully');
  } catch (error) {
    console.error('[GENERATION_DELETE_ERROR]', error);
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
