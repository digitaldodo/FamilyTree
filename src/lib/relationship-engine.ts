import prisma from '@/lib/prisma';
import { Member, Relationship, RelationshipType, Generation } from '@/generated/prisma/client';
import { isSpouseEligible } from '@/utils/relationship';

export type MemberWithRelations = Member & {
  generation: Generation;
  relationsFrom: Relationship[];
  relationsTo: Relationship[];
};

export class RelationshipEngine {
  /**
   * Core conflict check: Only ONE family relationship category may exist between two members.
   */
  static async checkRelationshipConflict(fromId: string, toId: string): Promise<void> {
    const existing = await prisma.relationship.findFirst({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ]
      }
    });

    if (existing) {
      throw new Error('Members already have an incompatible relationship. Only one relationship category may exist between two members.');
    }
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
   * Validate all constraints before inserting
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

    // 1. Unique Relationship Rule
    const existingOverlaps = await prisma.relationship.findFirst({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ]
      }
    });

    if (existingOverlaps && existingOverlaps.type !== type) {
      throw new Error('Members already have an incompatible relationship.');
    }

    if (existingOverlaps && existingOverlaps.type === type) {
      throw new Error('Relationship already exists.');
    }

    // 2. Chronological/Generation Validation
    const fromGen = fromMember.generation.orderIndex;
    const toGen = toMember.generation.orderIndex;

    if (type === 'SPOUSE' || type === 'SIBLING') {
      if (fromGen !== toGen) {
        if (type === 'SPOUSE') {
          throw new Error('Spouse must belong to the same generation and satisfy spouse eligibility rules.');
        } else {
          throw new Error('Sibling must belong to the same generation.');
        }
      }
      
      if (type === 'SPOUSE') {
        if (!isSpouseEligible(fromMember.gender, toMember.gender)) {
          throw new Error('Spouse must belong to the same generation and satisfy spouse eligibility rules.');
        }
      }
    } else if (type === 'PARENT') {
      if (fromGen !== toGen - 1) {
        throw new Error('Parent must belong exactly to the generation immediately above the child.');
      }
    }

    // 3. Limit Validations
    if (type === 'SPOUSE') {
      const existingFromSpouses = await prisma.relationship.count({
        where: { type: 'SPOUSE', OR: [{ fromId }, { toId: fromId }] }
      });
      const existingToSpouses = await prisma.relationship.count({
        where: { type: 'SPOUSE', OR: [{ fromId: toId }, { toId }] }
      });
      if (existingFromSpouses >= 1 || existingToSpouses >= 1) {
        throw new Error('Maximum 1 spouse allowed.');
      }
    } else if (type === 'PARENT') {
      const existingParents = await prisma.relationship.count({
        where: { type: 'PARENT', toId: toId }
      });
      if (existingParents >= 2) {
        throw new Error('Maximum two parents allowed.');
      }
    }

    // 4. Cycle Detection
    await this.detectCycle(fromId, toId, type);
  }

  /**
   * Apply Smart Rules: Sibling detection, Spouse child sharing.
   */
  static async applySmartRules(fromId: string, toId: string, type: RelationshipType, treeId: string): Promise<void> {
    if (type === 'PARENT') {
      // fromId is parent, toId is child
      
      // 1. Share child with spouse
      const spouses = await prisma.relationship.findMany({
        where: { type: 'SPOUSE', OR: [{ fromId }, { toId: fromId }] }
      });
      
      for (const spouseRel of spouses) {
        const spouseId = spouseRel.fromId === fromId ? spouseRel.toId : spouseRel.fromId;
        
        const existingParentRel = await prisma.relationship.findFirst({
          where: {
            OR: [
              { fromId: spouseId, toId },
              { fromId: toId, toId: spouseId }
            ]
          }
        });
        
        if (!existingParentRel) {
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

      // 2. Sibling Detection
      // Find all children of this parent
      const otherChildrenRels = await prisma.relationship.findMany({
        where: { type: 'PARENT', fromId, toId: { not: toId } }
      });

      for (const siblingRel of otherChildrenRels) {
        const siblingId = siblingRel.toId;
        
        const existingRelation = await prisma.relationship.findFirst({
          where: {
            OR: [
              { fromId: toId, toId: siblingId },
              { fromId: siblingId, toId: toId }
            ]
          }
        });

        if (!existingRelation) {
          // Sort IDs to prevent duplicates in symmetrical relation
          const [id1, id2] = [toId, siblingId].sort();
          await prisma.relationship.create({
            data: { type: 'SIBLING', fromId: id1, toId: id2 }
          });
        }
      }
    } else if (type === 'SPOUSE') {
      // Share children between new spouses
      const childrenA = await prisma.relationship.findMany({
        where: { type: 'PARENT', fromId }
      });
      const childrenB = await prisma.relationship.findMany({
        where: { type: 'PARENT', fromId: toId }
      });
      
      const childIdsA = childrenA.map(c => c.toId);
      const childIdsB = childrenB.map(c => c.toId);
      
      for (const childId of childIdsA) {
        if (!childIdsB.includes(childId)) {
          const overlap = await prisma.relationship.findFirst({
            where: { OR: [{ fromId: toId, toId: childId }, { fromId: childId, toId }] }
          });
          if (overlap) continue;

          const parentCount = await prisma.relationship.count({ where: { type: 'PARENT', toId: childId } });
          if (parentCount < 2) {
            await prisma.relationship.create({ data: { type: 'PARENT', fromId: toId, toId: childId } });
          }
        }
      }
      
      for (const childId of childIdsB) {
        if (!childIdsA.includes(childId)) {
          const overlap = await prisma.relationship.findFirst({
            where: { OR: [{ fromId, toId: childId }, { fromId: childId, toId: fromId }] }
          });
          if (overlap) continue;

          const parentCount = await prisma.relationship.count({ where: { type: 'PARENT', toId: childId } });
          if (parentCount < 2) {
            await prisma.relationship.create({ data: { type: 'PARENT', fromId, toId: childId } });
          }
        }
      }
    }
  }

  static async buildRelationshipGraph(treeId: string) {
    const relations = await prisma.relationship.findMany({
      where: { from: { treeId } },
      include: {
        from: { include: { generation: true } },
        to: { include: { generation: true } }
      }
    });

    const warnings: string[] = [];

    // Validations on full graph
    for (const rel of relations) {
      if (rel.type === 'PARENT' && rel.from.generation.orderIndex !== rel.to.generation.orderIndex - 1) {
         warnings.push(`Warning: Generation gap for parent ${rel.from.firstName} and child ${rel.to.firstName} is invalid.`);
      }
      if (rel.type === 'SPOUSE' && rel.from.generation.orderIndex !== rel.to.generation.orderIndex) {
         warnings.push(`Warning: Spouses ${rel.from.firstName} and ${rel.to.firstName} are in different generations.`);
      }
      if (rel.type === 'SIBLING' && rel.from.generation.orderIndex !== rel.to.generation.orderIndex) {
         warnings.push(`Warning: Siblings ${rel.from.firstName} and ${rel.to.firstName} are in different generations.`);
      }
    }

    return { relations, warnings };
  }
}
