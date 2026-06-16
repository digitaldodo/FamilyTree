import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canInvite } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** POST /api/invites — Create a new invite for a tree */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { treeId, role, email } = await request.json();

    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId is required', 400);
    }

    // Check invite permission using centralized permission system
    const permission = await getTreePermission(session.user.id, treeId);
    if (!canInvite(permission)) {
      return errorResponse('FORBIDDEN', 'Not authorized to invite to this tree', 403);
    }

    // Check if a persistent invite for this role/tree already exists (general shareable link)
    if (!email) {
      const existingInvite = await prisma.invite.findFirst({
        where: {
          treeId,
          role: role || 'VIEWER',
          email: null,
        },
      });

      if (existingInvite) {
        return successResponse(existingInvite, 'Existing invite found');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');

    const invite = await prisma.invite.create({
      data: {
        treeId,
        role: role || 'VIEWER',
        token,
        email: email || null,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years expiration for persistent links
      },
    });

    return successResponse(invite, 'Invite created successfully', 201);
  } catch (error) {
    console.error('[INVITE_CREATE_ERROR]', error);
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
