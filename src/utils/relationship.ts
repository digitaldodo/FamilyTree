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
                   
  return isParent || isChild || isSpouse;
}

export function wouldCreateConflict(
  memberAId: string, 
  memberBId: string, 
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE',
  members: MemberWithRelations[],
  generations: Generation[],
  memberAGenerationId?: string
): boolean {
  const getGenerationOrder = (genId: string) => {
    const gen = generations.find(g => g.id === genId);
    return gen ? gen.orderIndex : 0;
  };

  const memberA = members.find(m => m.id === memberAId);
  const memberB = members.find(m => m.id === memberBId);
  if (!memberB) return true;

  const effectiveGenIdA = memberAGenerationId || memberA?.generationId;
  if (!effectiveGenIdA) return true;

  const genOrderA = getGenerationOrder(effectiveGenIdA);
  const genOrderB = getGenerationOrder(memberB.generationId);

  if (relationType === 'PARENT') {
    if (genOrderB !== genOrderA - 1) return true;
  } else if (relationType === 'CHILD') {
    if (genOrderB !== genOrderA + 1) return true;
  } else if (relationType === 'SPOUSE') {
    if (genOrderB !== genOrderA) return true;
  }

  return false;
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

export function isSpouseEligible(genderA?: string | null, genderB?: string | null): boolean {
  if (genderA === 'MALE' && genderB !== 'FEMALE') return false;
  if (genderA === 'FEMALE' && genderB !== 'MALE') return false;
  if (genderB === 'MALE' && genderA !== 'FEMALE') return false;
  if (genderB === 'FEMALE' && genderA !== 'MALE') return false;
  return true;
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
