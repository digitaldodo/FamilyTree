import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';

/** Resolves the tree a media record belongs to (via its member or memory). */
async function resolveTreeId(target: { memberId?: string | null; memoryId?: string | null }) {
  if (target.memberId) {
    const member = await prisma.member.findUnique({
      where: { id: target.memberId },
      select: { treeId: true },
    });
    return member ? member.treeId : null;
  }
  if (target.memoryId) {
    const memory = await prisma.memory.findUnique({
      where: { id: target.memoryId },
      select: { treeId: true },
    });
    return memory ? memory.treeId : null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url, type = 'image', memberId, memoryId, publicId } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    // Authorization: media can only be attached to a member/memory in a tree
    // the caller is allowed to edit.
    if (memberId || memoryId) {
      const treeId = await resolveTreeId({ memberId, memoryId });
      if (!treeId) {
        return NextResponse.json({ error: 'Member or memory not found' }, { status: 404 });
      }
      const permission = await getTreePermission(session.user.id, treeId);
      if (!canEdit(permission)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const media = await prisma.media.create({
      data: {
        url,
        type,
        memberId,
        memoryId,
        publicId,
      },
    });

    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error('Failed to create media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const existing = await prisma.media.findUnique({
      where: { id },
      select: { memberId: true, memoryId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    const treeId = await resolveTreeId(existing);
    if (treeId) {
      const permission = await getTreePermission(session.user.id, treeId);
      if (!canEdit(permission)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
