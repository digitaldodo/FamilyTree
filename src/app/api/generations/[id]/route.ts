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

/** PATCH /api/generations/[id] — Rename a generation */
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

    const access = await verifyGenerationAccess(id, session.user.id);
    if (access.error) return access.error;

    const body = await request.json();
    const validation = updateGenerationSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.issues.map(e => e.message).join(', '), 400);
    }

    const newName = validation.data.name;

    // Check for duplicate generation name
    const existing = await prisma.generation.findFirst({
      where: {
        treeId: access.generation.treeId,
        name: { equals: newName, mode: 'insensitive' },
        id: { not: id }
      }
    });

    if (existing) {
      return errorResponse('CONFLICT', 'Generation name already exists', 400);
    }

    const updatedGen = await prisma.generation.update({
      where: { id },
      data: { name: newName },
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

    const action = request.nextUrl.searchParams.get('action');
    const targetId = request.nextUrl.searchParams.get('targetId');

    // Check if generation is empty
    const membersCount = await prisma.member.count({
      where: { generationId: id }
    });

    const generation = access.generation!;

    if (membersCount > 0) {
      if (!action) {
        return errorResponse('CONFLICT', 'Cannot delete a generation that contains members without specifying an action', 409);
      }

      if (action === 'moveMembers') {
        if (!targetId) return errorResponse('VALIDATION_ERROR', 'Target generation ID required to move members', 400);
        const targetGen = await prisma.generation.findUnique({ where: { id: targetId } });
        if (!targetGen) return errorResponse('NOT_FOUND', 'Target generation not found', 404);

        await prisma.member.updateMany({
          where: { generationId: id },
          data: { generationId: targetId }
        });
      } else if (action === 'deleteMembers') {
        const members = await prisma.member.findMany({ where: { generationId: id }, select: { id: true } });
        const memberIds = members.map(m => m.id);

        await prisma.$transaction(async (tx) => {
          await tx.relationship.deleteMany({
            where: { OR: [{ fromId: { in: memberIds } }, { toId: { in: memberIds } }] }
          });
          await tx.media.deleteMany({ where: { memberId: { in: memberIds } } });
          await tx.member.deleteMany({ where: { generationId: id } });
        });
      } else {
        return errorResponse('VALIDATION_ERROR', 'Invalid action', 400);
      }
    }
    
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
