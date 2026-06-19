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
    if (type === 'SPOUSE' || type === 'SIBLING') {
      if (fromMember.generation.orderIndex !== toMember.generation.orderIndex) {
        return errorResponse('VALIDATION_ERROR', `${type} relationships must be between members of the same generation`, 400);
      }
    } else if (type === 'PARENT') {
      // fromId is Parent, toId is Child
      if (fromMember.generation.orderIndex >= toMember.generation.orderIndex) {
        return errorResponse('VALIDATION_ERROR', 'Parent must belong to an older generation.', 400);
      }
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
      return successResponse(existing, 'Relationship already exists', 200);
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
