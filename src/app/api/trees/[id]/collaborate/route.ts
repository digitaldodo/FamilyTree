import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getTreePermission, canEdit } from '@/lib/permissions';
import { errorResponse } from '@/lib/utils';
import { ChangeEvent } from '@/domain/collaboration/change-events';
import { ConflictEngine } from '@/domain/collaboration/conflict-engine';
import { MergeEngine } from '@/domain/collaboration/merge-engine';
import { MemberWithRelations } from '@/types/member';
import { createTreeSnapshot } from '@/lib/versioning';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const { id } = await params;
    
    const permission = await getTreePermission(session.user.id, id);
    if (!canEdit(permission)) {
      return errorResponse('FORBIDDEN', 'Forbidden', 403);
    }

    let body = null;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400);
    }
    const { versionId, events } = body as { versionId: string | null; events: ChangeEvent[] };

    const safeEvents = Array.isArray(events) ? events : [];

    if (safeEvents.length === 0) {
      return NextResponse.json({ success: true, message: 'No events to merge' });
    }

    // Get the latest version
    const latestVersion = await prisma.treeVersion.findFirst({
      where: { treeId: id },
      orderBy: { createdAt: 'desc' }
    });

    if (latestVersion && versionId && latestVersion.id !== versionId) {
      // Conflict: Version divergence
      return NextResponse.json({
        success: false,
        conflict: true,
        message: 'Version divergence detected. Please refresh to get latest changes.'
      });
    }

    let baseMembers: MemberWithRelations[] = [];
    let baseGenerations: any[] = [];

    if (latestVersion) {
      baseMembers = (typeof latestVersion.membersData === 'string' ? JSON.parse(latestVersion.membersData) : latestVersion.membersData) as any;
      baseGenerations = (typeof latestVersion.gensData === 'string' ? JSON.parse(latestVersion.gensData) : latestVersion.gensData) as any;
    } else {
      // Fallback to active DB state
      const tree = await prisma.tree.findUnique({
        where: { id },
        include: {
          members: {
             include: { relationsFrom: true, relationsTo: true }
          },
          generations: true
        }
      });
      if (tree) {
        baseMembers = tree.members as any;
        baseGenerations = tree.generations;
      }
    }

    // Run ConflictEngine (currently checks within proposed events if there are overlapping changes, 
    // since we blocked divergence above, existingEvents since base is empty)
    const conflictReport = ConflictEngine.detectConflicts(safeEvents, []);
    if (conflictReport.hasConflict) {
      return NextResponse.json({
        success: false,
        conflict: true,
        conflicts: conflictReport.conflicts
      });
    }

    // MergeEngine
    const mergeResult = MergeEngine.merge(baseMembers, safeEvents);
    
    if (!mergeResult.success) {
      console.error('[MERGE_VALIDATION_FAILED]', mergeResult.errors);
      return NextResponse.json({
        success: false,
        message: 'Merge validation failed',
        errors: mergeResult.errors
      });
    }

    // Extract unique relationships from merged members
    const mergedRelations: any[] = [];
    const seenRels = new Set<string>();
    
    for (const m of mergeResult.mergedMembers) {
      if (m.relationsFrom) {
        for (const r of m.relationsFrom) {
          if (!seenRels.has(r.id)) {
            seenRels.add(r.id);
            mergedRelations.push(r);
          }
        }
      }
      if (m.relationsTo) {
        for (const r of m.relationsTo) {
          if (!seenRels.has(r.id)) {
            seenRels.add(r.id);
            mergedRelations.push(r);
          }
        }
      }
    }

    // Create New Version
    const newVersion = await createTreeSnapshot(
      id,
      session.user.id,
      `Merged ${safeEvents.length} change(s)`,
      mergeResult.mergedMembers,
      mergedRelations,
      baseGenerations
    );

    // Also update main tree updatedAt to trigger cache invalidations if needed
    await prisma.tree.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // In a full implementation, we might sync mergeResult.mergedMembers back to relational tables here.
    // For now, we rely on the client fetching the latest version or we keep the relational tables in sync
    // asynchronously.

    return NextResponse.json({
      success: true,
      versionId: newVersion.id,
      message: 'Changes merged successfully'
    });

  } catch (error: any) {
    console.error('[COLLABORATION_ERROR]', error);
    return errorResponse('SERVER_ERROR', error.message, 500);
  }
}
