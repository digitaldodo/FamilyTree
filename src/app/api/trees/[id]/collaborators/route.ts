import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canManageCollaborators } from '@/lib/permissions';
import { successResponse, errorResponse, listResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/:id/collaborators — List all collaborators for a tree */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canManageCollaborators(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to manage collaborators', 403);
    }

    const collaborators = await prisma.treeCollaborator.findMany({
      where: { treeId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listResponse(collaborators, collaborators.length, 1, collaborators.length);
  } catch (error) {
    console.error('[COLLAB_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/trees/:id/collaborators — Remove a collaborator from a tree */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canManageCollaborators(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to manage collaborators', 403);
    }

    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }
    const { userId } = body;

    if (!userId) {
      return errorResponse('VALIDATION_ERROR', 'userId is required', 400);
    }

    // Find the collaborator record
    const collaborator = await prisma.treeCollaborator.findUnique({
      where: { userId_treeId: { userId, treeId: id } },
    });

    if (!collaborator) {
      return errorResponse('NOT_FOUND', 'Collaborator not found', 404);
    }

    await prisma.treeCollaborator.delete({
      where: { userId_treeId: { userId, treeId: id } },
    });

    return successResponse({ userId, treeId: id }, 'Collaborator removed successfully');
  } catch (error) {
    console.error('[COLLAB_DELETE_ERROR]', error);
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
