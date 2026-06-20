import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/treeVersion/create — Create a new tree version snapshot */
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
      return Response.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }
    const { treeId, name, membersData, relationsData, gensData } = body;

    if (!treeId || !membersData || !relationsData || !gensData) {
      return errorResponse('BAD_REQUEST', 'Missing required fields', 400);
    }

    const permission = await getTreePermission(session.user.id, treeId);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    const version = await prisma.treeVersion.create({
      data: {
        treeId,
        name: name || null,
        membersData,
        relationsData,
        gensData,
        createdBy: session.user.id,
      },
    });

    return successResponse(version, 'Tree version created successfully', 201);
  } catch (error) {
    console.error('[TREE_VERSION_CREATE_ERROR]', error);
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
