import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { memorySchema } from '@/validations/memory.schema';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function checkPermission(memoryId: string, userId: string) {
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
    include: {
      tree: {
        include: { collaborators: true }
      }
    }
  });

  if (!memory) return { memory: null, error: 'NOT_FOUND' };

  const isOwner = memory.tree.ownerId === userId;
  const isCreator = memory.createdById === userId;
  const isCollaborator = memory.tree.collaborators.some(
    c => c.userId === userId && (c.role === 'EDITOR' || c.role === 'ADMIN')
  );

  if (!isOwner && !isCreator && !isCollaborator) {
    return { memory: null, error: 'FORBIDDEN' };
  }

  return { memory, error: null };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }
    
    const { id } = await params;
    const { memory, error } = await checkPermission(id, session.user.id);
    
    if (error === 'NOT_FOUND') return errorResponse('NOT_FOUND', 'Memory not found', 404);
    if (error === 'FORBIDDEN') return errorResponse('FORBIDDEN', 'Access denied', 403);
    
    const fullMemory = await prisma.memory.findUnique({
      where: { id },
      include: {
        members: {
          include: { member: true }
        },
        media: true
      }
    });
    
    return successResponse(fullMemory);
  } catch (error: any) {
    return errorResponse('INTERNAL_ERROR', error.message || 'Failed to fetch memory');
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }
    
    const { id } = await params;
    const body = await request.json();

    const { error } = await checkPermission(id, session.user.id);
    if (error === 'NOT_FOUND') return errorResponse('NOT_FOUND', 'Memory not found', 404);
    if (error === 'FORBIDDEN') return errorResponse('FORBIDDEN', 'Access denied', 403);

    const validatedData = memorySchema.parse(body);

    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date,
        type: validatedData.type,
        googlePhotosAlbumUrl: validatedData.googlePhotosAlbumUrl || null,
        icon: validatedData.icon || null,
        iconColor: validatedData.iconColor || null,
        albumCoverUrl: validatedData.albumCoverUrl || null,
        albumTitle: validatedData.albumTitle || null,
        photoCount: validatedData.photoCount || null,
        location: validatedData.location,
        tags: validatedData.tags,
        members: {
          deleteMany: {}, // Clean up existing and replace
          create: validatedData.memberIds.map(memberId => ({ memberId }))
        },
        media: {
          deleteMany: {}, // Clean up existing and replace
          create: validatedData.mediaUrls.map(url => ({
            url,
            type: 'image',
          }))
        }
      },
      include: {
        members: {
          include: {
            member: true
          }
        },
        media: true
      }
    });

    return successResponse(updatedMemory);
  } catch (error: any) {
    console.error('Failed to update memory:', error);
    if (error.name === 'ZodError') {
      return errorResponse('VALIDATION_ERROR', error.errors[0].message, 400);
    }
    return errorResponse('INTERNAL_ERROR', error.message || 'Failed to update memory');
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }

    const { id } = await params;
    
    const { error } = await checkPermission(id, session.user.id);
    if (error === 'NOT_FOUND') return errorResponse('NOT_FOUND', 'Memory not found', 404);
    if (error === 'FORBIDDEN') return errorResponse('FORBIDDEN', 'Access denied', 403);

    await prisma.memory.delete({
      where: { id }
    });

    return successResponse({ success: true });
  } catch (error: any) {
    console.error('Failed to delete memory:', error);
    return errorResponse('INTERNAL_ERROR', error.message || 'Failed to delete memory');
  }
}
