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

  const sortedGens = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);
  const genOrderMap = new Map<string, number>();
  sortedGens.forEach((g, i) => genOrderMap.set(g.id, i));

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

  members.forEach(m => {
    m.relationsFrom.filter(r => r.type === 'SPOUSE').forEach(r => {
      union(m.id, r.toId);
    });
  });

  const familyUnits = new Map<string, string[]>();
  members.forEach(m => {
    const root = find(m.id);
    if (!familyUnits.has(root)) familyUnits.set(root, []);
    familyUnits.get(root)!.push(m.id);
  });

  const memberToFamily = new Map<string, string>();
  const familyToGenOrder = new Map<string, number>();
  
  familyUnits.forEach((familyMembers, root) => {
    familyMembers.forEach(mId => memberToFamily.set(mId, root));
    // Determine family generation based on first member
    const firstMember = members.find(m => m.id === familyMembers[0]);
    if (firstMember) {
      familyToGenOrder.set(root, genOrderMap.get(firstMember.generationId) ?? 0);
    } else {
      familyToGenOrder.set(root, 0);
    }
  });

  // 2. Build Dagre Graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: gap, edgesep: gap, ranksep: LEVEL_HEIGHT / 2 });
  g.setDefaultEdgeLabel(() => ({}));

  familyUnits.forEach((familyMembers, root) => {
    g.setNode(root, { width: familyMembers.length * MEMBER_SPACING, height: NODE_HEIGHT });
  });

  const addedEdges = new Set<string>();
  members.forEach(m => {
    m.relationsFrom.filter(r => r.type === 'PARENT').forEach(r => {
      const fromFamily = memberToFamily.get(m.id);
      const toFamily = memberToFamily.get(r.toId);
      if (fromFamily && toFamily && fromFamily !== toFamily) {
        const edgeKey = `${fromFamily}->${toFamily}`;
        if (!addedEdges.has(edgeKey)) {
          g.setEdge(fromFamily, toFamily);
          addedEdges.add(edgeKey);
        }
      }
    });
  });

  // Execute Dagre layout
  dagre.layout(g);

  // 3. Generation Y Forcing & Collision Prevention
  const familiesByGen = new Map<number, { root: string, x: number, width: number, y: number }[]>();
  
  familyUnits.forEach((_, root) => {
    const gen = familyToGenOrder.get(root) ?? 0;
    const dagreNode = g.node(root);
    if (!familiesByGen.has(gen)) familiesByGen.set(gen, []);
    familiesByGen.get(gen)!.push({
      root,
      x: dagreNode.x,
      width: dagreNode.width,
      y: gen * LEVEL_HEIGHT
    });
  });

  familiesByGen.forEach((families, genIndex) => {
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
    // Update dagre nodes
    families.forEach(f => {
      const dn = g.node(f.root);
      dn.x = f.x;
      dn.y = f.y;
    });
  });

  // 4. Create React Flow Nodes & Edges
  let minGlobalX = Infinity;
  let maxGlobalX = -Infinity;

  familyUnits.forEach((familyMembers, root) => {
    const dagreNode = g.node(root);
    const startX = dagreNode.x - dagreNode.width / 2;
    const yOffset = dagreNode.y;

    const childrenIds = new Set<string>();
    
    familyMembers.forEach((memberId, i) => {
      const member = members.find(m => m.id === memberId)!;
      const genOrder = genOrderMap.get(member.generationId) ?? 0;
      
      member.relationsFrom.filter(r => r.type === 'PARENT').forEach(r => childrenIds.add(r.toId));

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
          calculatedGeneration: genOrder,
        }
      });
    });

    if (childrenIds.size > 0) {
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

  // 5. Generation Lanes
  const laneWidth = Math.max(3000, maxGlobalX - minGlobalX + 1200);
  const laneX = minGlobalX === Infinity ? -1000 : minGlobalX - 600;

  sortedGens.forEach((gen, genIndex) => {
    nodes.push({
      id: `lane-${gen.id}`,
      type: 'generationLane',
      position: { x: laneX, y: genIndex * LEVEL_HEIGHT - 60 },
      data: {
        label: gen.name,
        width: laneWidth,
        height: LEVEL_HEIGHT + 100,
        isEven: genIndex % 2 === 0,
      },
      zIndex: -2,
      selectable: false,
      draggable: false,
      focusable: false,
    });
  });

  // 6. Spouse Edges
  const addedSpouseKeys = new Set<string>();
  members.forEach(member => {
    const addSpouseEdge = (rel: any, fromId: string, toId: string) => {
      if (rel.type !== 'SPOUSE') return;
      const edgeKey = `${fromId}-${toId}-SPOUSE`;
      const reverseKey = `${toId}-${fromId}-SPOUSE`;
      if (addedSpouseKeys.has(edgeKey) || addedSpouseKeys.has(reverseKey)) return;
      addedSpouseKeys.add(edgeKey);

      edges.push({
        id: `e-${edgeKey}`,
        source: fromId,
        target: toId,
        type: 'relationship',
        sourceHandle: 'spouse',
        targetHandle: 'spouse-target',
        animated: false,
        zIndex: 1,
        data: { type: rel.type },
        style: { stroke: '#f43f5e', strokeWidth: 2 },
      });
    };

    member.relationsFrom.forEach(rel => addSpouseEdge(rel, member.id, rel.toId));
    member.relationsTo.forEach(rel => addSpouseEdge(rel, rel.fromId, member.id));
  });

  return { nodes, edges };
}
