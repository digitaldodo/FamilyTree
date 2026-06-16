// Permission utilities for tree access control
// Centralized authorization logic for the Family Legacy platform

import prisma from '@/lib/prisma';

export type TreePermission = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER' | null;

/**
 * Get the user's permission level for a specific tree.
 * Returns null if the user has no access.
 */
export async function getTreePermission(
  userId: string,
  treeId: string
): Promise<TreePermission> {
  // Check if user is the owner
  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
    select: { ownerId: true },
  });

  if (!tree) return null;
  if (tree.ownerId === userId) return 'OWNER';

  // Check if user is a collaborator
  const collaborator = await prisma.treeCollaborator.findUnique({
    where: { userId_treeId: { userId, treeId } },
    select: { role: true },
  });

  if (!collaborator) return null;

  // Map TreeRole enum to permission string
  switch (collaborator.role) {
    case 'ADMIN':
      return 'ADMIN';
    case 'EDITOR':
      return 'EDITOR';
    case 'VIEWER':
      return 'VIEWER';
    default:
      return null;
  }
}

/** Check if the user can edit tree content (add/edit members, relationships) */
export function canEdit(permission: TreePermission): boolean {
  return permission === 'OWNER' || permission === 'ADMIN' || permission === 'EDITOR';
}

/** Check if the user can delete the tree */
export function canDelete(permission: TreePermission): boolean {
  return permission === 'OWNER';
}

/** Check if the user can manage collaborators (invite, remove, change roles) */
export function canManageCollaborators(permission: TreePermission): boolean {
  return permission === 'OWNER' || permission === 'ADMIN';
}

/** Check if the user can invite others to the tree */
export function canInvite(permission: TreePermission): boolean {
  return permission === 'OWNER' || permission === 'ADMIN';
}

/** Check if the user can view tree content */
export function canView(permission: TreePermission): boolean {
  return permission !== null;
}

/** Check if the user is the tree owner */
export function isOwner(permission: TreePermission): boolean {
  return permission === 'OWNER';
}
