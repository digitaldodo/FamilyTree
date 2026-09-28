import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { memorySchema } from '@/validations/memory.schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const treeId = searchParams.get('treeId');

    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId is required', 400);
    }

    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: { collaborators: true }
    });

    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const isOwner = tree.ownerId === userId;
    const isCollaborator = tree.collaborators.some(c => c.userId === userId);

    if (!isOwner && !isCollaborator && !tree.isPublic) {
      return errorResponse('FORBIDDEN', 'Access denied', 403);
    }

    const memories = await prisma.memory.findMany({
      where: { treeId },
      include: {
        members: {
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, imageUrl: true }
            }
          }
        },
        media: true,
      },
      orderBy: { date: 'asc' }
    });

    return successResponse(memories);
  } catch (error: any) {
    console.error('Failed to fetch memories:', error);
    return errorResponse('INTERNAL_ERROR', error.message || 'Failed to fetch memories');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }
    const userId = session.user.id;

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const treeId = searchParams.get('treeId');

    if (!treeId) {
      return errorResponse('VALIDATION_ERROR', 'treeId is required', 400);
    }

    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: { collaborators: true }
    });

    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const isOwner = tree.ownerId === userId;
    const isCollaborator = tree.collaborators.some(
      c => c.userId === userId && (c.role === 'EDITOR' || c.role === 'ADMIN')
    );

    if (!isOwner && !isCollaborator) {
      return errorResponse('FORBIDDEN', 'Insufficient permissions to create a memory', 403);
    }

    const validatedData = memorySchema.parse(body);

    const memory = await prisma.memory.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        type: validatedData.type,
        googlePhotosAlbumUrl: validatedData.googlePhotosAlbumUrl || null,
        location: validatedData.location,
        tags: validatedData.tags,
        treeId: treeId,
        createdById: userId,
        members: {
          create: validatedData.memberIds.map(id => ({ memberId: id }))
        },
        media: {
          create: validatedData.mediaUrls.map(url => ({
            url,
            type: 'image',
          }))
        }
      },
      include: {
        members: {
          include: {
            member: {
              select: { id: true, firstName: true, lastName: true, imageUrl: true }
            }
          }
        },
        media: true
      }
    });

    return successResponse(memory, 'Memory created', 201);
  } catch (error: any) {
    console.error('Failed to create memory:', error);
    if (error.name === 'ZodError') {
      return errorResponse('VALIDATION_ERROR', error.errors[0].message, 400);
    }
    return errorResponse('INTERNAL_ERROR', error.message || 'Failed to create memory');
  }
}
