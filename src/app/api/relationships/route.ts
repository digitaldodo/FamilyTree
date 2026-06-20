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

    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }
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

    const newRel = await prisma.relationship.create({
      data: { type, fromId, toId }
    });

    if (!newRel) {
      return Response.json({
        success: false,
        error: "No data returned"
      }, { status: 500 });
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

