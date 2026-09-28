import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canView } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ versionId: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/treeVersion/:versionId — Get a specific tree version */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { versionId } = await params;

    const version = await prisma.treeVersion.findUnique({
      where: { id: versionId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!version) {
      return errorResponse('NOT_FOUND', 'Tree version not found', 404);
    }

    const permission = await getTreePermission(session.user.id, version.treeId);
    if (!canView(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tree version', 403);
    }

    // Parse JSON data before returning
    const parsedVersion = {
      ...version,
      members: typeof version.membersData === 'string' ? JSON.parse(version.membersData) : version.membersData,
      relations: typeof version.relationsData === 'string' ? JSON.parse(version.relationsData) : version.relationsData,
      generations: typeof version.gensData === 'string' ? JSON.parse(version.gensData) : version.gensData,
    };

    return successResponse(parsedVersion, 'Tree version retrieved successfully');
  } catch (error) {
    console.error('[TREE_VERSION_GET_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}
