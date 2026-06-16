import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canView } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateMemberSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/members/:id — Get a single member with relationships */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        relationsFrom: {
          include: { to: true },
        },
        relationsTo: {
          include: { from: true },
        },
        media: true,
      },
    });

    if (!member) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    const permission = await getTreePermission(session.user.id, member.treeId);
    if (!canView(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this member', 403);
    }

    return successResponse(member, 'Member retrieved successfully');
  } catch (error) {
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** PUT /api/members/:id — Update a member */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    // Verify member exists and get treeId
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    const permission = await getTreePermission(session.user.id, existing.treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this member', 403);
    }

    const body = await request.json();
    const validation = updateMemberSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const { birthDate, deathDate, ...rest } = validation.data;

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate !== undefined && {
          birthDate: birthDate ? new Date(birthDate) : null,
        }),
        ...(deathDate !== undefined && {
          deathDate: deathDate ? new Date(deathDate) : null,
        }),
      },
    });

    return successResponse(member, 'Member updated successfully');
  } catch (error) {
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/members/:id — Delete a member and its relationships */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    const permission = await getTreePermission(session.user.id, existing.treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to delete this member', 403);
    }

    // Transactional delete: relationships → media → member
    await prisma.$transaction([
      prisma.relationship.deleteMany({
        where: { OR: [{ fromId: id }, { toId: id }] },
      }),
      prisma.media.deleteMany({ where: { memberId: id } }),
      prisma.member.delete({ where: { id } }),
    ]);

    return successResponse({ id }, 'Member deleted successfully');
  } catch (error) {
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
