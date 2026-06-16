// Member Types
// TODO: Keep in sync with Prisma schema

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  deathDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bio?: string | null;
  avatar?: string | null;
  treeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  avatar?: string;
  treeId: string;
}

export interface UpdateMemberInput {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  avatar?: string;
}

// TODO: Add Relationship types
export interface Relationship {
  id: string;
  type: 'PARENT' | 'SPOUSE' | 'SIBLING';
  fromId: string;
  toId: string;
}
