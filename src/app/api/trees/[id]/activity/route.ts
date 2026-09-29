import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canManageCollaborators } from '@/lib/permissions';
import { errorResponse, listResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/:id/activity — List activity logs for a tree */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canManageCollaborators(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to view activity logs', 403);
    }

    const activities = await prisma.activityLog.findMany({
      where: { entityType: 'TREE', entityId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return listResponse(activities, activities.length, 1, activities.length);
  } catch (error) {
    console.error('[ACTIVITY_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}
