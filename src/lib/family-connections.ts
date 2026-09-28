import { MemberWithRelations } from '@/types/member';
import { canonicalizePersistedRelationship } from './relationship-canonical';

export function deriveFamilyConnections(member: MemberWithRelations, allMembers: MemberWithRelations[]) {
  const safeMembersForFind = Array.isArray(allMembers) ? allMembers : [];
  
  const parentIds = new Set<string>();
  const childIds = new Set<string>();
  const spouseIds = new Set<string>();

  const processRel = (r: any) => {
    const canonical = canonicalizePersistedRelationship(r);
    if (canonical.type === 'SPOUSE') {
      const otherId = canonical.fromId === member.id ? canonical.toId : canonical.fromId;
      if (otherId && otherId !== member.id) spouseIds.add(otherId);
    } else if (canonical.type === 'PARENT') {
      if (canonical.toId === member.id) {
        parentIds.add(canonical.fromId);
      } else if (canonical.fromId === member.id) {
        childIds.add(canonical.toId);
      }
    }
  };

  member.relationsFrom?.forEach(processRel);
  member.relationsTo?.forEach(processRel);

  const siblingIds = new Set<string>();
  
  if (parentIds.size > 0) {
    safeMembersForFind.forEach(m => {
      if (m.id === member.id) return;
      
      let sharesParent = false;
      const processSiblingRel = (r: any) => {
        const canonical = canonicalizePersistedRelationship(r);
        if (canonical.type === 'PARENT' && canonical.toId === m.id) {
          if (parentIds.has(canonical.fromId)) {
            sharesParent = true;
          }
        }
      };

      m.relationsFrom?.forEach(processSiblingRel);
      m.relationsTo?.forEach(processSiblingRel);

      if (sharesParent) siblingIds.add(m.id);
    });
  }

  const grandparentIds = new Set<string>();
  Array.from(parentIds).forEach(pid => {
    const p = safeMembersForFind.find(m => m.id === pid);
    if (p) {
      const processGPRel = (r: any) => {
        const canonical = canonicalizePersistedRelationship(r);
        if (canonical.type === 'PARENT' && canonical.toId === pid) {
          grandparentIds.add(canonical.fromId);
        }
      };
      p.relationsFrom?.forEach(processGPRel);
      p.relationsTo?.forEach(processGPRel);
    }
  });

  const grandchildIds = new Set<string>();
  Array.from(childIds).forEach(cid => {
    const c = safeMembersForFind.find(m => m.id === cid);
    if (c) {
      const processGCRel = (r: any) => {
        const canonical = canonicalizePersistedRelationship(r);
        if (canonical.type === 'PARENT' && canonical.fromId === cid) {
          grandchildIds.add(canonical.toId);
        }
      };
      c.relationsFrom?.forEach(processGCRel);
      c.relationsTo?.forEach(processGCRel);
    }
  });

  return {
    parents: Array.from(parentIds),
    children: Array.from(childIds),
    spouses: Array.from(spouseIds),
    siblings: Array.from(siblingIds),
    grandparents: Array.from(grandparentIds),
    grandchildren: Array.from(grandchildIds),
  };
}
