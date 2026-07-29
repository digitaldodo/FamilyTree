import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit, canDelete } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/utils';
import { updateTreeSchema } from '@/validations/tree.schema';
import { getErrorMessage } from '@/utils/helpers';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isValidTreeId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-z0-9_-]{10,128}$/i.test(id);
}

function isLikelyJsonError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /json|deserialize|parse/i.test(message);
}

function getPrismaErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : null;
}

function databaseReadError(error: unknown, fallbackMessage: string) {
  console.error('[TREE_GET_DATABASE_ERROR]', error);

  if (getPrismaErrorCode(error) === 'P2022') {
    return errorResponse(
      'DATABASE_SCHEMA_OUT_OF_DATE',
      'The database schema is out of date. Please run the latest Prisma migrations.',
      503
    );
  }

  if (isLikelyJsonError(error)) {
    return errorResponse(
      'TREE_DATA_INVALID',
      'Tree data contains invalid JSON and could not be read safely.',
      422
    );
  }

  return errorResponse('TREE_FETCH_ERROR', fallbackMessage, 500);
}

function safeJsonArray<T>(value: unknown, context: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [];

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      console.warn(`[TREE_GET_INVALID_JSON_ARRAY] ${context}`, error);
      return [];
    }
  }

  console.warn(`[TREE_GET_INVALID_ARRAY] ${context}`, { receivedType: typeof value });
  return [];
}

function normalizeMember(member: any) {
  return {
    ...member,
    relationsFrom: safeJsonArray(member?.relationsFrom, `member:${member?.id}:relationsFrom`),
    relationsTo: safeJsonArray(member?.relationsTo, `member:${member?.id}:relationsTo`),
    media: safeJsonArray(member?.media, `member:${member?.id}:media`),
  };
}

/** GET /api/trees/:id — Get a tree with all members and relationships */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    let session;
    try {
      session = await auth();
    } catch {
      console.error('[TREE_GET_AUTH_ERROR]', error);
      return errorResponse('AUTH_ERROR', 'Could not verify your session. Please sign in again.', 401);
    }

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    let id: string;
    try {
      const resolvedParams = await params;
      id = resolvedParams.id;
    } catch {
      console.error('[TREE_GET_PARAMS_ERROR]', error);
      return errorResponse('VALIDATION_ERROR', 'Invalid tree request parameters.', 400);
    }

    if (!isValidTreeId(id)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid tree id.', 400);
    }

    let treeData;
    try {
      treeData = await prisma.tree.findUnique({
        where: { id },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true } },
        },
      });
    } catch {
      return databaseReadError(error, 'Unable to load tree metadata.');
    }

    if (!treeData) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    let hasAccess = treeData.ownerId === session.user.id;
    if (!hasAccess) {
      try {
        const collaborator = await prisma.treeCollaborator.findUnique({
          where: { userId_treeId: { userId: session.user.id, treeId: id } },
          select: { role: true },
        });
        hasAccess = Boolean(collaborator);
      } catch {
        return databaseReadError(error, 'Unable to verify tree permissions.');
      }
    }

    if (!hasAccess) {
      return errorResponse('FORBIDDEN', 'You do not have access to this tree', 403);
    }

    let generations;
    try {
      generations = await prisma.generation.findMany({
        where: { treeId: id },
        orderBy: { orderIndex: 'asc' },
      });
    } catch {
      return databaseReadError(error, 'Unable to load tree generations.');
    }

    let members;
    try {
      members = await prisma.member.findMany({
        where: { treeId: id },
        orderBy: [{ firstName: 'asc' }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          birthDate: true,
          deathDate: true,
          gender: true,
          bio: true,
          imageUrl: true,
          coverImage: true,
          phone: true,
          email: true,
          address: true,
          occupation: true,
          generationId: true,
          treeId: true,
          createdAt: true,
          updatedAt: true,
          generation: { select: { id: true, name: true, orderIndex: true } },
          relationsFrom: {
            select: {
              id: true, type: true, fromId: true, toId: true
            }
          },
          relationsTo: {
            select: {
              id: true, type: true, fromId: true, toId: true
            }
          },
          media: { select: { id: true, url: true, type: true } },
        },
      });
    } catch {
      return databaseReadError(error, 'Unable to load tree members.');
    }

    const tree = {
      ...treeData,
      generations: safeJsonArray(generations, `tree:${id}:generations`),
      members: safeJsonArray<any>(members, `tree:${id}:members`).map(normalizeMember),
    };

    // Auto-create of version v1 removed as it violates GET idempotency and causes unnecessary writes.

    return successResponse(tree, 'Tree retrieved successfully');
  } catch {
    console.error('[TREE_GET_ERROR]', error);
    return errorResponse('FETCH_ERROR', 'Unable to load this tree right now.', 500);
  }
}

/** PUT /api/trees/:id — Update a tree */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'You do not have permission to edit this tree', 403);
    }

    let body = null;
    try {
      body = await request.json();
    } catch {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }
    const validation = updateTreeSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const existing = await prisma.tree.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const tree = await prisma.tree.update({
      where: { id },
      data: validation.data,
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!tree) {
      return errorResponse('FETCH_ERROR', 'No data returned', 500);
    }

    return successResponse(tree, 'Tree updated successfully');
  } catch {
    console.error('[TREE_UPDATE_ERROR]', error);
    return errorResponse('UPDATE_ERROR', getErrorMessage(error), 500);
  }
}

/** DELETE /api/trees/:id — Delete a tree and all its members */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = await params;

    const permission = await getTreePermission(session.user.id, id);
    if (!canDelete(permission)) {
      return errorResponse('FORBIDDEN', 'Only the tree owner can delete this tree', 403);
    }

    const existing = await prisma.tree.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    // Cascade: relationships → media → members → tree
    const memberIds = await prisma.member.findMany({
      where: { treeId: id },
      select: { id: true },
    });
    const ids = memberIds.map((m: any) => m.id);

    await prisma.$transaction([
      prisma.relationship.deleteMany({
        where: { OR: [{ fromId: { in: ids } }, { toId: { in: ids } }] },
      }),
      prisma.media.deleteMany({ where: { memberId: { in: ids } } }),
      prisma.member.deleteMany({ where: { treeId: id } }),
      prisma.treeCollaborator.deleteMany({ where: { treeId: id } }),
      prisma.invite.deleteMany({ where: { treeId: id } }),
      prisma.tree.delete({ where: { id } }),
    ]);

    return successResponse({ id }, 'Tree deleted successfully');
  } catch {
    console.error('[TREE_DELETE_ERROR]', error);
    return errorResponse('DELETE_ERROR', getErrorMessage(error), 500);
  }
}
