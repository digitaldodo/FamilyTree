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
                   
  const isDirectSibling = memberA.relationsFrom.some(r => r.toId === memberB.id && r.type === 'SIBLING') ||
                          memberA.relationsTo.some(r => r.fromId === memberB.id && r.type === 'SIBLING');
                          
  const memberAParents = memberA.relationsTo.filter(r => r.type === 'PARENT').map(r => r.fromId);
  const memberBParents = memberB.relationsTo.filter(r => r.type === 'PARENT').map(r => r.fromId);
  const isDerivedSibling = memberAParents.length > 0 && memberAParents.some(p => memberBParents.includes(p));
  
  const isSibling = isDirectSibling || isDerivedSibling;

  return isParent || isChild || isSpouse || isSibling;
}

export function wouldCreateConflict(
  memberAId: string, 
  memberBId: string, 
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING',
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
  } else if (relationType === 'SIBLING' || relationType === 'SPOUSE') {
    if (genOrderB !== genOrderA) return true;
  }

  return false;
}

function getEligibleMembersBase(
  members: MemberWithRelations[],
  generations: Generation[],
  currentMemberId: string | undefined,
  relationType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING',
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

export function getEligibleSiblings(members: MemberWithRelations[], generations: Generation[], currentMemberId: string | undefined, currentGenerationId?: string) {
  return getEligibleMembersBase(members, generations, currentMemberId, 'SIBLING', currentGenerationId);
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
