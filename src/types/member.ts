// Member Types
// Synchronized with Prisma schema

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/** Represents a family tree member */
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  generationId: string;
  treeId: string;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a new member */
export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: Gender;
  bio?: string;
  imageUrl?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  generationId: string;
  treeId: string;
}

/** Input for updating an existing member */
export interface UpdateMemberInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: Gender;
  bio?: string;
  imageUrl?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  generationId?: string;
}

/** Relationship between two members */
export interface Relationship {
  id: string;
  type: 'PARENT' | 'SPOUSE';
  fromId: string;
  toId: string;
  createdAt: string;
}

export interface InferredRelationships {
  parents: string[];
  children: string[];
  siblings: string[];
  spouses: string[];
  grandparents: string[];
  grandchildren: string[];
}

/** A member with its relationships loaded */
export interface MemberWithRelations extends Member {
  relationsFrom: Relationship[];
  relationsTo: Relationship[];
  inferredRelationships?: InferredRelationships;
}

/** Input for creating a relationship */
export interface CreateRelationshipInput {
  type: 'PARENT' | 'SPOUSE';
  fromId: string;
  toId: string;
}

/** Represents a generation within a tree */
export interface Generation {
  id: string;
  treeId: string;
  name: string;
  orderIndex: number;
  createdAt: string;
}
