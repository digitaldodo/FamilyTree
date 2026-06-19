import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { createRelationshipSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const body = await request.json();
    const validation = createRelationshipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { type, fromId, toId } = validation.data;

    // Check tree permissions
    const fromMember = await prisma.member.findUnique({ where: { id: fromId }, include: { generation: true } });
    const toMember = await prisma.member.findUnique({ where: { id: toId }, include: { generation: true } });

    if (!fromMember || !toMember) {
      return errorResponse('NOT_FOUND', 'One or both members not found', 404);
    }

    if (fromMember.treeId !== toMember.treeId) {
      return errorResponse('VALIDATION_ERROR', 'Members must belong to the same tree', 400);
    }

    const permission = await getTreePermission(session.user.id, fromMember.treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    // Chronological validation
    const fromGenOrder = fromMember.generation.orderIndex;
    const toGenOrder = toMember.generation.orderIndex;

    if (type === 'SPOUSE' || type === 'SIBLING') {
      if (fromGenOrder !== toGenOrder) {
        const errorMsg = type === 'SPOUSE' 
          ? 'Spouse must belong to the same generation.' 
          : 'Sibling must belong to the same generation.';
        return errorResponse('VALIDATION_ERROR', errorMsg, 400);
      }
    } else if (type === 'PARENT') {
      // fromId is Parent, toId is Child
      if (fromGenOrder !== toGenOrder - 1) {
        return errorResponse('VALIDATION_ERROR', 'Parent must belong exactly to the generation immediately above the child.', 400);
      }
    }

    // Constraint validations
    if (type === 'SPOUSE') {
      const existingFromSpouses = await prisma.relationship.count({
        where: {
          type: 'SPOUSE',
          OR: [{ fromId }, { toId: fromId }]
        }
      });
      const existingToSpouses = await prisma.relationship.count({
        where: {
          type: 'SPOUSE',
          OR: [{ fromId: toId }, { toId }]
        }
      });
      if (existingFromSpouses >= 1 || existingToSpouses >= 1) {
        return errorResponse('VALIDATION_ERROR', 'Maximum 1 spouse allowed.', 400);
      }
    } else if (type === 'PARENT') {
      const existingParents = await prisma.relationship.count({
        where: {
          type: 'PARENT',
          toId: toId
        }
      });
      if (existingParents >= 2) {
        return errorResponse('VALIDATION_ERROR', 'A member can have at most two parents.', 400);
      }
    }

    // Cross-relationship constraint validations (Smart Rules)
    const existingOverlaps = await prisma.relationship.findFirst({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ],
        NOT: { type } // we only care if they have a *different* type of relationship
      }
    });

    if (existingOverlaps) {
      return errorResponse('VALIDATION_ERROR', 'Members already have an incompatible relationship.', 400);
    }

    // Check if relationship already exists
    const existing = await prisma.relationship.findFirst({
      where: {
        OR: [
          { type, fromId, toId },
          // For spouses and siblings, direction doesn't matter for checking existence
          ...(type === 'SPOUSE' || type === 'SIBLING' ? [{ type, fromId: toId, toId: fromId }] : [])
        ]
      }
    });

    if (existing) {
      return errorResponse('VALIDATION_ERROR', 'Relationship already exists', 400);
    }

    const newRel = await prisma.relationship.create({
      data: { type, fromId, toId }
    });

    return successResponse(newRel, 'Relationship created successfully', 201);
  } catch (error) {
     
    console.log('[API Debug] POST /api/relationships', {
      method: 'POST',
      url: request.url,
      status: 500,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
