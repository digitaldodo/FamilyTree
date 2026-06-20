import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';
import { FamilyGraph } from '@/domain/inference/genealogy-engine';

export const LEVEL_HEIGHT = 450;
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 300;

export function generateTreeLayout(
  graph: FamilyGraph,
  generations: any[],
  isMobile: boolean = false
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  if (!graph || graph.nodes.length === 0) {
    return { nodes, edges };
  }

  const gap = isMobile ? 40 : 80;
  const MEMBER_SPACING = NODE_WIDTH + gap;

  // 1. Group spouses & siblings using Union-Find on graph edges
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

  graph.edges.filter(e => e.type === 'SPOUSE' || e.type === 'SIBLING').forEach(e => {
    union(e.source, e.target);
  });

  const familyUnits = new Map<string, string[]>();
  graph.nodes.forEach(n => {
    const root = find(n.id);
    if (!familyUnits.has(root)) familyUnits.set(root, []);
    familyUnits.get(root)!.push(n.id);
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

  graph.edges.filter(e => e.type === 'PARENT').forEach(e => {
    const fromFamily = memberToFamily.get(e.source);
    const toFamily = memberToFamily.get(e.target);
    if (fromFamily && toFamily && fromFamily !== toFamily) {
      if (!familyAdjacency.get(fromFamily)!.includes(toFamily)) {
        familyAdjacency.get(fromFamily)!.push(toFamily);
      }
    }
  });

  // Level calc using generation orderIndex or computed from graph
  const safeGenerations1 = Array.isArray(generations) ? generations : [];
  familyUnits.forEach((familyMembers, root) => {
    const memberId = familyMembers[0];
    const graphNode = graph.nodes.find(m => m.id === memberId);
    let level = graphNode ? graphNode.generation : 0;
    
    // We can fallback to explicit generation index if available
    if (graphNode && graphNode.member.generationId) {
      const gen = safeGenerations1.find(g => g.id === graphNode.member.generationId);
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

    const childrenIds = Array.from(new Set(
      familyMembers.flatMap(memberId => graph.derivedRelationships[memberId].children)
    ));

    familyMembers.forEach((memberId, i) => {
      const graphNode = graph.nodes.find(n => n.id === memberId)!;
      const member = graphNode.member;

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
  const spouseEdges = graph.edges.filter(e => e.type === 'SPOUSE');

  spouseEdges.forEach(rel => {
    const edgeKey = `${rel.source}-${rel.target}-SPOUSE`;
    edges.push({
      id: `e-${edgeKey}`,
      source: rel.source,
      target: rel.target,
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
