import prisma from '@/lib/prisma';
import { Member, Relationship, RelationshipType, Generation } from '@/generated/prisma/client';
import { isSpouseEligible } from '@/utils/relationship';

export type MemberWithRelations = Member & {
  generation: Generation;
  relationsFrom: Relationship[];
  relationsTo: Relationship[];
};

// Simple Graph Structure for Inference
type AdjacencyList = Record<string, string[]>;
type Graph = {
  parents: AdjacencyList;
  children: AdjacencyList;
  spouses: AdjacencyList;
  explicitSiblings: AdjacencyList;
};

export class RelationshipEngine {
  /**
   * Conflict Matrix Validation
   * Rejects invalid combinations before saving.
   */
  static async validateRelationship(fromMember: MemberWithRelations, toMember: MemberWithRelations, type: RelationshipType): Promise<void> {
    const fromId = fromMember.id;
    const toId = toMember.id;

    if (fromId === toId) {
      throw new Error('A member cannot be related to themselves.');
    }

    if (fromMember.treeId !== toMember.treeId) {
      throw new Error('Members must belong to the same tree.');
    }

    // Load existing relationships between these two
    const existingOverlaps = await prisma.relationship.findMany({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ]
      }
    });

    if (existingOverlaps.length > 0) {
      const types = existingOverlaps.map(r => r.type);
      if (types.includes(type)) {
        throw new Error('Relationship already exists.');
      }
      throw new Error(`Members already have an incompatible relationship: ${types.join(', ')}.`);
    }

    // 2. Chronological/Generation Validation
    const fromGen = fromMember.generation.orderIndex;
    const toGen = toMember.generation.orderIndex;

    if (type === 'SPOUSE' || type === 'SIBLING') {
      if (fromGen !== toGen) {
        throw new Error(`${type === 'SPOUSE' ? 'Spouse' : 'Sibling'} must belong to the same generation.`);
      }
      if (type === 'SPOUSE') {
        if (!isSpouseEligible(fromMember.gender, toMember.gender)) {
          throw new Error('Spouse eligibility rules not met based on gender configurations.');
        }
      }
    } else if (type === 'PARENT') {
      // fromId is PARENT of toId
      if (fromGen !== toGen - 1) {
        throw new Error('Parent must belong exactly to the generation immediately above the child.');
      }
    }

    // 3. Limit Validations & Exclusivity
    if (type === 'SPOUSE') {
      // Spouse Exclusivity
      const existingFromSpouses = await prisma.relationship.count({
        where: { type: 'SPOUSE', OR: [{ fromId }, { toId: fromId }] }
      });
      if (existingFromSpouses >= 1) throw new Error('Maximum 1 spouse allowed for ' + fromMember.firstName);

      const existingToSpouses = await prisma.relationship.count({
        where: { type: 'SPOUSE', OR: [{ fromId: toId }, { toId }] }
      });
      if (existingToSpouses >= 1) throw new Error('Maximum 1 spouse allowed for ' + toMember.firstName);
    } else if (type === 'PARENT') {
      // Parent Exclusivity
      const existingParents = await prisma.relationship.findMany({
        where: { type: 'PARENT', toId: toId }
      });
      
      if (existingParents.length >= 2) {
        throw new Error('Maximum two parents allowed.');
      }

      // Child Ownership Rules: Prevent Child duplication across unrelated families.
      if (existingParents.length === 1) {
        const firstParentId = existingParents[0].fromId;
        // The new parent (fromId) must ideally be a spouse of firstParentId, or have no spouses.
        // We can enforce that if firstParentId has a spouse, it MUST be fromId.
        const firstParentSpouses = await prisma.relationship.findMany({
          where: { type: 'SPOUSE', OR: [{ fromId: firstParentId }, { toId: firstParentId }] }
        });
        
        if (firstParentSpouses.length > 0) {
          const spouseIds = firstParentSpouses.map(s => s.fromId === firstParentId ? s.toId : s.fromId);
          if (!spouseIds.includes(fromId)) {
            // firstParent has a spouse, but new parent is not that spouse!
            throw new Error('Child already belongs to a family. Cannot assign unrelated third parent.');
          }
        }
      }
    }

    // 4. Cycle Detection
    await this.detectCycle(fromId, toId, type);
  }

  /**
   * Circular Relationship Prevention (Ancestry cycles)
   */
  static async detectCycle(fromId: string, toId: string, type: RelationshipType): Promise<void> {
    if (type !== 'PARENT') return;

    // fromId is the new parent, toId is the new child.
    // We must ensure that fromId is not already a descendant of toId.
    const visited = new Set<string>();
    
    const checkDescendant = async (currentId: string, targetId: string) => {
      if (currentId === targetId) return true;
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      const childrenRels = await prisma.relationship.findMany({
        where: { type: 'PARENT', fromId: currentId }
      });

      for (const rel of childrenRels) {
        if (await checkDescendant(rel.toId, targetId)) {
          return true;
        }
      }
      return false;
    };

    const hasCycle = await checkDescendant(toId, fromId);
    if (hasCycle) {
      throw new Error('Ancestry cycle detected. A descendant cannot be added as a parent.');
    }
  }

  /**
   * Automatic Parent Propagation
   */
  static async applySmartRules(fromId: string, toId: string, type: RelationshipType, treeId: string): Promise<void> {
    if (type === 'PARENT') {
      // share child with spouse
      const spouses = await prisma.relationship.findMany({
        where: { type: 'SPOUSE', OR: [{ fromId }, { toId: fromId }] }
      });
      
      for (const spouseRel of spouses) {
        const spouseId = spouseRel.fromId === fromId ? spouseRel.toId : spouseRel.fromId;
        
        const existingParentRel = await prisma.relationship.count({
          where: { type: 'PARENT', fromId: spouseId, toId }
        });
        
        if (existingParentRel === 0) {
          const parentCount = await prisma.relationship.count({
            where: { type: 'PARENT', toId }
          });
          if (parentCount < 2) {
            await prisma.relationship.create({
              data: { type: 'PARENT', fromId: spouseId, toId }
            });
          }
        }
      }
    } else if (type === 'SPOUSE') {
      // share existing children between new spouses
      const childrenA = await prisma.relationship.findMany({ where: { type: 'PARENT', fromId } });
      const childrenB = await prisma.relationship.findMany({ where: { type: 'PARENT', fromId: toId } });
      
      const childIdsA = childrenA.map(c => c.toId);
      const childIdsB = childrenB.map(c => c.toId);
      
      for (const childId of childIdsA) {
        if (!childIdsB.includes(childId)) {
          const parentCount = await prisma.relationship.count({ where: { type: 'PARENT', toId: childId } });
          if (parentCount < 2) {
            await prisma.relationship.create({ data: { type: 'PARENT', fromId: toId, toId: childId } });
          }
        }
      }
      for (const childId of childIdsB) {
        if (!childIdsA.includes(childId)) {
          const parentCount = await prisma.relationship.count({ where: { type: 'PARENT', toId: childId } });
          if (parentCount < 2) {
            await prisma.relationship.create({ data: { type: 'PARENT', fromId, toId: childId } });
          }
        }
      }
    }
  }

  /**
   * Load entire graph in memory for fast inference
   */
  private static async loadGraph(treeId: string): Promise<Graph> {
    const relations = await prisma.relationship.findMany({
      where: { from: { treeId } }
    });

    const graph: Graph = {
      parents: {},
      children: {},
      spouses: {},
      explicitSiblings: {}
    };

    const addEdge = (list: AdjacencyList, u: string, v: string) => {
      if (!list[u]) list[u] = [];
      if (!list[u].includes(v)) list[u].push(v);
    };

    for (const rel of relations) {
      if (rel.type === 'PARENT') {
        addEdge(graph.children, rel.fromId, rel.toId);
        addEdge(graph.parents, rel.toId, rel.fromId);
      } else if (rel.type === 'SPOUSE') {
        addEdge(graph.spouses, rel.fromId, rel.toId);
        addEdge(graph.spouses, rel.toId, rel.fromId);
      } else if (rel.type === 'SIBLING') {
        addEdge(graph.explicitSiblings, rel.fromId, rel.toId);
        addEdge(graph.explicitSiblings, rel.toId, rel.fromId);
      }
    }

    return graph;
  }

  /**
   * Infer relationships for a specific member dynamically.
   */
  static async inferRelationshipsForMember(memberId: string, treeId: string) {
    const graph = await this.loadGraph(treeId);

    const parents = graph.parents[memberId] || [];
    const children = graph.children[memberId] || [];
    const spouses = graph.spouses[memberId] || [];
    
    // Inferred Siblings: share both parents, plus explicitly defined siblings
    const siblingsSet = new Set<string>(graph.explicitSiblings[memberId] || []);
    if (parents.length === 2) {
      const [p1, p2] = parents;
      const c1 = graph.children[p1] || [];
      const c2 = graph.children[p2] || [];
      // Intersection of children
      for (const siblingCandidate of c1) {
        if (c2.includes(siblingCandidate) && siblingCandidate !== memberId) {
          siblingsSet.add(siblingCandidate);
        }
      }
    }

    // Grandparents: parents of parents
    const grandparentsSet = new Set<string>();
    for (const p of parents) {
      const grandP = graph.parents[p] || [];
      grandP.forEach(gp => grandparentsSet.add(gp));
    }

    // Grandchildren: children of children
    const grandchildrenSet = new Set<string>();
    for (const c of children) {
      const grandC = graph.children[c] || [];
      grandC.forEach(gc => grandchildrenSet.add(gc));
    }

    // Uncles/Aunts: siblings of parents
    // Nephews/Nieces: children of siblings
    // Cousins: children of uncles/aunts

    return {
      parents,
      children,
      spouses,
      siblings: Array.from(siblingsSet),
      grandparents: Array.from(grandparentsSet),
      grandchildren: Array.from(grandchildrenSet)
    };
  }

  /**
   * Build full graph for Tree layout
   */
  static async buildRelationshipGraph(treeId: string) {
    const members = await prisma.member.findMany({
      where: { treeId },
      include: { generation: true }
    });

    const graph = await this.loadGraph(treeId);
    
    // Map inferred relationships for all members
    const inferred = new Map<string, any>();
    for (const member of members) {
      inferred.set(member.id, await this.inferRelationshipsForMember(member.id, treeId));
    }

    const relations = await prisma.relationship.findMany({
      where: { from: { treeId } },
      include: {
        from: { include: { generation: true } },
        to: { include: { generation: true } }
      }
    });

    return { relations, inferred: Object.fromEntries(inferred), warnings: [] };
  }
}
