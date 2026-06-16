import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateTreeSchema } from '@/validations/tree.schema';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

/** GET /api/trees/:id — Get a tree with all members and relationships */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const tree = await prisma.tree.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          orderBy: [{ generation: 'asc' }, { firstName: 'asc' }],
          include: {
            relationsFrom: {
              include: {
                to: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
            relationsTo: {
              include: {
                from: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
            media: true,
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
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** PUT /api/trees/:id — Update a tree */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateTreeSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.errors
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
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/trees/:id — Delete a tree and all its members */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.tree.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    // Cascade: relationships → media → members → tree
    const memberIds = await prisma.member.findMany({
      where: { treeId: id },
      select: { id: true },
    });
    const ids = memberIds.map((m) => m.id);

    await prisma.$transaction([
      prisma.relationship.deleteMany({
        where: { OR: [{ fromId: { in: ids } }, { toId: { in: ids } }] },
      }),
      prisma.media.deleteMany({ where: { memberId: { in: ids } } }),
      prisma.member.deleteMany({ where: { treeId: id } }),
      prisma.tree.delete({ where: { id } }),
    ]);

    return successResponse({ id }, 'Tree deleted successfully');
  } catch (error) {
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
