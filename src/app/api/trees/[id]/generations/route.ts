import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { createGenerationSchema } from '@/validations/generation.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees/[id]/generations — List generations for a tree */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { id: treeId } = await params;

    // Check tree access
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        collaborators: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!tree) return errorResponse('NOT_FOUND', 'Tree not found', 404);
    if (tree.ownerId !== session.user.id && tree.collaborators.length === 0 && !tree.isPublic) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    const generations = await prisma.generation.findMany({
      where: { treeId },
      orderBy: { orderIndex: 'asc' },
    });

    return successResponse(generations, 'Generations fetched successfully');
  } catch (error) {
     
    console.log('[API Debug] GET /api/trees/[id]/generations', {
      method: 'GET',
      url: request.url,
      status: 500,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** POST /api/trees/[id]/generations — Create a generation */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    const { id: treeId } = await params;

    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        collaborators: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!tree) return errorResponse('NOT_FOUND', 'Tree not found', 404);
    
    const role = tree.ownerId === session.user.id ? 'OWNER' : tree.collaborators[0]?.role;
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'EDITOR') {
      return errorResponse('FORBIDDEN', 'Insufficient permissions to create generations', 403);
    }

    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }
    const validation = createGenerationSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('VALIDATION_ERROR', validation.error.issues.map(e => e.message).join(', '), 400);
    }

    const { name, insertAt } = validation.data;

    // Check for duplicate generation name
    const existing = await prisma.generation.findFirst({
      where: {
        treeId,
        name: { equals: name, mode: 'insensitive' }
      }
    });
    
    if (existing) {
      return errorResponse('CONFLICT', 'Generation name already exists', 400);
    }

    let targetIndex = insertAt;

    // Run within a transaction to maintain order index consistency
    const result = await prisma.$transaction(async (tx) => {
      if (targetIndex !== undefined) {
        // Shift existing generations down
        await tx.generation.updateMany({
          where: {
            treeId,
            orderIndex: { gte: targetIndex },
          },
          data: {
            orderIndex: { increment: 1 },
          },
        });
      } else {
        // Find max orderIndex and append
        const maxGen = await tx.generation.findFirst({
          where: { treeId },
          orderBy: { orderIndex: 'desc' },
        });
        targetIndex = maxGen ? maxGen.orderIndex + 1 : 0;
      }

      const newGen = await tx.generation.create({
        data: {
          treeId,
          name,
          orderIndex: targetIndex,
        },
      });

      return newGen;
    });

    return successResponse(result, 'Generation created successfully', 201);
  } catch (error) {
     
    console.log('[API Debug] POST /api/trees/[id]/generations', {
      method: 'POST',
      url: request.url,
      status: 500,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
