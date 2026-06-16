import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/default — Get the user's default (first) tree */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const userId = session.user.id;

    // Fetch the first tree the user owns
    const tree = await prisma.tree.findFirst({
      where: { ownerId: userId },
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
      // Return success with null data if they don't have any trees yet
      return successResponse(null, 'No trees found');
    }

    return successResponse(tree, 'Default tree retrieved successfully');
  } catch (error) {
    console.error('[DEFAULT_TREE_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}
