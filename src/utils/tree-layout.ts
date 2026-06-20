import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';
import { MemberWithRelations } from '@/types/member';

export const LEVEL_HEIGHT = 450;
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 300;

export function generateTreeLayout(
  members: MemberWithRelations[],
  generations: any[],
  isMobile: boolean = false
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  if (members.length === 0) {
    return { nodes, edges };
  }

  const gap = isMobile ? 40 : 80;
  const MEMBER_SPACING = NODE_WIDTH + gap;

  // 1. Group spouses using Union-Find
  const parentMap = new Map<string, string>();
  const find = (i: string): string => {
    if (parentMap.get(i) === undefined) parentMap.set(i, i);
    if (parentMap.get(i) === i) return i;
    const p = find(parentMap.get(i)!);
    parentMap.set(i, p);
    return p;
  };
  const union = (i: string, j: string) => {
    parentMap.set(find(i), find(j));
  };

  const safeMembers1 = Array.isArray(members) ? members : [];
  safeMembers1.forEach(m => {
    const safeFrom = Array.isArray(m.relationsFrom) ? m.relationsFrom : [];
    safeFrom.filter(r => r.type === 'SPOUSE' || r.type === 'SIBLING').forEach(r => {
      union(m.id, r.toId);
    });
  });

  const familyUnits = new Map<string, string[]>();
  const safeMembers2 = Array.isArray(members) ? members : [];
  safeMembers2.forEach(m => {
    const root = find(m.id);
    if (!familyUnits.has(root)) familyUnits.set(root, []);
    familyUnits.get(root)!.push(m.id);
  });

  const memberToFamily = new Map<string, string>();
  familyUnits.forEach((familyMembers, root) => {
    familyMembers.forEach(mId => memberToFamily.set(mId, root));
  });

  // 2. Build Hierarchy & Calculate Levels explicitly
  const familyLevels = new Map<string, number>();
  const familyAdjacency = new Map<string, string[]>(); // parent -> children
  
  familyUnits.forEach((_, root) => {
    familyAdjacency.set(root, []);
  });

  const safeMembers3 = Array.isArray(members) ? members : [];
  safeMembers3.forEach(m => {
    const safeFrom = Array.isArray(m.relationsFrom) ? m.relationsFrom : [];
    safeFrom.filter(r => r.type === 'PARENT').forEach(r => {
      const fromFamily = memberToFamily.get(m.id);
      const toFamily = memberToFamily.get(r.toId);
      if (fromFamily && toFamily && fromFamily !== toFamily) {
        if (!familyAdjacency.get(fromFamily)!.includes(toFamily)) {
          familyAdjacency.get(fromFamily)!.push(toFamily);
        }
      }
    });
  });

  // Level calc using generation orderIndex
  const safeGenerations1 = Array.isArray(generations) ? generations : [];
  familyUnits.forEach((familyMembers, root) => {
    const memberId = familyMembers[0];
    const member = members.find(m => m.id === memberId);
    let level = 0;
    if (member && member.generationId) {
      const gen = safeGenerations1.find(g => g.id === member.generationId);
      if (gen) {
        level = gen.orderIndex;
      }
    }
    familyLevels.set(root, level);
  });

  // 3. Build Dagre Graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: gap, edgesep: gap, ranksep: LEVEL_HEIGHT / 2 });
  g.setDefaultEdgeLabel(() => ({}));

  familyUnits.forEach((familyMembers, root) => {
    g.setNode(root, { width: familyMembers.length * MEMBER_SPACING, height: NODE_HEIGHT });
  });

  const uniqueEdges = Array.from(familyAdjacency.entries()).flatMap(([parent, children]) => 
    children.map(child => ({ parent, child, edgeKey: `${parent}->${child}` }))
  ).filter((edge, index, self) => 
    index === self.findIndex((e) => e.edgeKey === edge.edgeKey)
  );

  uniqueEdges.forEach(({ parent, child }) => {
    const pLevel = familyLevels.get(parent) ?? 0;
    const cLevel = familyLevels.get(child) ?? 0;
    const minlen = Math.max(1, cLevel - pLevel);
    g.setEdge(parent, child, { minlen });
  });

  // Execute Dagre layout
  dagre.layout(g);

  // Diagnostics & Verification
  const safeGenerations2 = Array.isArray(generations) ? generations : [];
  console.log('--- LAYOUT DIAGNOSTICS ---');
  console.log(`Generations count: ${safeGenerations2.length}`);
  console.log(`Generation names: ${safeGenerations2.map(g => g.name).join(', ')}`);
  console.log(`Generation orders: ${safeGenerations2.map(g => `${g.name} -> ${g.orderIndex}`).join(', ')}`);
  
  const membersPerGen = new Map<string, number>();
  const safeMembers4 = Array.isArray(members) ? members : [];
  safeMembers4.forEach(m => {
    const gen = safeGenerations2.find(g => g.id === m.generationId);
    const genName = gen ? gen.name : 'Unknown';
    membersPerGen.set(genName, (membersPerGen.get(genName) || 0) + 1);
  });
  console.log('Members per generation:');
  membersPerGen.forEach((count, name) => console.log(`  ${name} -> ${count} members`));

  safeGenerations2.forEach(g => {
    if (!g.name) console.error(`VERIFICATION FAILED: Generation ${g.id} has no name`);
  });

  familyLevels.forEach((level, root) => {
    const membersList = familyUnits.get(root)!.map(id => members.find(m => m.id === id)!.firstName).join(', ');
    const dagreNode = g.node(root);
    console.log(`Family [${membersList}]: Computed Level = ${level}, Dagre Y = ${dagreNode?.y}`);
  });

  familyAdjacency.forEach((children, parent) => {
    const parentLevel = familyLevels.get(parent)!;
    children.forEach(child => {
      const childLevel = familyLevels.get(child)!;
      if (childLevel <= parentLevel) {
        console.error(`VERIFICATION FAILED: Child family is on level ${childLevel}, but parent is on level ${parentLevel}`);
      } else {
        console.log(`Verified edge: Parent(L${parentLevel}) -> Child(L${childLevel})`);
      }
    });
  });

  // 4. Collision Prevention per Level
  const familiesByLevel = new Map<number, { root: string, x: number, width: number, y: number }[]>();
  
  familyUnits.forEach((_, root) => {
    const level = familyLevels.get(root) ?? 0;
    const dagreNode = g.node(root);
    if (!familiesByLevel.has(level)) familiesByLevel.set(level, []);
    familiesByLevel.get(level)!.push({
      root,
      x: dagreNode.x,
      width: dagreNode.width,
      y: level * LEVEL_HEIGHT // Force strictly to computed level
    });
  });

  familiesByLevel.forEach((families, level) => {
    // Sort by dagre-assigned X
    families.sort((a, b) => a.x - b.x);
    // Push apart overlaps
    for (let i = 1; i < families.length; i++) {
      const prev = families[i - 1];
      const curr = families[i];
      const minX = prev.x + prev.width / 2 + gap + curr.width / 2;
      if (curr.x < minX) {
        curr.x = minX;
      }
    }
    // Update dagre nodes strictly to level computed Y
    families.forEach(f => {
      const dn = g.node(f.root);
      dn.x = f.x;
      dn.y = level * LEVEL_HEIGHT; // Strictly enforce vertical hierarchy
    });
  });

  // 5. Create React Flow Nodes & Edges
  let minGlobalX = Infinity;
  let maxGlobalX = -Infinity;

  familyUnits.forEach((familyMembers, root) => {
    const dagreNode = g.node(root);
    const startX = dagreNode.x - dagreNode.width / 2;
    const yOffset = dagreNode.y;

    const safeMembers5 = Array.isArray(members) ? members : [];
    
    // Compute unique children for this family unit using pure arrays
    const childrenIds = Array.from(new Set(
      familyMembers.flatMap(memberId => {
        const member = safeMembers5.find(m => m.id === memberId);
        if (!member) return [];
        const safeFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
        return safeFrom.filter(r => r.type === 'PARENT').map(r => r.toId);
      })
    ));

    familyMembers.forEach((memberId, i) => {
      const member = safeMembers5.find(m => m.id === memberId)!;

      const xOffset = startX + i * MEMBER_SPACING + gap / 2 + NODE_WIDTH / 2; // Center inside allocated space
      const actualX = xOffset - NODE_WIDTH / 2; // Flow expects top-left
      
      minGlobalX = Math.min(minGlobalX, actualX);
      maxGlobalX = Math.max(maxGlobalX, actualX + NODE_WIDTH);

      nodes.push({
        id: member.id,
        type: 'member',
        position: { x: actualX, y: yOffset },
        data: {
          member,
          label: `${member.firstName} ${member.lastName}`,
        }
      });
    });

    if (childrenIds.length > 0) {
      const junctionId = `junction-${root}`;
      const junctionX = dagreNode.x; // Center of family unit
      const junctionY = yOffset + NODE_HEIGHT + (gap / 2); // Below parents

      nodes.push({
        id: junctionId,
        type: 'familyJunction',
        position: { x: junctionX - 6, y: junctionY - 6 },
        data: {},
        draggable: false,
        selectable: false,
        zIndex: 0,
      });

      familyMembers.forEach(mId => {
        edges.push({
          id: `e-${mId}-to-${junctionId}`,
          source: mId,
          target: junctionId,
          type: 'relationship',
          sourceHandle: 'parent-source',
          targetHandle: 'junction-target',
          animated: false,
          zIndex: 0,
          data: { type: 'PARENT' },
          style: { stroke: '#6366f1', strokeWidth: 2 },
        });
      });

      childrenIds.forEach(childId => {
        edges.push({
          id: `e-${junctionId}-to-${childId}`,
          source: junctionId,
          target: childId,
          type: 'relationship',
          sourceHandle: 'junction-source',
          targetHandle: 'child-target',
          animated: false,
          zIndex: 0,
          data: { type: 'PARENT' },
          style: { stroke: '#6366f1', strokeWidth: 2 },
        });
      });
    }
  });

  // 6. Generation Lanes
  const laneWidth = Math.max(3000, maxGlobalX - minGlobalX + 1200);
  const laneX = minGlobalX === Infinity ? -1000 : minGlobalX - 600;

  // We rely strictly on the passed generations array as the source of truth
  const safeGenerations3 = Array.isArray(generations) ? generations : [];
  safeGenerations3.forEach(gen => {
    const level = gen.orderIndex;
    
    nodes.push({
      id: `lane-level-${level}`,
      type: 'generationLane',
      position: { x: laneX, y: level * LEVEL_HEIGHT - 60 },
      data: {
        label: gen.name && gen.name.trim() !== '' ? gen.name : 'Unnamed Generation',
        width: laneWidth,
        height: LEVEL_HEIGHT + 100,
        isEven: level % 2 === 0,
      },
      zIndex: -2,
      selectable: false,
      draggable: false,
      focusable: false,
    });
  });

  // 7. Spouse Edges (Pure array processing)
  const spouseEdges = Array.isArray(members) ? members.flatMap(member => {
    const safeFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
    const safeTo = Array.isArray(member.relationsTo) ? member.relationsTo : [];
    return [
      ...safeFrom.filter(r => r.type === 'SPOUSE').map(r => ({ fromId: member.id, toId: r.toId, type: r.type })),
      ...safeTo.filter(r => r.type === 'SPOUSE').map(r => ({ fromId: r.fromId, toId: member.id, type: r.type }))
    ];
  }) : [];

  // Remove duplicate undirected spouse edges
  const uniqueSpouseEdges = spouseEdges.filter((rel, index, self) => {
    const [a, b] = [rel.fromId, rel.toId].sort();
    return index === self.findIndex((r) => {
      const [rA, rB] = [r.fromId, r.toId].sort();
      return a === rA && b === rB;
    });
  });

  uniqueSpouseEdges.forEach(rel => {
    const edgeKey = `${rel.fromId}-${rel.toId}-SPOUSE`;
    edges.push({
      id: `e-${edgeKey}`,
      source: rel.fromId,
      target: rel.toId,
      type: 'relationship',
      sourceHandle: 'spouse',
      targetHandle: 'spouse-target',
      animated: false,
      zIndex: 1,
      data: { type: rel.type },
      style: { stroke: '#f43f5e', strokeWidth: 2 },
    });
  });

  return { nodes, edges };
}
