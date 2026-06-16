// Generation Calculation Utilities
// BFS-based dynamic generation hierarchy with auto-normalization

import { MemberWithRelations } from '@/types/member';

/**
 * Calculate generation depths for all members using BFS graph traversal.
 *
 * Rules:
 * - Root ancestors (no parents) start at generation 0
 * - Children = parent generation + 1
 * - Spouses inherit the same generation as their partner
 * - If a new ancestor is inserted above current roots, all generations shift automatically
 *
 * @returns Map of member ID → generation number (0-indexed, normalized)
 */
export function calculateGenerations(
  members: MemberWithRelations[]
): Map<string, number> {
  if (members.length === 0) return new Map();

  const memberMap = new Map<string, MemberWithRelations>();
  members.forEach((m) => memberMap.set(m.id, m));

  // Build parent→child adjacency: parentId → childId[]
  const childrenOf = new Map<string, Set<string>>();
  // Build child→parent adjacency: childId → parentId[]
  const parentsOf = new Map<string, Set<string>>();
  // Build spouse adjacency: memberId → spouseId[]
  const spousesOf = new Map<string, Set<string>>();

  for (const member of members) {
    // PARENT relations: fromId is parent, toId is child
    for (const rel of member.relationsFrom) {
      if (rel.type === 'PARENT') {
        if (!childrenOf.has(member.id)) childrenOf.set(member.id, new Set());
        childrenOf.get(member.id)!.add(rel.toId);

        if (!parentsOf.has(rel.toId)) parentsOf.set(rel.toId, new Set());
        parentsOf.get(rel.toId)!.add(member.id);
      }
      if (rel.type === 'SPOUSE') {
        if (!spousesOf.has(member.id)) spousesOf.set(member.id, new Set());
        spousesOf.get(member.id)!.add(rel.toId);

        if (!spousesOf.has(rel.toId)) spousesOf.set(rel.toId, new Set());
        spousesOf.get(rel.toId)!.add(member.id);
      }
    }
    for (const rel of member.relationsTo) {
      if (rel.type === 'PARENT') {
        if (!parentsOf.has(member.id)) parentsOf.set(member.id, new Set());
        parentsOf.get(member.id)!.add(rel.fromId);

        if (!childrenOf.has(rel.fromId))
          childrenOf.set(rel.fromId, new Set());
        childrenOf.get(rel.fromId)!.add(member.id);
      }
      if (rel.type === 'SPOUSE') {
        if (!spousesOf.has(member.id)) spousesOf.set(member.id, new Set());
        spousesOf.get(member.id)!.add(rel.fromId);

        if (!spousesOf.has(rel.fromId))
          spousesOf.set(rel.fromId, new Set());
        spousesOf.get(rel.fromId)!.add(member.id);
      }
    }
  }

  // Find root ancestors: members with no parents
  const roots = members.filter((m) => {
    const parents = parentsOf.get(m.id);
    return !parents || parents.size === 0;
  });

  const generations = new Map<string, number>();
  const visited = new Set<string>();

  // BFS from each root
  const queue: { id: string; depth: number }[] = [];

  // Among roots, separate those who are spouses of non-roots
  // (they should get their spouse's generation, not 0)
  const primaryRoots = roots.filter((r) => {
    const spouses = spousesOf.get(r.id);
    if (!spouses) return true;
    // If any spouse is NOT a root, this person might get assigned later
    for (const sId of spouses) {
      const sParents = parentsOf.get(sId);
      if (sParents && sParents.size > 0) return false;
    }
    return true;
  });

  // Start BFS with primary roots at depth 0
  const startRoots = primaryRoots.length > 0 ? primaryRoots : roots;
  for (const root of startRoots) {
    if (!visited.has(root.id)) {
      queue.push({ id: root.id, depth: root.generation ?? 0 });
      visited.add(root.id);
    }
  }

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    generations.set(id, depth);

    // Assign spouses the same generation
    const spouses = spousesOf.get(id);
    if (spouses) {
      for (const spouseId of spouses) {
        if (!visited.has(spouseId)) {
          visited.add(spouseId);
          queue.push({ id: spouseId, depth });
        }
      }
    }

    // Assign children generation + 1
    const children = childrenOf.get(id);
    if (children) {
      for (const childId of children) {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push({ id: childId, depth: depth + 1 });
        }
      }
    }
  }

  // Handle any disconnected members (no relationships at all)
  for (const member of members) {
    if (!generations.has(member.id)) {
      generations.set(member.id, member.generation ?? 0);
    }
  }

  // Normalize: ensure minimum generation is always 0 ONLY IF negative.
  // If positive, we keep it so empty top generations are preserved.
  const minGen = Math.min(...generations.values());
  if (minGen < 0) {
    for (const [id, gen] of generations) {
      generations.set(id, gen - minGen);
    }
  }

  return generations;
}

/**
 * Group members by their calculated generation.
 * Returns a sorted array of [generationNumber, members[]] tuples.
 */
export function groupMembersByGeneration(
  members: MemberWithRelations[]
): [number, MemberWithRelations[]][] {
  const generations = calculateGenerations(members);

  const groups = new Map<number, MemberWithRelations[]>();
  let maxGen = 0;
  for (const member of members) {
    const gen = generations.get(member.id) ?? 0;
    maxGen = Math.max(maxGen, gen);
    if (!groups.has(gen)) groups.set(gen, []);
    groups.get(gen)!.push(member);
  }

  // Ensure all generations from 0 to maxGen exist
  for (let i = 0; i <= maxGen; i++) {
    if (!groups.has(i)) groups.set(i, []);
  }

  // Sort by generation number ascending
  return Array.from(groups.entries()).sort(([a], [b]) => a - b);
}

/**
 * Get the maximum generation depth in the family tree.
 */
export function getMaxGeneration(members: MemberWithRelations[]): number {
  if (members.length === 0) return 0;
  const generations = calculateGenerations(members);
  return Math.max(...generations.values()) + 1;
}
