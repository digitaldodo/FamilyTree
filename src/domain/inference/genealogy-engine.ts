import { MemberWithRelations } from '@/types/member';

/**
 * Pure functions to derive family structures from raw database relationships.
 */
export const GenealogyEngine = {
  /**
   * Derive siblings based on shared parents.
   * Returns an array of sibling MemberWithRelations.
   */
  inferSiblings(member: MemberWithRelations, allMembers: MemberWithRelations[]): MemberWithRelations[] {
    const parentIds = member.relationsTo
      .filter((r) => r.type === 'PARENT')
      .map((r) => r.fromId);

    if (parentIds.length === 0) return [];

    return allMembers.filter((m) => {
      if (m.id === member.id) return false;
      const mParentIds = m.relationsTo
        .filter((r) => r.type === 'PARENT')
        .map((r) => r.fromId);
      
      // If they share at least one parent, they are siblings/half-siblings.
      return mParentIds.some((pId) => parentIds.includes(pId));
    });
  },

  /**
   * Derive parents for a member.
   * (Directly mapped from raw PARENT relation)
   */
  inferParents(member: MemberWithRelations, allMembers: MemberWithRelations[]): MemberWithRelations[] {
    const parentIds = member.relationsTo
      .filter((r) => r.type === 'PARENT')
      .map((r) => r.fromId);
    
    return allMembers.filter((m) => parentIds.includes(m.id));
  },

  /**
   * Derive children for a member.
   * (Inverse of PARENT relation)
   */
  inferChildren(member: MemberWithRelations, allMembers: MemberWithRelations[]): MemberWithRelations[] {
    const childIds = member.relationsFrom
      .filter((r) => r.type === 'PARENT')
      .map((r) => r.toId);
    
    return allMembers.filter((m) => childIds.includes(m.id));
  },

  /**
   * Derive spouses for a member.
   * (Directly mapped from SPOUSE relation, bidirectional)
   */
  inferSpouse(member: MemberWithRelations, allMembers: MemberWithRelations[]): MemberWithRelations[] {
    const spouseIds = [
      ...member.relationsFrom.filter((r) => r.type === 'SPOUSE').map((r) => r.toId),
      ...member.relationsTo.filter((r) => r.type === 'SPOUSE').map((r) => r.fromId),
    ];
    
    return allMembers.filter((m) => spouseIds.includes(m.id));
  },

  /**
   * Build a fully connected Family Graph, enriching each member with derived relationships.
   */
  buildFamilyGraph(members: MemberWithRelations[]): MemberWithRelations[] {
    return members.map((member) => {
      const clonedMember = { ...member };
      
      // Derive missing relationships dynamically.
      const siblings = this.inferSiblings(member, members);
      
      // Reconstruct relationsFrom and relationsTo arrays to inject SIBLING types for the UI
      const newRelationsFrom = [...(clonedMember.relationsFrom || [])];
      const newRelationsTo = [...(clonedMember.relationsTo || [])];

      // Remove any existing SIBLING relationships (in case of legacy data)
      const filterSibling = (r: any) => r.type !== 'SIBLING';
      const cleanRelationsFrom = newRelationsFrom.filter(filterSibling);
      const cleanRelationsTo = newRelationsTo.filter(filterSibling);

      // Inject dynamically computed siblings
      siblings.forEach((sibling) => {
        cleanRelationsFrom.push({
          id: `derived-sib-${member.id}-${sibling.id}`,
          type: 'SIBLING',
          fromId: member.id,
          toId: sibling.id,
          createdAt: new Date().toISOString(),
        });
        cleanRelationsTo.push({
          id: `derived-sib-${sibling.id}-${member.id}`,
          type: 'SIBLING',
          fromId: sibling.id,
          toId: member.id,
          createdAt: new Date().toISOString(),
        });
      });

      clonedMember.relationsFrom = cleanRelationsFrom;
      clonedMember.relationsTo = cleanRelationsTo;
      
      return clonedMember;
    });
  }
};
