import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canDelete, canView } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateTreeSchema } from '@/validations/tree.schema';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/:id — Get a tree with all members and relationships */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canView(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tree', 403);
    }

    const tree = await prisma.tree.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        generations: { orderBy: { orderIndex: 'asc' } },
        members: {
          orderBy: [{ firstName: 'asc' }],
          include: {
            generation: { select: { id: true, name: true, orderIndex: true } },
            relationsFrom: {
              select: {
                id: true, type: true, fromId: true, toId: true,
                to: { select: { id: true, firstName: true, lastName: true, imageUrl: true } }
              }
            },
            relationsTo: {
              select: {
                id: true, type: true, fromId: true, toId: true,
                from: { select: { id: true, firstName: true, lastName: true, imageUrl: true } }
              }
            },
            media: { select: { id: true, url: true, type: true } },
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    return successResponse(tree, 'Tree retrieved successfully');
  } catch (error) {
    console.error('[TREE_GET_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** PUT /api/trees/:id — Update a tree */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    const body = await request.json();
    const validation = updateTreeSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const existing = await prisma.tree.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const tree = await prisma.tree.update({
      where: { id },
      data: validation.data,
      include: {
        _count: { select: { members: true } },
      },
    });

    return successResponse(tree, 'Tree updated successfully');
  } catch (error) {
    console.error('[TREE_UPDATE_ERROR]', error);
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/trees/:id — Delete a tree and all its members */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canDelete(permission)) {
      return errorResponse('FORBIDDEN', 'Only the tree owner can delete this tree', 403);
    }

    const existing = await prisma.tree.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    // Cascade: relationships → media → members → tree
    const memberIds = await prisma.member.findMany({
      where: { treeId: id },
      select: { id: true },
    });
    const ids = memberIds.map((m: any) => m.id);

    await prisma.$transaction([
      prisma.relationship.deleteMany({
        where: { OR: [{ fromId: { in: ids } }, { toId: { in: ids } }] },
      }),
      prisma.media.deleteMany({ where: { memberId: { in: ids } } }),
      prisma.member.deleteMany({ where: { treeId: id } }),
      prisma.treeCollaborator.deleteMany({ where: { treeId: id } }),
      prisma.invite.deleteMany({ where: { treeId: id } }),
      prisma.tree.delete({ where: { id } }),
    ]);

    return successResponse({ id }, 'Tree deleted successfully');
  } catch (error) {
    console.error('[TREE_DELETE_ERROR]', error);
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
