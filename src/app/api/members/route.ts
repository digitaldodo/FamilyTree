import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canView } from '@/lib/permissions';
import { successResponse, listResponse, errorResponse, parsePagination } from '@/lib/utils';
import { createMemberSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';
import { isSpouseEligible } from '@/utils/relationship';
import { createTreeSnapshot } from '@/lib/versioning';
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

    if (!members) {
      return errorResponse('FETCH_ERROR', 'No data returned', 500);
    }

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

    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }

     
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

      return errorResponse(
        'VALIDATION_ERROR',
        `Validation failed: ${Object.values(validation.error.flatten().fieldErrors).flat().join(', ')}`,
        400
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
      const uniqueIds = new Set(relativeIds);
      if (uniqueIds.size !== relativeIds.length) {
        return errorResponse('VALIDATION_ERROR', 'Duplicate relationships are not allowed.', 400);
      }

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
            const spousesInPayload = relations.filter((r: any) => r.type === 'SPOUSE');
            if (spousesInPayload.length > 1) {
              return errorResponse('VALIDATION_ERROR', 'Member already has a spouse.', 400);
            }
            if (relGenOrder !== targetGenOrder || !isSpouseEligible(rest.gender as string | null | undefined, relative.gender)) {
              return errorResponse('VALIDATION_ERROR', 'Spouse must belong to the same generation and satisfy spouse eligibility rules.', 400);
            }
            const relativeSpouseCount = await prisma.relationship.count({
              where: {
                type: 'SPOUSE',
                OR: [{ fromId: rel.id }, { toId: rel.id }]
              }
            });
            if (relativeSpouseCount > 0) {
              return errorResponse('VALIDATION_ERROR', 'Member already has a spouse.', 400);
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
          // Handled by Database triggers, but we can also pre-validate
          // Let's rely on DB triggers for max limits during member creation to simplify code

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
            const [id1, id2] = [newMember.id, rel.id].sort();
            await prisma.relationship.create({
              data: {
                type: rel.type,
                fromId: id1,
                toId: id2,
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

    try {
      await createTreeSnapshot(treeId, session.user.id, `Added member ${newMember.firstName}`);
    } catch (e) {
      console.error('Failed to create tree snapshot', e);
    }

    if (!newMember) {
      return errorResponse('FETCH_ERROR', 'No data returned', 500);
    }

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
