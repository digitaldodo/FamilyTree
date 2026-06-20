import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canView } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateMemberSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';
import { RelationshipEngine } from '@/lib/relationship-engine';
import { isSpouseEligible } from '@/utils/relationship';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    return successResponse({ ...member }, 'Member retrieved successfully');
  } catch (error) {
    console.error('[MEMBER_GET_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
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

    const body = await request.json();
    console.log('[MEMBER_UPDATE_REQUEST]', JSON.stringify(body, null, 2));
    console.log("REQUEST BODY", body);

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

    const { birthDate, deathDate, generationId, ...rest } = validation.data;
    const relations = body.relations;

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

    // Validate Chronology if generation is changing or relations are being updated
    const finalGenerationId = generationId || existing.generationId;

    if (generationId !== undefined && generationId !== existing.generationId) {
      const newGeneration = await prisma.generation.findUnique({ where: { id: generationId } });
      if (!newGeneration) return errorResponse('NOT_FOUND', 'Generation not found', 404);

      // We only validate against existing relations if we aren't completely replacing them.
      // But actually, if we are replacing them, we should validate against the NEW ones.
      const relationsToValidate = relations !== undefined ? relations : await prisma.relationship.findMany({
        where: { OR: [{ fromId: id }, { toId: id }] },
      }).then(rels => rels.map(r => ({
        id: r.fromId === id ? r.toId : r.fromId,
        type: r.type,
        isParentWhereMemberIsChild: r.type === 'PARENT' && r.toId === id,
        isParentWhereMemberIsParent: r.type === 'PARENT' && r.fromId === id
      })));

      // If we are given relations from body, we need to fetch their generations to validate
      if (relations !== undefined && Array.isArray(relations)) {
        const relativeIds = relations.map((r: any) => r.id).filter(Boolean);
        const spousesInPayload = relations.filter((r: any) => r.type === 'SPOUSE');
        if (spousesInPayload.length > 1) {
          return errorResponse('VALIDATION_ERROR', 'Member already has a spouse.', 400);
        }

        const relatives = await prisma.member.findMany({
          where: { id: { in: relativeIds } },
          include: { generation: true }
        });

        for (const rel of relations) {
          if (!rel.id || !rel.type) continue;
          const relative = relatives.find(r => r.id === rel.id);
          if (!relative) continue;

          if (rel.type === 'SPOUSE') {
            const memberGender = body.gender !== undefined ? body.gender : existing.gender;
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
             // Form says "Parents" - meaning the relative is the Parent, member is the Child.
             if (newGeneration.orderIndex <= relative.generation.orderIndex) {
               return errorResponse('VALIDATION_ERROR', `Cannot move member. Children must belong to a younger generation (higher order) than parents.`, 400);
             }
             // Since member is the child, we must ensure member doesn't exceed 2 parents in total after this update
             const parentsInPayload = relations.filter((r: any) => r.type === 'PARENT');
             if (parentsInPayload.length > 2) {
               return errorResponse('VALIDATION_ERROR', 'A member can have at most two parents.', 400);
             }
          } else if (rel.type === 'CHILD') {
             // Form says "Children" - meaning the relative is the Child, member is the Parent.
             if (newGeneration.orderIndex >= relative.generation.orderIndex) {
               return errorResponse('VALIDATION_ERROR', `Cannot move member. Parents must belong to an older generation (lower order) than children.`, 400);
             }
             const relativeParentCount = await prisma.relationship.count({
               where: {
                 type: 'PARENT',
                 toId: rel.id,
                 NOT: { fromId: id } // Exclude the current member
               }
             });
             // We are adding member as a parent of rel.id. If rel.id already has 2 parents, it's an error.
             // Wait, if member is already one of the parents, it doesn't count towards the limit, but if they have 2 OTHER parents, it's > 2.
             // Actually, if relativeParentCount >= 2, we can't add member as a new parent.
             if (relativeParentCount >= 2) {
               return errorResponse('VALIDATION_ERROR', 'This child already has two parents.', 400);
             }
          }
        }
      } else {
        // Validate against existing relations
        const existingRelations = await prisma.relationship.findMany({
          where: { OR: [{ fromId: id }, { toId: id }] },
          include: { from: { include: { generation: true } }, to: { include: { generation: true } } }
        });

        for (const rel of existingRelations) {
          if (rel.type === 'SPOUSE') {
            const relative = rel.fromId === id ? rel.to : rel.from;
            const memberGender = body.gender !== undefined ? body.gender : existing.gender;
            if (relative.generation.orderIndex !== newGeneration.orderIndex || !isSpouseEligible(memberGender, relative.gender)) {
               return errorResponse('VALIDATION_ERROR', 'Spouse must belong to the same generation and satisfy spouse eligibility rules.', 400);
            }
          } else if (rel.type === 'PARENT') {
             const parentOrder = rel.fromId === id ? newGeneration.orderIndex : rel.from.generation.orderIndex;
             const childOrder = rel.toId === id ? newGeneration.orderIndex : rel.to.generation.orderIndex;

             if (childOrder <= parentOrder) {
               return errorResponse('VALIDATION_ERROR', `Cannot move member. Parents must belong to an older generation than children.`, 400);
             }
          }
        }
      }
    }

    // DATABASE Before update
    const before = await prisma.member.findUnique({ where: { id }, include: { relationsFrom: true, relationsTo: true } });
    console.log("BEFORE", JSON.stringify(before, null, 2));

    // RELATIONSHIP TABLES Before update
    const existingSpousesBefore = await prisma.relationship.findMany({ where: { type: 'SPOUSE', OR: [{ fromId: id }, { toId: id }] } });
    const existingParentsBefore = await prisma.relationship.findMany({ where: { type: 'PARENT', toId: id } });
    const existingChildrenBefore = await prisma.relationship.findMany({ where: { type: 'PARENT', fromId: id } });
    console.log("EXISTING SPOUSES BEFORE", existingSpousesBefore);
    console.log("EXISTING PARENTS BEFORE", existingParentsBefore);
    console.log("EXISTING CHILDREN BEFORE", existingChildrenBefore);

    // Use transaction to update member and replace relationships if provided
    const member = await prisma.$transaction(async (tx) => {
      const updatedMember = await tx.member.update({
        where: { id },
        data: {
          ...rest,
          ...(generationId !== undefined && {
            generation: { connect: { id: generationId } },
          }),
          ...(birthDate !== undefined && {
            birthDate: birthDate ? new Date(birthDate) : null,
          }),
          ...(deathDate !== undefined && {
            deathDate: deathDate ? new Date(deathDate) : null,
          }),
        },
      });

      if (relations !== undefined && Array.isArray(relations)) {
        // Delete existing relationships where member is involved, but wait,
        // The form only submits relationships where member is child, spouse, or sibling.
        // It does NOT submit relationships where member is the PARENT (i.e., we don't pick children from the member form, we pick parents).
        // So we should only delete relations that the form manages!
        // Form manages:
        // PARENT: where member is child (toId = id)
        // CHILD (form logic): where member is parent (fromId = id)
        // SPOUSE: all
        // SIBLING: all
        await tx.relationship.deleteMany({
          where: {
            OR: [
              { type: 'PARENT', toId: id },
              { type: 'PARENT', fromId: id },
              { type: 'SPOUSE', fromId: id },
              { type: 'SPOUSE', toId: id },
            ]
          }
        });

        for (const rel of relations) {
          if (!rel.id || !rel.type) continue;
          try {
            if (rel.type === 'PARENT') {
              await tx.relationship.create({
                data: { type: 'PARENT', fromId: rel.id, toId: id },
              });
            } else if (rel.type === 'CHILD') {
              await tx.relationship.create({
                data: { type: 'PARENT', fromId: id, toId: rel.id },
              });
            } else {
              const [id1, id2] = [id, rel.id].sort();
              await tx.relationship.create({
                data: { type: rel.type, fromId: id1, toId: id2 },
              });
            }
          } catch (e) {
            console.error('Relationship create error', e);
          }
        }
      }

      return updatedMember;
    });

    // DATABASE After update
    const after = await prisma.member.findUnique({ where: { id }, include: { relationsFrom: true, relationsTo: true } });
    console.log("AFTER", JSON.stringify(after, null, 2));

    // RELATIONSHIP TABLES After update
    const existingSpousesAfter = await prisma.relationship.findMany({ where: { type: 'SPOUSE', OR: [{ fromId: id }, { toId: id }] } });
    const existingParentsAfter = await prisma.relationship.findMany({ where: { type: 'PARENT', toId: id } });
    const existingChildrenAfter = await prisma.relationship.findMany({ where: { type: 'PARENT', fromId: id } });
    console.log("EXISTING SPOUSES AFTER", existingSpousesAfter);
    console.log("EXISTING PARENTS AFTER", existingParentsAfter);
    console.log("EXISTING CHILDREN AFTER", existingChildrenAfter);

    if (JSON.stringify(before) === JSON.stringify(after)) {
      console.log("UPDATE NEVER OCCURRED");
    }

    // POST-SAVE VERIFICATION
    const verifyMember = await prisma.member.findUnique({ where: { id } });
    if (!verifyMember || verifyMember.firstName !== body.firstName) { // simple check
      return errorResponse('UPDATE_FAILED', 'Database update confirmed failed', 500);
    }

    RelationshipEngine.invalidateCache(existing.treeId, [id]);

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

    return successResponse(freshMember, 'Member updated successfully');
  } catch (error) {
    console.error('[MEMBER_UPDATE_ERROR]', error);
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
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

    RelationshipEngine.invalidateCache(existing.treeId, [id]);

    return successResponse({ id }, 'Member deleted successfully');
  } catch (error) {
    console.error('[MEMBER_DELETE_ERROR]', error);
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
