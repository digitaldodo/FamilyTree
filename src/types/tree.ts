// Tree Types
// Synchronized with Prisma schema

import type { Member, MemberWithRelations } from './member';

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
  _count?: {
    members: number;
  };
}

/** Input for creating a new tree */
export interface CreateTreeInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  ownerId: string;
}

/** Input for updating a tree */
export interface UpdateTreeInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}
