import prisma from '@/lib/prisma';
import { RelationshipEngine } from '@/lib/relationship-engine';

export type RepairReport = {
  treeId: string;
  totalMembers: number;
  totalRelationships: number;
  issues: {
    type: 'WARNING' | 'ERROR';
    message: string;
    details: any;
    recommendation: string;
  }[];
};

export async function repairGenealogy(treeId: string): Promise<RepairReport> {
  const members = await prisma.member.findMany({
    where: { treeId },
    include: { generation: true }
  });

  const relationships = await prisma.relationship.findMany({
    where: { from: { treeId } },
    include: {
      from: { include: { generation: true } },
      to: { include: { generation: true } }
    }
  });

  const report: RepairReport = {
    treeId,
    totalMembers: members.length,
    totalRelationships: relationships.length,
    issues: []
  };

  // 1. Find exact duplicate records (same fromId, toId, type)
  const relSet = new Set<string>();
  for (const rel of relationships) {
    const key = `${rel.fromId}-${rel.toId}-${rel.type}`;
    if (relSet.has(key)) {
      report.issues.push({
        type: 'ERROR',
        message: 'Duplicate relationship found.',
        details: rel,
        recommendation: `Delete duplicate relationship record ID: ${rel.id}`
      });
    } else {
      relSet.add(key);
    }
  }

  // 2. Validate Generation Chronology
  for (const rel of relationships) {
    const fromGen = rel.from.generation.orderIndex;
    const toGen = rel.to.generation.orderIndex;

    if (rel.type === 'SPOUSE' || rel.type === 'SIBLING') {
      if (fromGen !== toGen) {
        report.issues.push({
          type: 'ERROR',
          message: `${rel.type === 'SPOUSE' ? 'Spouses' : 'Siblings'} across different generations.`,
          details: { from: rel.from.firstName, to: rel.to.firstName, fromGen, toGen },
          recommendation: `Move ${rel.from.firstName} and ${rel.to.firstName} to the same generation.`
        });
      }
    } else if (rel.type === 'PARENT') {
      if (fromGen !== toGen - 1) {
        report.issues.push({
          type: 'ERROR',
          message: `Parent is not exactly one generation above child.`,
          details: { parent: rel.from.firstName, child: rel.to.firstName, fromGen, toGen },
          recommendation: `Adjust generation of either ${rel.from.firstName} or ${rel.to.firstName} so they are adjacent (Parent above).`
        });
      }
    }
  }

  // 3. Parent Exclusivity
  const childParentsMap: Record<string, string[]> = {};
  for (const rel of relationships) {
    if (rel.type === 'PARENT') {
      if (!childParentsMap[rel.toId]) childParentsMap[rel.toId] = [];
      childParentsMap[rel.toId].push(rel.fromId);
    }
  }

  for (const [childId, parentIds] of Object.entries(childParentsMap)) {
    if (parentIds.length > 2) {
      const child = members.find(m => m.id === childId);
      report.issues.push({
        type: 'ERROR',
        message: 'Member has more than 2 parents.',
        details: { child: child?.firstName, parentCount: parentIds.length },
        recommendation: `Remove extra parents for ${child?.firstName} to adhere to biological limit of 2.`
      });
    }
  }

  // 4. Spouse Exclusivity
  const spouseMap: Record<string, string[]> = {};
  for (const rel of relationships) {
    if (rel.type === 'SPOUSE') {
      if (!spouseMap[rel.fromId]) spouseMap[rel.fromId] = [];
      spouseMap[rel.fromId].push(rel.toId);
      
      if (!spouseMap[rel.toId]) spouseMap[rel.toId] = [];
      spouseMap[rel.toId].push(rel.fromId);
    }
  }

  for (const [memberId, spouses] of Object.entries(spouseMap)) {
    // Unique spouses
    const uniqueSpouses = Array.from(new Set(spouses));
    if (uniqueSpouses.length > 1) {
      const member = members.find(m => m.id === memberId);
      report.issues.push({
        type: 'WARNING',
        message: 'Member has multiple spouses active simultaneously.',
        details: { member: member?.firstName, spouseCount: uniqueSpouses.length },
        recommendation: `Ensure ${member?.firstName} only has 1 primary active spouse or resolve conflicts.`
      });
    }
  }

  // 5. Unnecessary Sibling Links (since we now infer them)
  const inferredRelationshipsMap = new Map<string, string[]>();
  // To avoid fully testing inference, we just flag existing SIBLING records as warnings for clean up
  const explicitSiblings = relationships.filter(r => r.type === 'SIBLING');
  if (explicitSiblings.length > 0) {
    report.issues.push({
      type: 'WARNING',
      message: 'Explicit Sibling records exist.',
      details: { count: explicitSiblings.length },
      recommendation: `Consider deleting the ${explicitSiblings.length} explicit SIBLING records. The Genealogy Engine now dynamically infers siblings based on shared parents.`
    });
  }

  return report;
}
