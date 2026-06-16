// Tree Types
// TODO: Keep in sync with Prisma schema

import { Member } from './member';

export interface Tree {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  members?: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreeInput {
  name: string;
  description?: string;
}

export interface UpdateTreeInput {
  name?: string;
  description?: string;
}
