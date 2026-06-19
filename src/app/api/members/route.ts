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

    let finalGenerationId = generationId;

    // Phase: Relationship & Generation logic
    // Automatically calculate the target generation based on provided relationships.
    if (relations && Array.isArray(relations) && relations.length > 0) {
      const relativeIds = relations.map((r: any) => r.id).filter(Boolean);
      if (relativeIds.length > 0) {
        const relatives = await prisma.member.findMany({
          where: { id: { in: relativeIds } },
          include: { generation: true }
        });

        let targetOrderIndex: number | null = null;

        for (const rel of relations) {
          if (!rel.id || !rel.type) continue;
          const relative = relatives.find(r => r.id === rel.id);
          if (!relative) continue;

          const baseOrderIndex = typeof relative.generation?.orderIndex === 'number' ? relative.generation.orderIndex : 0;
          
          let expectedIndex: number;
          if (rel.type === 'PARENT') {
            expectedIndex = baseOrderIndex + 1;
          } else if (rel.type === 'CHILD') {
            expectedIndex = baseOrderIndex - 1;
          } else {
            expectedIndex = baseOrderIndex;
          }

          if (targetOrderIndex === null) {
            targetOrderIndex = expectedIndex;
          } else if (targetOrderIndex !== expectedIndex) {
            return errorResponse('VALIDATION_ERROR', 'Impossible structure: Selected relationships dictate conflicting generations.', 400);
          }
        }

        if (targetOrderIndex !== null) {
          // Find if generation exists at targetOrderIndex
          let targetGen = await prisma.generation.findFirst({
            where: { treeId, orderIndex: targetOrderIndex }
          });

          if (!targetGen) {
            // Need to create it. We must transactionally shift if targetOrderIndex < 0? 
            // In standard usage, generations only grow downwards (max + 1) or upwards.
            // Let's use the same logic as POST /api/generations
            targetGen = await prisma.$transaction(async (tx) => {
              // If we are inserting before 0 or anywhere, shift everything >= targetOrderIndex down
              await tx.generation.updateMany({
                where: { treeId, orderIndex: { gte: targetOrderIndex! } },
                data: { orderIndex: { increment: 1 } }
              });
              
              return await tx.generation.create({
                data: {
                  treeId,
                  name: `Generation ${targetOrderIndex! + 1}`,
                  orderIndex: targetOrderIndex!,
                }
              });
            });
          }
          finalGenerationId = targetGen.id;
        }
      }
    }

    if (!finalGenerationId) {
       return errorResponse('VALIDATION_ERROR', 'Generation could not be determined and was not provided.', 400);
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
