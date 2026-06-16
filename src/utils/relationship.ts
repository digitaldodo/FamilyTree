// Relationship Utils

import { MemberWithRelations } from "@/types/member";

/**
 * Get available members for a new relationship, preventing circular dependencies or duplicate identical relations.
 */
export function getValidRelationshipCandidates(
  members: MemberWithRelations[],
  currentMemberId: string | undefined,
  relationType: 'PARENT' | 'SPOUSE' | 'SIBLING'
): MemberWithRelations[] {
  if (!currentMemberId) return members;

  const currentMember = members.find(m => m.id === currentMemberId);
  if (!currentMember) return members;

  return members.filter(member => {
    // Cannot relate to self
    if (member.id === currentMemberId) return false;

    // Check if relationship already exists
    const hasRelationFrom = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === relationType);
    const hasRelationTo = currentMember.relationsTo.some(r => r.fromId === member.id && r.type === relationType);
    
    if (hasRelationFrom || hasRelationTo) return false;

    // Advanced: Prevent circular dependencies (e.g. parent cannot be child)
    if (relationType === 'PARENT') {
      const isAlreadyChild = currentMember.relationsFrom.some(r => r.toId === member.id && r.type === 'PARENT');
      if (isAlreadyChild) return false;
    }

    return true;
  });
}
