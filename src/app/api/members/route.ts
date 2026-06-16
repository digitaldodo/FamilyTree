import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canView } from '@/lib/permissions';
import { successResponse, listResponse, errorResponse, parsePagination } from '@/lib/utils';
import { createMemberSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/members — List members for a specific tree with pagination */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const treeId = request.nextUrl.searchParams.get('treeId');
    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId query parameter is required', 400);
    }

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canView(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tree', 403);
    }

    const { page, limit, skip, sortBy, sortOrder } = parsePagination(
      request.nextUrl.searchParams,
    );

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { treeId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          relationsFrom: true,
          relationsTo: true,
        },
      }),
      prisma.member.count({ where: { treeId } }),
    ]);

    return listResponse(members, total, page, limit);
  } catch (error) {
    console.error('[MEMBER_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** POST /api/members — Create a new member */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const body = await request.json();
    const validation = createMemberSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const { treeId, birthDate, deathDate, ...rest } = validation.data;

    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId is required', 400);
    }

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    // Verify the tree exists
    const tree = await prisma.tree.findUnique({ where: { id: treeId } });
    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const relations = body.relations || [];

    const member = await prisma.$transaction(async (tx) => {
      const newMember = await tx.member.create({
        data: {
          ...rest,
          birthDate: birthDate ? new Date(birthDate) : null,
          deathDate: deathDate ? new Date(deathDate) : null,
          tree: { connect: { id: treeId } },
        },
      });

      if (relations && Array.isArray(relations) && relations.length > 0) {
        for (const rel of relations) {
          if (!rel.id || !rel.type) continue;
          
          if (rel.type === 'PARENT') {
            await tx.relationship.create({
              data: {
                type: 'PARENT',
                fromId: rel.id,
                toId: newMember.id,
              },
            });
          } else {
            await tx.relationship.create({
              data: {
                type: rel.type,
                fromId: newMember.id,
                toId: rel.id,
              },
            });
          }
        }
      }

      return newMember;
    });

    return successResponse(member, 'Member created successfully', 201);
  } catch (error) {
    console.error('[MEMBER_CREATE_ERROR]', error);
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
