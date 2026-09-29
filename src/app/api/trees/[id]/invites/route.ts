import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canManageCollaborators } from '@/lib/permissions';
import { successResponse, errorResponse, listResponse } from '@/lib/utils';
import { getErrorMessage } from '@/utils/helpers';
import crypto from 'crypto';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/:id/invites — List all pending invites */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canManageCollaborators(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to manage invites', 403);
    }

    const invites = await prisma.invite.findMany({
      where: { treeId: id },
      orderBy: { createdAt: 'desc' },
    });

    return listResponse(invites, invites.length, 1, invites.length);
  } catch (error) {
    console.error('[INVITES_FETCH_ERROR]', error);
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** POST /api/trees/:id/invites — Create a new invite */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canManageCollaborators(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to invite collaborators', 403);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }

    const { email, role } = body;
    if (!email) {
      return errorResponse('VALIDATION_ERROR', 'Email is required', 400);
    }

    if (role !== 'VIEWER' && role !== 'EDITOR' && role !== 'ADMIN') {
      return errorResponse('VALIDATION_ERROR', 'Invalid role', 400);
    }

    // Check if they are already a collaborator
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingCollab = await prisma.treeCollaborator.findUnique({
        where: { userId_treeId: { userId: existingUser.id, treeId: id } }
      });
      if (existingCollab) {
        return errorResponse('CONFLICT', 'User is already a collaborator', 409);
      }
    }

    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: { treeId: id, email }
    });
    if (existingInvite) {
      return errorResponse('CONFLICT', 'Invite already sent to this email', 409);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const invite = await prisma.invite.create({
      data: {
        email,
        role,
        token,
        treeId: id,
        invitedBy: session.user.id,
        expiresAt,
      },
    });

    // TODO: Send email here using resend or whatever email provider is used

    return successResponse(invite, 'Invite created successfully', 201);
  } catch (error) {
    console.error('[INVITES_CREATE_ERROR]', error);
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/trees/:id/invites — Cancel an invite */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canManageCollaborators(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to manage invites', 403);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }

    const { inviteId } = body;
    if (!inviteId) {
      return errorResponse('VALIDATION_ERROR', 'inviteId is required', 400);
    }

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.treeId !== id) {
      return errorResponse('NOT_FOUND', 'Invite not found', 404);
    }

    await prisma.invite.delete({ where: { id: inviteId } });

    return successResponse({ inviteId }, 'Invite cancelled successfully');
  } catch (error) {
    console.error('[INVITES_DELETE_ERROR]', error);
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
