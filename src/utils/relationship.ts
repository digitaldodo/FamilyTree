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
