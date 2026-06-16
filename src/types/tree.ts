// Tree Types
// Synchronized with Prisma schema

import type { Member, MemberWithRelations } from './member';

/** Tree role for collaborators */
export type TreeRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

/** Permission level (includes OWNER which is derived, not stored) */
export type TreePermission = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER' | null;

/** Represents a family tree */
export interface Tree {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  ownerId: string;
  members?: Member[];
  createdAt: string;
  updatedAt: string;
}

/** A tree with full member and relationship data loaded */
export interface TreeWithMembers extends Tree {
  members: MemberWithRelations[];
  owner?: { id: string; name: string | null; email: string };
  _count?: {
    members: number;
  };
}

/** Summary of a tree for the tree selector */
export interface TreeSummary {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  role: TreePermission;
  _count: { members: number };
  createdAt: string;
}

/** Tree collaborator record */
export interface TreeCollaborator {
  id: string;
  role: TreeRole;
  userId: string;
  treeId: string;
  user: { id: string; name: string | null; email: string };
  createdAt: string;
}

/** Input for creating a new tree */
export interface CreateTreeInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

/** Input for updating a tree */
export interface UpdateTreeInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}
