// Member Types
// Synchronized with Prisma schema

/** Represents a family tree member */
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  generation: number;
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
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  generation?: number;
  treeId: string;
}

/** Input for updating an existing member */
export interface UpdateMemberInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  generation?: number;
}

/** Relationship between two members */
export interface Relationship {
  id: string;
  type: 'PARENT' | 'SPOUSE' | 'SIBLING';
  fromId: string;
  toId: string;
  createdAt: string;
}

/** A member with its relationships loaded */
export interface MemberWithRelations extends Member {
  relationsFrom: Relationship[];
  relationsTo: Relationship[];
}

/** Input for creating a relationship */
export interface CreateRelationshipInput {
  type: 'PARENT' | 'SPOUSE' | 'SIBLING';
  fromId: string;
  toId: string;
}
