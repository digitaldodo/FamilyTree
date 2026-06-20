import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/invites/accept — Accept an invite token */
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
    const { token } = body;

    if (!token) {
      return errorResponse('VALIDATION_ERROR', 'Invite token is required', 400);
    }

    // Look up the invite by token
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        tree: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
          },
        },
      },
    });

    if (!invite) {
      return errorResponse('NOT_FOUND', 'Invalid invite token', 404);
    }

    // Check if the invite has expired
    if (new Date() > invite.expiresAt) {
      return errorResponse('EXPIRED', 'This invite has expired', 410);
    }

    // Don't allow the owner to accept their own invite
    if (invite.tree.ownerId === session.user.id) {
      return errorResponse('VALIDATION_ERROR', 'You are already the owner of this tree', 400);
    }

    // Upsert the TreeCollaborator record to handle re-accepts gracefully
    await prisma.treeCollaborator.upsert({
      where: {
        userId_treeId: {
          userId: session.user.id,
          treeId: invite.treeId,
        },
      },
      update: {
        role: invite.role,
      },
      create: {
        userId: session.user.id,
        treeId: invite.treeId,
        role: invite.role,
      },
    });

    return successResponse(
      {
        tree: invite.tree,
        role: invite.role,
      },
      'Invite accepted successfully',
    );
  } catch (error) {
    console.error('[INVITE_ACCEPT_ERROR]', error);
    return errorResponse('ACCEPT_ERROR', getErrorMessage(error), 500);
  }
}
