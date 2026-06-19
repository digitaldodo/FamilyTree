import { NextRequest, NextResponse } from 'next/server';
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
     
    console.log('[API Debug] GET /api/members', {
      method: 'GET',
      url: request.url,
      status: 500,
      queryParams: Object.fromEntries(request.nextUrl.searchParams),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
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

     
    console.log('[API Debug] POST /api/members request', {
      method: 'POST',
      url: request.url,
      userId: session.user.id,
      payload: body,
    });

    const validation = createMemberSchema.safeParse(body);

    if (!validation.success) {
       
      console.log('[API Debug] POST /api/members validation error', {
        method: 'POST',
        url: request.url,
        status: 400,
        errors: validation.error.flatten(),
        payload: body,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten(),
          payload: body,
        },
        { status: 400 }
      );
    }

    const { treeId, birthDate, deathDate, generationId, ...rest } = validation.data;

    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId is required', 400);
    }

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canEdit(permission)) {
       
      console.log('[API Debug] POST /api/members permission error', {
        method: 'POST',
        url: request.url,
        status: 403,
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
    const cleanData = (obj: Record<string, unknown>) => {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        cleaned[key] = value === '' ? null : value;
      }
      return cleaned;
    };

    const finalGenerationId = generationId;
    if (!finalGenerationId) {
       return errorResponse('VALIDATION_ERROR', 'Generation could not be determined and was not provided.', 400);
    }

    const targetGen = await prisma.generation.findUnique({ where: { id: finalGenerationId } });
    if (!targetGen) {
      return errorResponse('NOT_FOUND', 'Selected generation not found', 404);
    }

    // Phase: Relationship & Generation logic
    // Strictly validate the provided relationships against the selected generation.
    if (relations && Array.isArray(relations) && relations.length > 0) {
      const relativeIds = relations.map((r: any) => r.id).filter(Boolean);
      if (relativeIds.length > 0) {
        const relatives = await prisma.member.findMany({
          where: { id: { in: relativeIds } },
          include: { generation: true }
        });

        for (const rel of relations) {
          if (!rel.id || !rel.type) continue;
          const relative = relatives.find(r => r.id === rel.id);
          if (!relative) continue;

          const relGenOrder = relative.generation.orderIndex;
          const targetGenOrder = targetGen.orderIndex;

          if (rel.type === 'PARENT') {
            // Target member is child, relative is parent. Parent must be older (lower orderIndex).
            if (relGenOrder >= targetGenOrder) {
              return errorResponse('VALIDATION_ERROR', 'Parent must belong to an older generation.', 400);
            }
          } else if (rel.type === 'CHILD') {
            // Target member is parent, relative is child. Child must be younger (higher orderIndex).
            if (relGenOrder <= targetGenOrder) {
              return errorResponse('VALIDATION_ERROR', 'Child must belong to a younger generation.', 400);
            }
          } else if (rel.type === 'SPOUSE') {
            if (relGenOrder !== targetGenOrder) {
              return errorResponse('VALIDATION_ERROR', 'Spouse must belong to the same generation.', 400);
            }
          } else if (rel.type === 'SIBLING') {
            if (relGenOrder !== targetGenOrder) {
              return errorResponse('VALIDATION_ERROR', 'Sibling must belong to the same generation.', 400);
            }
          }
        }
      }
    }

     
    console.log('[API Debug] POST /api/members creating', {
      userId: session.user.id,
      treeId,
      generationId: finalGenerationId,
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
        generation: { connect: { id: finalGenerationId } },
      } as any,
    });

    // Create relationships if any
    if (relations && Array.isArray(relations) && relations.length > 0) {
      for (const rel of relations) {
        if (!rel.id || !rel.type) continue;

        try {
          // Constraints check
          if (rel.type === 'SPOUSE') {
            const existingSpouses = await prisma.relationship.count({
              where: { type: 'SPOUSE', OR: [{ fromId: rel.id }, { toId: rel.id }] }
            });
            if (existingSpouses >= 1) throw new Error('Maximum 1 spouse allowed.');
          }
          if (rel.type === 'CHILD') {
            const existingParents = await prisma.relationship.count({
              where: { type: 'PARENT', toId: rel.id }
            });
            if (existingParents >= 2) throw new Error('A member can have at most two parents.');
          }
          if (rel.type === 'PARENT') {
            const existingParents = await prisma.relationship.count({
              where: { type: 'PARENT', toId: newMember.id }
            });
            if (existingParents >= 2) throw new Error('A member can have at most two parents.');
          }

          if (rel.type === 'PARENT') {
            await prisma.relationship.create({
              data: {
                type: 'PARENT',
                fromId: rel.id,
                toId: newMember.id,
              },
            });
          } else if (rel.type === 'CHILD') {
            await prisma.relationship.create({
              data: {
                type: 'PARENT',
                fromId: newMember.id,
                toId: rel.id,
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
           
          console.log('[API Debug] POST /api/members relationship error', {
            method: 'POST',
            url: request.url,
            memberId: newMember.id,
            relation: rel,
            error: getErrorMessage(relError),
          });
          // Continue creating other relationships even if one fails
        }
      }
    }

     
    console.log('[API Debug] POST /api/members success', {
      method: 'POST',
      url: request.url,
      status: 201,
      memberId: newMember.id,
      treeId,
      userId: session.user.id,
    });

    return successResponse(newMember, 'Member created successfully', 201);
  } catch (error) {
     
    console.log('[API Debug] POST /api/members error', {
      method: 'POST',
      url: request.url,
      status: 500,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
