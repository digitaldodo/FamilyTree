export type FormRelationshipType = 'PARENT' | 'CHILD' | 'SPOUSE';
export type CanonicalRelationshipType = 'PARENT' | 'SPOUSE';

export interface FormRelationshipInput {
  id: string;
  type: FormRelationshipType;
}

export interface CanonicalRelationship {
  type: CanonicalRelationshipType;
  fromId: string;
  toId: string;
}

export interface PersistedRelationshipLike {
  id?: string;
  type: CanonicalRelationshipType;
  fromId: string;
  toId: string;
}

export function canonicalizeMemberPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function canonicalizePersistedRelationship(
  rel: Pick<PersistedRelationshipLike, 'type' | 'fromId' | 'toId'>,
): CanonicalRelationship {
  if (rel.type === 'SPOUSE') {
    const [fromId, toId] = canonicalizeMemberPair(rel.fromId, rel.toId);
    return { type: 'SPOUSE', fromId, toId };
  }

  return { type: 'PARENT', fromId: rel.fromId, toId: rel.toId };
}

export function normalizePersistedRelationship(
  type: CanonicalRelationshipType | FormRelationshipType,
  fromId: string,
  toId: string,
): CanonicalRelationship | null {
  if (!fromId || !toId || fromId === toId) return null;

  if (type === 'PARENT') {
    return { type: 'PARENT', fromId, toId };
  }

  if (type === 'CHILD') {
    return { type: 'PARENT', fromId: toId, toId: fromId };
  }

  if (type === 'SPOUSE') {
    const [canonicalFromId, canonicalToId] = canonicalizeMemberPair(fromId, toId);
    return { type: 'SPOUSE', fromId: canonicalFromId, toId: canonicalToId };
  }

  return null;
}

export function relationshipKey(rel: CanonicalRelationship): string {
  if (rel.type === 'SPOUSE') {
    const [fromId, toId] = canonicalizeMemberPair(rel.fromId, rel.toId);
    return `SPOUSE:${fromId}:${toId}`;
  }

  return `PARENT:${rel.fromId}:${rel.toId}`;
}

export function normalizeFormRelationship(
  memberId: string,
  relation: Pick<FormRelationshipInput, 'id' | 'type'>,
): CanonicalRelationship | null {
  if (!relation?.id) return null;

  switch (relation.type) {
    case 'PARENT':
      return { type: 'PARENT', fromId: relation.id, toId: memberId };
    case 'CHILD':
      return { type: 'PARENT', fromId: memberId, toId: relation.id };
    case 'SPOUSE': {
      const [fromId, toId] = canonicalizeMemberPair(memberId, relation.id);
      return { type: 'SPOUSE', fromId, toId };
    }
    default:
      return null;
  }
}

export function normalizeRelationshipSet(
  memberId: string,
  relations: FormRelationshipInput[] = [],
): CanonicalRelationship[] {
  const seen = new Set<string>();
  const result: CanonicalRelationship[] = [];

  for (const relation of relations) {
    const normalized = normalizeFormRelationship(memberId, relation);
    if (!normalized) continue;
    if (normalized.fromId === normalized.toId) continue;

    const key = relationshipKey(normalized);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export function computeRelationshipDiff(
  existing: PersistedRelationshipLike[],
  desired: CanonicalRelationship[],
): { toAdd: CanonicalRelationship[]; toRemove: PersistedRelationshipLike[] } {
  const existingKeys = new Set(
    existing.map((relationship) => relationshipKey(canonicalizePersistedRelationship(relationship))),
  );
  const desiredKeys = new Set(desired.map((relationship) => relationshipKey(relationship)));

  const toRemove = existing.filter(
    (relationship) => !desiredKeys.has(relationshipKey(canonicalizePersistedRelationship(relationship))),
  );
  const toAdd = desired.filter((relationship) => !existingKeys.has(relationshipKey(relationship)));

  return { toAdd, toRemove };
}

export function getMemberRelationshipScope(memberId: string) {
  return {
    OR: [
      { type: 'PARENT', fromId: memberId },
      { type: 'PARENT', toId: memberId },
      { type: 'SPOUSE', fromId: memberId },
      { type: 'SPOUSE', toId: memberId },
    ],
  } as const;
}

export function resolveLegacyRelationshipDuplicates<T extends { id?: string; fromId: string; toId: string; type: CanonicalRelationshipType }>(
  relationships: T[],
): {
  canonicalRelationships: Array<T & { id?: string; type: CanonicalRelationshipType; fromId: string; toId: string }>;
  duplicateIds: string[];
} {
  const canonicalMap = new Map<string, T & { id?: string; type: CanonicalRelationshipType; fromId: string; toId: string }>();
  const duplicateIds: string[] = [];

  for (const relationship of relationships) {
    const canonical = canonicalizePersistedRelationship(relationship);
    const key = relationshipKey(canonical);
    if (canonicalMap.has(key)) {
      if (relationship.id) duplicateIds.push(relationship.id);
      continue;
    }

    canonicalMap.set(key, {
      ...relationship,
      ...canonical,
    });
  }

  return {
    canonicalRelationships: Array.from(canonicalMap.values()),
    duplicateIds,
  };
}

export async function replaceMemberRelationshipSet<Tx extends {
  relationship: {
    findMany: (args: any) => Promise<Array<{ id: string; type: CanonicalRelationshipType; fromId: string; toId: string }>>;
    delete: (args: any) => Promise<unknown>;
    create: (args: any) => Promise<unknown>;
  };
}>(
  {
    tx,
    memberId,
    treeId,
    relationships,
    existingRelationships,
  }: {
    tx: Tx;
    memberId: string;
    treeId: string;
    relationships: FormRelationshipInput[];
    existingRelationships?: Array<{ id: string; type: CanonicalRelationshipType; fromId: string; toId: string }>;
  },
) {
  const desired = normalizeRelationshipSet(memberId, relationships);
  const current = existingRelationships ?? await tx.relationship.findMany({ where: getMemberRelationshipScope(memberId) });

  const { toAdd, toRemove } = computeRelationshipDiff(current, desired);

  for (const relationship of toRemove) {
    if (!relationship.id) continue;
    await tx.relationship.delete({ where: { id: relationship.id } });
  }

  for (const relationship of toAdd) {
    await tx.relationship.create({
      data: {
        type: relationship.type,
        fromId: relationship.fromId,
        toId: relationship.toId,
        treeId,
      },
    });
  }

  return {
    desired,
    created: toAdd.length,
    deleted: toRemove.length,
  };
}

export function buildCanonicalRelationshipPatch(
  memberId: string,
  relationships: FormRelationshipInput[] = [],
  existingRelationships: Array<{ id?: string; type: CanonicalRelationshipType; fromId: string; toId: string }> = [],
): {
  desired: CanonicalRelationship[];
  toAdd: CanonicalRelationship[];
  toRemove: Array<{ id?: string; type: CanonicalRelationshipType; fromId: string; toId: string }>;
} {
  const desired = normalizeRelationshipSet(memberId, relationships);
  const { toAdd, toRemove } = computeRelationshipDiff(existingRelationships, desired);
  return { desired, toAdd, toRemove };
}
