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

    console.log('[MEMBER_CREATE] Payload received:', {
      userId: session.user.id,
      treeId: body.treeId,
      firstName: body.firstName,
      lastName: body.lastName,
      hasRelations: Array.isArray(body.relations) ? body.relations.length : 0,
    });

    const validation = createMemberSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      console.error('[MEMBER_CREATE_VALIDATION_ERROR]', {
        userId: session.user.id,
        treeId: body.treeId,
        errors: validation.error.issues,
      });
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const { treeId, birthDate, deathDate, generationId, ...rest } = validation.data;

    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId is required', 400);
    }

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canEdit(permission)) {
      console.error('[MEMBER_CREATE_PERMISSION_ERROR]', {
        userId: session.user.id,
        treeId,
        permission,
      });
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    // Verify the tree exists
    const tree = await prisma.tree.findUnique({ where: { id: treeId } });
    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const relations = body.relations || [];

    // Clean the data: convert empty strings to null for optional fields
    // so Prisma stores NULL instead of empty strings
    const cleanData = (obj: Record<string, unknown>) => {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        cleaned[key] = value === '' ? null : value;
      }
      return cleaned;
    };

    console.log('[MEMBER_CREATE] Creating member with data:', {
      userId: session.user.id,
      treeId,
      generationId,
      cleanedFields: Object.keys(rest),
      hasBirthDate: !!birthDate,
      hasDeathDate: !!deathDate,
      relationCount: relations.length,
    });

    // Create the member first, then add relationships
    const newMember = await prisma.member.create({
      data: {
        firstName: rest.firstName,
        lastName: rest.lastName,
        ...cleanData(rest),
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        tree: { connect: { id: treeId } },
        generation: { connect: { id: generationId } },
      } as any,
    });

    // Create relationships if any
    if (relations && Array.isArray(relations) && relations.length > 0) {
      for (const rel of relations) {
        if (!rel.id || !rel.type) continue;

        try {
          if (rel.type === 'PARENT') {
            await prisma.relationship.create({
              data: {
                type: 'PARENT',
                fromId: rel.id,
                toId: newMember.id,
              },
            });
          } else {
            await prisma.relationship.create({
              data: {
                type: rel.type,
                fromId: newMember.id,
                toId: rel.id,
              },
            });
          }
        } catch (relError) {
          console.error('[MEMBER_CREATE_RELATIONSHIP_ERROR]', {
            memberId: newMember.id,
            relation: rel,
            error: getErrorMessage(relError),
          });
          // Continue creating other relationships even if one fails
        }
      }
    }

    console.log('[MEMBER_CREATE_SUCCESS]', {
      memberId: newMember.id,
      treeId,
      userId: session.user.id,
    });

    return successResponse(newMember, 'Member created successfully', 201);
  } catch (error) {
    console.error('[MEMBER_CREATE_ERROR]', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
