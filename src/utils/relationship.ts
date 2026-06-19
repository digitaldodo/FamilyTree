// Relationship Utils

import { MemberWithRelations, Generation } from "@/types/member";

/**
 * Get available members for a new relationship, preventing circular dependencies or duplicate identical relations.
 */
export function getValidRelationshipCandidates(
  members: MemberWithRelations[],
  generations: Generation[],
  currentMemberId: string | undefined,
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING'
): MemberWithRelations[] {
  if (!currentMemberId) return members;

  const currentMember = members.find(m => m.id === currentMemberId);
  if (!currentMember) return members;

  const getGenerationOrder = (genId: string) => {
    const gen = generations.find(g => g.id === genId);
    return gen ? gen.orderIndex : 0;
  };

  const currentMemberGenOrder = getGenerationOrder(currentMember.generationId);
  const currentMemberBirthYear = currentMember.birthDate ? new Date(currentMember.birthDate).getFullYear() : null;

  return members.filter(member => {
    // Cannot relate to self
    if (member.id === currentMemberId) return false;

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

    // Advanced: Prevent circular dependencies (e.g. parent cannot be child)
    if (relationType === 'PARENT') {
      const isAlreadyChild = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'PARENT');
      if (isAlreadyChild) return false;
    } else if (relationType === 'CHILD') {
      const isAlreadyParent = currentMember.relationsTo.some(r => r.fromId === member.id && r.type === 'PARENT');
      if (isAlreadyParent) return false;
    }

    // Chronology Enforcement
    const memberGenOrder = getGenerationOrder(member.generationId);
    const memberBirthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;

    if (relationType === 'PARENT') {
      // Parent must belong to an older generation (lower orderIndex)
      if (memberGenOrder >= currentMemberGenOrder) return false;
      if (memberGenOrder === currentMemberGenOrder - 1) {
         if (memberBirthYear !== null && currentMemberBirthYear !== null && memberBirthYear >= currentMemberBirthYear) return false;
      }
    } else if (relationType === 'CHILD') {
      // Child must belong to a younger generation (higher orderIndex)
      if (memberGenOrder <= currentMemberGenOrder) return false;
      if (memberGenOrder === currentMemberGenOrder + 1) {
         if (memberBirthYear !== null && currentMemberBirthYear !== null && memberBirthYear <= currentMemberBirthYear) return false;
      }
    } else if (relationType === 'SIBLING' || relationType === 'SPOUSE') {
      // Siblings and spouses must be in the same generation
      if (memberGenOrder !== currentMemberGenOrder) return false;
    }

    return true;
  });
}
