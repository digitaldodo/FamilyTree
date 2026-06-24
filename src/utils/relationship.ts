// Relationship Utils

import { MemberWithRelations, Generation } from "@/types/member";

export function alreadyRelated(memberA: MemberWithRelations, memberB: MemberWithRelations): boolean {
  if (memberA.id === memberB.id) return true;

  const isParent = memberA.relationsTo.some(r => r.fromId === memberB.id && r.type === 'PARENT') ||
                   memberB.relationsTo.some(r => r.fromId === memberA.id && r.type === 'PARENT');
  
  const isChild = memberA.relationsFrom.some(r => r.toId === memberB.id && r.type === 'PARENT') ||
                  memberB.relationsFrom.some(r => r.toId === memberA.id && r.type === 'PARENT');
                  
  const isSpouse = memberA.relationsFrom.some(r => r.toId === memberB.id && r.type === 'SPOUSE') ||
                   memberA.relationsTo.some(r => r.fromId === memberB.id && r.type === 'SPOUSE');
                   
  const isSibling = memberA.relationsTo.some(rA => rA.type === 'PARENT' && 
                    memberB.relationsTo.some(rB => rB.type === 'PARENT' && rB.fromId === rA.fromId));

  return isParent || isChild || isSpouse || isSibling;
}

export function isSpouseEligible(genderA?: string | null, genderB?: string | null): boolean {
  if (!genderA || !genderB) return true;
  if (genderA === 'OTHER' || genderB === 'OTHER') return true;
  if (genderA === 'MALE' && genderB !== 'FEMALE') return false;
  if (genderA === 'FEMALE' && genderB !== 'MALE') return false;
  return true;
}

export function validateRelationshipCore(
  fromMember: MemberWithRelations,
  toMember: MemberWithRelations,
  type: 'PARENT' | 'SPOUSE',
  fromGenOrder: number,
  toGenOrder: number
): { valid: boolean; error?: string } {
  if (fromMember.id === toMember.id) {
    return { valid: false, error: 'A member cannot be related to themselves.' };
  }

  if (fromMember.treeId !== toMember.treeId) {
    return { valid: false, error: 'Members must belong to the same tree.' };
  }

  if (alreadyRelated(fromMember, toMember)) {
    return { valid: false, error: 'Members already have an incompatible relationship or are siblings.' };
  }

  if (type === 'SPOUSE') {
    if (fromGenOrder !== toGenOrder) {
      return { valid: false, error: 'Spouse must belong to the same generation.' };
    }
    if (!isSpouseEligible(fromMember.gender, toMember.gender)) {
      return { valid: false, error: 'Spouse eligibility rules not met based on gender configurations.' };
    }

    const fromSpouses = fromMember.relationsFrom.filter(r => r.type === 'SPOUSE').length +
                        fromMember.relationsTo.filter(r => r.type === 'SPOUSE').length;
    if (fromSpouses >= 1) return { valid: false, error: 'Maximum 1 spouse allowed for ' + fromMember.firstName };

    const toSpouses = toMember.relationsFrom.filter(r => r.type === 'SPOUSE').length +
                      toMember.relationsTo.filter(r => r.type === 'SPOUSE').length;
    if (toSpouses >= 1) return { valid: false, error: 'Maximum 1 spouse allowed for ' + toMember.firstName };

  } else if (type === 'PARENT') {
    if (fromGenOrder !== toGenOrder - 1) {
      return { valid: false, error: 'Parent must belong exactly to the generation immediately above the child.' };
    }

    const existingParents = toMember.relationsTo.filter(r => r.type === 'PARENT').length;
    if (existingParents >= 2) {
      return { valid: false, error: 'Maximum two parents allowed.' };
    }
  }

  return { valid: true };
}

export function wouldCreateConflict(
  memberAId: string, 
  memberBId: string, 
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE',
  members: MemberWithRelations[],
  generations: Generation[],
  memberAGenerationId?: string
): boolean {
  const memberA = members.find(m => m.id === memberAId);
  const memberB = members.find(m => m.id === memberBId);
  if (!memberB) return true;

  const effectiveGenIdA = memberAGenerationId || memberA?.generationId;
  if (!effectiveGenIdA) return true;

  const getGenOrder = (genId: string) => generations.find(g => g.id === genId)?.orderIndex ?? 0;
  
  const genOrderA = getGenOrder(effectiveGenIdA);
  const genOrderB = getGenOrder(memberB.generationId);

  // Map frontend relationType to backend logic
  // 'PARENT': memberB is parent of memberA (memberA is child)
  // 'CHILD': memberA is parent of memberB (memberB is child)
  // 'SPOUSE': memberA and memberB are spouses
  
  // Dummy memberA if it's new
  const safeMemberA = memberA || { 
    id: memberAId, treeId: memberB.treeId, gender: null, firstName: 'New', 
    generationId: effectiveGenIdA, relationsFrom: [], relationsTo: [] 
  } as unknown as MemberWithRelations;

  if (relationType === 'PARENT') {
    return !validateRelationshipCore(memberB, safeMemberA, 'PARENT', genOrderB, genOrderA).valid;
  } else if (relationType === 'CHILD') {
    return !validateRelationshipCore(safeMemberA, memberB, 'PARENT', genOrderA, genOrderB).valid;
  } else {
    return !validateRelationshipCore(safeMemberA, memberB, 'SPOUSE', genOrderA, genOrderB).valid;
  }
}

function getEligibleMembersBase(
  members: MemberWithRelations[],
  generations: Generation[],
  currentMemberId: string | undefined,
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE',
  currentGenerationId?: string
): MemberWithRelations[] {
  const currentMember = currentMemberId ? members.find(m => m.id === currentMemberId) : undefined;
  
  if (currentMember) {
    if (relationType === 'PARENT') {
      const currentParentsCount = currentMember.relationsTo.filter(r => r.type === 'PARENT').length;
      if (currentParentsCount >= 2) return [];
    }
    if (relationType === 'SPOUSE') {
      const currentSpousesCount = currentMember.relationsFrom.filter(r => r.type === 'SPOUSE').length +
                                  currentMember.relationsTo.filter(r => r.type === 'SPOUSE').length;
      if (currentSpousesCount >= 1) return [];
    }
  }

  return members.filter(member => {
    if (currentMemberId && member.id === currentMemberId) return false;
    
    if (currentMember && alreadyRelated(currentMember, member)) {
      return false;
    }
    
    if (wouldCreateConflict(currentMemberId || 'NEW', member.id, relationType, members, generations, currentGenerationId)) {
      return false;
    }

    if (relationType === 'CHILD') {
      const candidateParentsCount = member.relationsTo.filter(r => r.type === 'PARENT').length;
      if (candidateParentsCount >= 2) return false;
    }

    if (relationType === 'SPOUSE') {
      const candidateSpousesCount = member.relationsFrom.filter(r => r.type === 'SPOUSE').length +
                                    member.relationsTo.filter(r => r.type === 'SPOUSE').length;
      if (candidateSpousesCount >= 1) return false;
    }

    return true;
  });
}

export function getEligibleParents(members: MemberWithRelations[], generations: Generation[], currentMemberId: string | undefined, currentGenerationId?: string) {
  return getEligibleMembersBase(members, generations, currentMemberId, 'PARENT', currentGenerationId);
}

export function getEligibleSpouses(
  members: MemberWithRelations[], 
  generations: Generation[], 
  currentMemberId: string | undefined, 
  currentGenerationId?: string,
  currentGender?: string | null
) {
  const currentMember = currentMemberId ? members.find(m => m.id === currentMemberId) : undefined;
  const effectiveGender = currentGender !== undefined ? currentGender : currentMember?.gender;
  
  const eligible = getEligibleMembersBase(members, generations, currentMemberId, 'SPOUSE', currentGenerationId);
  
  return eligible.filter(candidate => isSpouseEligible(effectiveGender, candidate.gender));
}

export function getEligibleChildren(members: MemberWithRelations[], generations: Generation[], currentMemberId: string | undefined, currentGenerationId?: string) {
  return getEligibleMembersBase(members, generations, currentMemberId, 'CHILD', currentGenerationId);
}

