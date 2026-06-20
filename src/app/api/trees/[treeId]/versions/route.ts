import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canView } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ treeId: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/:treeId/versions — Get all versions for a tree */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { treeId } = await params;

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canView(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tree', 403);
    }

    const versions = await prisma.treeVersion.findMany({
      where: { treeId },
      select: {
        id: true,
        treeId: true,
        name: true,
        createdBy: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(versions, 'Tree versions retrieved successfully');
  } catch (error) {
    console.error('[TREE_VERSIONS_GET_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}
