import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/trees/:id/generations/shift — Shift generations down starting from a specific index */
export async function POST(request: NextRequest, { params }: Params) {
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

    const body = await request.json();
    const { insertAt } = body;

    if (typeof insertAt !== 'number') {
      return errorResponse('VALIDATION_ERROR', 'insertAt is required and must be a number', 400);
    }

    await prisma.member.updateMany({
      where: {
        treeId,
        generation: {
          gte: insertAt
        }
      },
      data: {
        generation: {
          increment: 1
        }
      }
    });

    return successResponse(null, 'Generations shifted successfully');
  } catch (error) {
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}
