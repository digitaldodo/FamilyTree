// Relationship Utils

import { MemberWithRelations, Generation } from "@/types/member";

/**
 * Get available members for a new relationship, preventing circular dependencies or duplicate identical relations.
 */
export function getValidRelationshipCandidates(
  members: MemberWithRelations[],
  generations: Generation[],
  currentMemberId: string | undefined,
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING',
  currentGenerationId?: string
): MemberWithRelations[] {
  const getGenerationOrder = (genId: string) => {
    const gen = generations.find(g => g.id === genId);
    return gen ? gen.orderIndex : 0;
  };

  const currentMember = currentMemberId ? members.find(m => m.id === currentMemberId) : undefined;
  
  // Use explicitly passed generationId or fallback to current member's generationId
  const effectiveGenId = currentGenerationId || currentMember?.generationId;
  if (!effectiveGenId) return []; // If we don't know the generation, we can't safely filter.

  const currentMemberGenOrder = getGenerationOrder(effectiveGenId);
  const currentMemberBirthYear = currentMember?.birthDate ? new Date(currentMember.birthDate).getFullYear() : null;

  return members.filter(member => {
    // Cannot relate to self
    if (currentMemberId && member.id === currentMemberId) return false;

    if (currentMember) {
      // Check if relationship already exists
      let hasRelation = false;
      if (relationType === 'PARENT') {
         hasRelation = currentMember.relationsTo.some(r => r.fromId === member.id && r.type === 'PARENT');
      } else if (relationType === 'CHILD') {
         hasRelation = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'PARENT');
      } else {
         hasRelation = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === relationType) ||
                       currentMember.relationsTo.some(r => r.fromId === member.id && r.type === relationType);
      }
      
      if (hasRelation) return false;

      // Prevent overlapping relations between two members
      const isParentChild = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'PARENT') ||
                            currentMember.relationsTo.some(r => r.fromId === member.id && r.type === 'PARENT');
      const isSpouse = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'SPOUSE') ||
                       currentMember.relationsTo.some(r => r.fromId === member.id && r.type === 'SPOUSE');
      const isSibling = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'SIBLING') ||
                        currentMember.relationsTo.some(r => r.fromId === member.id && r.type === 'SIBLING');

      if (relationType === 'PARENT' || relationType === 'CHILD') {
        if (isSpouse || isSibling) return false;
      }
      if (relationType === 'SPOUSE') {
        if (isParentChild || isSibling) return false;
      }
      if (relationType === 'SIBLING') {
        if (isParentChild || isSpouse) return false;
      }

      // Advanced: Prevent circular dependencies (e.g. parent cannot be child)
      if (relationType === 'PARENT') {
        const isAlreadyChild = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'PARENT');
        if (isAlreadyChild) return false;
      } else if (relationType === 'CHILD') {
        const isAlreadyParent = currentMember.relationsTo.some(r => r.fromId === member.id && r.type === 'PARENT');
        if (isAlreadyParent) return false;
      }
    }

    // Chronology Enforcement (Strict Generation Distance Rule)
    const memberGenOrder = getGenerationOrder(member.generationId);

    if (relationType === 'PARENT') {
      // Parent must be exactly one generation above
      if (memberGenOrder !== currentMemberGenOrder - 1) return false;
    } else if (relationType === 'CHILD') {
      // Child must be exactly one generation below
      if (memberGenOrder !== currentMemberGenOrder + 1) return false;
    } else if (relationType === 'SIBLING' || relationType === 'SPOUSE') {
      // Siblings and spouses must be in the same generation
      if (memberGenOrder !== currentMemberGenOrder) return false;
    }

    return true;
  });
}

/**
 * Validates the full relationship graph for consistency and returns warnings.
 */
export function buildRelationshipGraph(members: MemberWithRelations[], generations: Generation[]): { warnings: string[] } {
  const warnings: string[] = [];

  const getGenerationOrder = (genId: string) => {
    const gen = generations.find(g => g.id === genId);
    return gen ? gen.orderIndex : 0;
  };

  members.forEach(member => {
    const memberGenOrder = getGenerationOrder(member.generationId);

    // Check parents
    const parents = member.relationsTo.filter(r => r.type === 'PARENT');
    if (parents.length > 2) {
      warnings.push(`Warning: Member ${member.firstName} ${member.lastName} has more than 2 parents.`);
    }

    parents.forEach(r => {
      const parent = members.find(m => m.id === r.fromId);
      if (parent) {
        const parentGenOrder = getGenerationOrder(parent.generationId);
        if (parentGenOrder !== memberGenOrder - 1) {
          warnings.push(`Warning: Generation gap for parent ${parent.firstName} ${parent.lastName} and child ${member.firstName} ${member.lastName} is invalid.`);
        }
      }
    });

    // Check spouses
    const spouses = [
      ...member.relationsFrom.filter(r => r.type === 'SPOUSE'),
      ...member.relationsTo.filter(r => r.type === 'SPOUSE')
    ];
    // spouses list will have duplicates if we just count, but wait, relationsFrom and relationsTo might contain the same spouse if bidirectional? No, SPOUSE is stored once.
    if (spouses.length > 1) {
      warnings.push(`Warning: Member ${member.firstName} ${member.lastName} has more than 1 spouse.`);
    }

    spouses.forEach(r => {
      const spouseId = r.fromId === member.id ? r.toId : r.fromId;
      const spouse = members.find(m => m.id === spouseId);
      if (spouse) {
        const spouseGenOrder = getGenerationOrder(spouse.generationId);
        if (spouseGenOrder !== memberGenOrder) {
          warnings.push(`Warning: Spouses ${member.firstName} ${member.lastName} and ${spouse.firstName} ${spouse.lastName} are in different generations.`);
        }
      }
    });

    // Check siblings
    const siblings = [
      ...member.relationsFrom.filter(r => r.type === 'SIBLING'),
      ...member.relationsTo.filter(r => r.type === 'SIBLING')
    ];
    siblings.forEach(r => {
      const siblingId = r.fromId === member.id ? r.toId : r.fromId;
      const sibling = members.find(m => m.id === siblingId);
      if (sibling) {
        const siblingGenOrder = getGenerationOrder(sibling.generationId);
        if (siblingGenOrder !== memberGenOrder) {
          warnings.push(`Warning: Siblings ${member.firstName} ${member.lastName} and ${sibling.firstName} ${sibling.lastName} are in different generations.`);
        }
      }
    });
    
    // Cycle detection check (simple): a member cannot be an ancestor of themselves
    const visited = new Set<string>();
    const checkCycle = (currentId: string) => {
      if (visited.has(currentId)) return true; // cycle detected
      visited.add(currentId);
      const current = members.find(m => m.id === currentId);
      if (!current) return false;
      const currentParents = current.relationsTo.filter(r => r.type === 'PARENT');
      for (const pRel of currentParents) {
        if (checkCycle(pRel.fromId)) return true;
      }
      visited.delete(currentId);
      return false;
    };
    
    if (checkCycle(member.id)) {
       warnings.push(`Warning: Ancestry cycle detected involving ${member.firstName} ${member.lastName}.`);
    }
  });

  return { warnings: Array.from(new Set(warnings)) }; // remove duplicates
}
