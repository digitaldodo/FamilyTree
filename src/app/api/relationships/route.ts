import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { createRelationshipSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';
import { RelationshipEngine, MemberWithRelations } from '@/lib/relationship-engine';

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

    const { type, fromId, toId, preventPropagation } = validation.data;

    // Check tree permissions
    const fromMember = await prisma.member.findUnique({ 
      where: { id: fromId }, 
      include: { generation: true, relationsFrom: true, relationsTo: true } 
    });
    const toMember = await prisma.member.findUnique({ 
      where: { id: toId }, 
      include: { generation: true, relationsFrom: true, relationsTo: true } 
    });

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

    // Engine validation
    try {
      await RelationshipEngine.validateRelationship(
        fromMember as unknown as MemberWithRelations, 
        toMember as unknown as MemberWithRelations, 
        type
      );
    } catch (engineError) {
      return errorResponse('VALIDATION_ERROR', getErrorMessage(engineError), 400);
    }

    const newRel = await prisma.relationship.create({
      data: { type, fromId, toId }
    });

    // Engine Smart Rules
    if (!preventPropagation) {
      await RelationshipEngine.applySmartRules(fromId, toId, type, fromMember.treeId);
    }

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

