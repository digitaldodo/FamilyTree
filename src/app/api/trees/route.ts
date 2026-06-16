import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, listResponse, parsePagination } from '@/lib/utils';
import { createTreeSchema } from '@/validations/tree.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees — List trees the authenticated user owns or collaborates on */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const userId = session.user.id;
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(
      request.nextUrl.searchParams,
    );

    // Fetch owned trees
    const [ownedTrees, ownedTotal] = await Promise.all([
      prisma.tree.findMany({
        where: { ownerId: userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { members: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.tree.count({ where: { ownerId: userId } }),
    ]);

    // Fetch collaborated trees
    const [collaborations, collabTotal] = await Promise.all([
      prisma.treeCollaborator.findMany({
        where: { userId },
        include: {
          tree: {
            include: {
              _count: { select: { members: true } },
              owner: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.treeCollaborator.count({ where: { userId } }),
    ]);

    // Combine with role field
    const ownedWithRole = ownedTrees.map((tree) => ({
      ...tree,
      role: 'OWNER' as const,
    }));

    const collabWithRole = collaborations.map((collab) => ({
      ...collab.tree,
      role: collab.role,
    }));

    const allTrees = [...ownedWithRole, ...collabWithRole];
    const total = ownedTotal + collabTotal;

    return listResponse(allTrees, total, page, limit);
  } catch (error) {
    console.error('[TREE_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** POST /api/trees — Create a new tree (ownerId derived from session) */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const body = await request.json();
    // Strip ownerId from body — we always use session user
    const { ownerId: _ignoredOwnerId, ...bodyWithoutOwner } = body;

    const validation = createTreeSchema
      .omit({ ownerId: true })
      .extend({ ownerId: createTreeSchema.shape.ownerId.optional() })
      .safeParse(bodyWithoutOwner);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const { ownerId: _unused, ...rest } = validation.data;

    const tree = await prisma.tree.create({
      data: {
        ...rest,
        owner: { connect: { id: session.user.id } },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return successResponse(tree, 'Tree created successfully', 201);
  } catch (error) {
    console.error('[TREE_CREATE_ERROR]', error);
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
