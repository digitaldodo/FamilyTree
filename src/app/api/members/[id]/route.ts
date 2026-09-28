import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canView } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateMemberSchema } from '@/validations/member.schema';
import { isSpouseEligible } from '@/utils/relationship';
import { createTreeSnapshot } from '@/lib/versioning';
import { computeRelationshipDiff, normalizeRelationshipSet } from '@/lib/relationship-canonical';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeNullableFields<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => [
      key,
      typeof value === 'string' && value.trim() === '' ? null : value,
    ])
  );
}

/** GET /api/members/:id — Get a single member with relationships */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        relationsFrom: {
          include: { to: true },
        },
        relationsTo: {
          include: { from: true },
        },
        media: true,
      },
    });

    if (!member) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    const permission = await getTreePermission(session.user.id, member.treeId);
    if (!canView(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have access to this member', 403);
    }

    if (!member) {
      return errorResponse('FETCH_ERROR', 'No data returned', 500);
    }

    return successResponse({ ...member }, 'Member retrieved successfully');
  } catch (error: any) {
    console.error('[MEMBER_GET_ERROR]', error);
    return NextResponse.json({ success: false, message: error.message || 'Fetch failed' }, { status: 500 });
  }
}

/** PUT /api/members/:id — Update a member */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    // Verify member exists and get treeId
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    const permission = await getTreePermission(session.user.id, existing.treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this member', 403);
    }

    let body = null;
    try {
      body = await request.json();
    } catch {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }
    const validation = updateMemberSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        '[MEMBER_VALIDATION_ERROR]',
        validation.error.flatten()
      );

      console.error(
        '[MEMBER_PAYLOAD]',
        JSON.stringify(body, null, 2)
      );

      return errorResponse(
        'VALIDATION_ERROR',
        `Validation failed: ${Object.values(validation.error.flatten().fieldErrors).flat().join(', ')}`,
        400
      );
    }

    const { birthDate, deathDate, generationId, relations, ...rest } = validation.data;
    const memberData = normalizeNullableFields(rest);
    const safeRelations = Array.isArray(relations) ? relations : [];

    if (relations && Array.isArray(relations)) {
      const relationIds = relations.map((r: any) => r.id).filter(Boolean);
      const uniqueIds = new Set(relationIds);
      if (uniqueIds.size !== relationIds.length) {
        return errorResponse('VALIDATION_ERROR', 'Duplicate relationships are not allowed.', 400);
      }
      if (uniqueIds.has(id)) {
        return errorResponse('VALIDATION_ERROR', 'A member cannot be related to themselves.', 400);
      }
    }

    const finalGenerationId = generationId || existing.generationId;
    const relationPayloadProvided = relations !== undefined && Array.isArray(relations);
    const generationChanged = generationId !== undefined && generationId !== existing.generationId;

    if (generationChanged || relationPayloadProvided) {
      const newGeneration = await prisma.generation.findUnique({ where: { id: finalGenerationId } });
      if (!newGeneration) return errorResponse('NOT_FOUND', 'Generation not found', 404);

      if (relationPayloadProvided) {
        const relativeIds = safeRelations.map((r: any) => r.id).filter(Boolean);
        const spousesInPayload = safeRelations.filter((r: any) => r.type === 'SPOUSE');
        if (spousesInPayload.length > 1) {
          return errorResponse('VALIDATION_ERROR', 'Member already has a spouse.', 400);
        }

        const relatives = await prisma.member.findMany({
          where: { id: { in: relativeIds } },
          include: { generation: true }
        });

        for (const rel of safeRelations) {
          if (!rel.id || !rel.type) continue;
          const relative = relatives.find(r => r.id === rel.id);
          if (!relative) continue;

          if (rel.type === 'SPOUSE') {
            const memberGender = memberData.gender !== undefined ? memberData.gender as any : existing.gender;
            if (relative.generation.orderIndex !== newGeneration.orderIndex || !isSpouseEligible(memberGender, relative.gender)) {
              return errorResponse('VALIDATION_ERROR', 'Spouse must belong to the same generation and satisfy spouse eligibility rules.', 400);
            }
            const relativeSpouseCount = await prisma.relationship.count({
             where: {
               type: 'SPOUSE',
               OR: [{ fromId: rel.id }, { toId: rel.id }],
               NOT: { OR: [{ fromId: id }, { toId: id }] }
             }
            });
            if (relativeSpouseCount > 0) {
             return errorResponse('VALIDATION_ERROR', 'Member already has a spouse.', 400);
            }
          } else if (rel.type === 'PARENT') {
             if (newGeneration.orderIndex !== relative.generation.orderIndex + 1) {
               return errorResponse('VALIDATION_ERROR', `Parent must belong exactly to the generation immediately above the child.`, 400);
             }
             const parentsInPayload = safeRelations.filter((r: any) => r.type === 'PARENT');
             if (parentsInPayload.length > 2) {
               return errorResponse('VALIDATION_ERROR', 'A member can have at most two parents.', 400);
             }
          } else if (rel.type === 'CHILD') {
             if (newGeneration.orderIndex + 1 !== relative.generation.orderIndex) {
               return errorResponse('VALIDATION_ERROR', `Parent must belong exactly to the generation immediately above the child.`, 400);
             }
             const relativeParentCount = await prisma.relationship.count({
               where: {
                 type: 'PARENT',
                 toId: rel.id,
                 NOT: { fromId: id }
               }
             });
             if (relativeParentCount >= 2) {
               return errorResponse('VALIDATION_ERROR', 'This child already has two parents.', 400);
             }
          }
        }
      } else {
        const existingRelations = await prisma.relationship.findMany({
          where: { OR: [{ fromId: id }, { toId: id }] },
          include: { from: { include: { generation: true } }, to: { include: { generation: true } } }
        });

        for (const rel of existingRelations) {
          if (rel.type === 'SPOUSE') {
            const relative = rel.fromId === id ? rel.to : rel.from;
            const memberGender = memberData.gender !== undefined ? memberData.gender as any : existing.gender;
            if (relative.generation.orderIndex !== newGeneration.orderIndex || !isSpouseEligible(memberGender, relative.gender)) {
              return errorResponse('VALIDATION_ERROR', 'Spouse must belong to the same generation and satisfy spouse eligibility rules.', 400);
            }
          } else if (rel.type === 'PARENT') {
             const parentOrder = rel.fromId === id ? newGeneration.orderIndex : rel.from.generation.orderIndex;
             const childOrder = rel.toId === id ? newGeneration.orderIndex : rel.to.generation.orderIndex;

             if (childOrder !== parentOrder + 1) {
               return errorResponse('VALIDATION_ERROR', `Parent must belong exactly to the generation immediately above the child.`, 400);
             }
          }
        }
      }
    }

    // Use transaction to update member and replace relationships if provided
    await prisma.$transaction(async (tx) => {
      const updateData: any = {
        ...memberData,
        ...(generationId !== undefined && {
          generationId,
        }),
        ...(birthDate !== undefined && {
          birthDate: birthDate ? new Date(birthDate) : null,
        }),
        ...(deathDate !== undefined && {
          deathDate: deathDate ? new Date(deathDate) : null,
        }),
      };

      // Use integer revision for optimistic locking: require the revision to match, then increment it atomically.
      const updatedCount = await tx.member.updateMany({
        where: { id, revision: existing.revision },
        data: { ...updateData, revision: { increment: 1 } },
      });

      if (updatedCount.count === 0) {
        throw new Error('CONFLICT: Member was modified by another user. Please refresh and retry.');
      }

      const updatedMember = await tx.member.findUnique({ where: { id } });

      if (relationPayloadProvided) {
        const desiredRels = normalizeRelationshipSet(id, safeRelations);
        const existingRels = await tx.relationship.findMany({
          where: {
            OR: [
              { type: 'PARENT', toId: id },
              { type: 'PARENT', fromId: id },
              { type: 'SPOUSE', fromId: id },
              { type: 'SPOUSE', toId: id },
            ],
          },
        });

        const { toAdd, toRemove } = computeRelationshipDiff(existingRels, desiredRels);

        for (const rel of toRemove) {
          if (!rel.id) continue;
          await tx.relationship.delete({ where: { id: rel.id } });
        }

        for (const rel of toAdd) {
          await tx.relationship.create({
            data: {
              type: rel.type,
              fromId: rel.fromId,
              toId: rel.toId,
              treeId: existing.treeId,
            },
          });
        }
      }

      return updatedMember;
    });

    // Re-fetch the member with full relations so the response has the complete updated state
    const freshMember = await prisma.member.findUnique({
      where: { id },
      include: {
        relationsFrom: {
          include: { to: true },
        },
        relationsTo: {
          include: { from: true },
        },
        media: true,
      },
    });

    if (!freshMember) {
      return NextResponse.json({
        success: false,
        message: "No data returned"
      }, { status: 500 });
    }

    await createTreeSnapshot(existing.treeId, session.user.id, `Updated ${freshMember.firstName} ${freshMember.lastName}`);

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      data: freshMember
    }, { status: 200 });
  } catch (error: any) {
    console.error('[MEMBER_UPDATE_ERROR]', error);
    if (typeof error?.message === 'string' && error.message.startsWith('CONFLICT:')) {
      return NextResponse.json({ success: false, message: error.message.replace('CONFLICT:','').trim() }, { status: 409 });
    }
    return NextResponse.json({
      success: false,
      message: error.message || "Update failed"
    }, { status: 500 });
  }
}

/** DELETE /api/members/:id — Delete a member and its relationships */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Member not found', 404);
    }

    const permission = await getTreePermission(session.user.id, existing.treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to delete this member', 403);
    }

    // Transactional delete: relationships → media → member
    await prisma.$transaction([
      prisma.relationship.deleteMany({
        where: { OR: [{ fromId: id }, { toId: id }] },
      }),
      prisma.media.deleteMany({ where: { memberId: id } }),
      prisma.member.delete({ where: { id } }),
    ]);

    await createTreeSnapshot(existing.treeId, session.user.id, `Deleted ${existing.firstName} ${existing.lastName}`);

    return successResponse({ id }, 'Member deleted successfully');
  } catch (error: any) {
    console.error('[MEMBER_DELETE_ERROR]', error);
    return NextResponse.json({ success: false, message: error.message || "Delete failed" }, { status: 500 });
  }
}
