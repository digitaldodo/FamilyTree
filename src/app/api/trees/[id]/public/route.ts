import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/:id/public — Get a public tree (no auth required) */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const tree = await prisma.tree.findUnique({
      where: { id, isPublic: true },
      include: {
        owner: { select: { id: true, name: true } },
        generations: { orderBy: { orderIndex: 'asc' } },
        members: {
          orderBy: [{ firstName: 'asc' }],
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
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found or is not public', 404);
    }

    // Strip sensitive information
    const sanitizedMembers = tree.members.map(member => {
      const { email, phone, ...safeMember } = member;
      return safeMember;
    });

    const safeTree = {
      ...tree,
      members: sanitizedMembers,
    };

    return successResponse(safeTree, 'Public tree retrieved successfully');
  } catch (error) {
    console.error('[PUBLIC_TREE_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}
