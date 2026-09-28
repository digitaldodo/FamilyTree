import prisma from '@/lib/prisma';
import { Member, Relationship, RelationshipType, Generation } from '@/generated/prisma/client';
import { validateRelationshipCore } from '@/utils/relationship';

export type MemberWithRelations = Member & {
  generation: Generation;
  relationsFrom: Relationship[];
  relationsTo: Relationship[];
};

export class RelationshipEngine {
  // Cache invalidation is handled by React Query on the client side.

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

    // 2. Synchronous Validations (Generation, Gender, Limits, Duplicate)
    const fromGen = fromMember.generation.orderIndex;
    const toGen = toMember.generation.orderIndex;
    
    const coreValidation = validateRelationshipCore(
      fromMember as any,
      toMember as any,
      type,
      fromGen,
      toGen
    );

    if (!coreValidation.valid) {
      throw new Error(coreValidation.error);
    }

    // 3. Child Ownership Rules (Deep DB Check)
    if (type === 'PARENT') {
      await this.validateParentCoupleRule(toId, fromId);
    }

    // 4. Cycle Detection
    await this.detectCycle(fromId, toId, type);
  }

  static async validateParentCoupleRule(childId: string, prospectiveParentId?: string): Promise<void> {
    const existingParents = await prisma.relationship.findMany({
      where: { type: 'PARENT', toId: childId }
    });

    const isAlreadyParent = prospectiveParentId && existingParents.some(p => p.fromId === prospectiveParentId);

    if (existingParents.length >= 2 && !isAlreadyParent) {
      throw new Error('This child is already associated with another parent couple.');
    }

    if (existingParents.length >= 2 && isAlreadyParent) {
      return; // Already part of the couple
    }

    if (existingParents.length === 1 && !isAlreadyParent) {
      const firstParentId = existingParents[0].fromId;

      const firstParentSpouses = await prisma.relationship.findMany({
        where: { type: 'SPOUSE', OR: [{ fromId: firstParentId }, { toId: firstParentId }] }
      });
      
      if (firstParentSpouses.length > 0) {
        const spouseIds = firstParentSpouses.map(s => s.fromId === firstParentId ? s.toId : s.fromId);
        if (prospectiveParentId && spouseIds.includes(prospectiveParentId)) {
          return; // The prospective parent is the spouse. Allowed.
        }
        throw new Error('This child is already associated with another parent couple.');
      }
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
    
    const checkDescendant = async (currentId: string, targetId: string): Promise<boolean> => {
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
}
