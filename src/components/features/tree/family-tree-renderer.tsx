/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { Node, Edge } from '@xyflow/react';
import { FamilyGraph } from '@/domain/inference/genealogy-engine';
import { safeGraph } from '@/lib/safe-helpers';

export const LEVEL_HEIGHT = 450;
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 300;
export const GAP = 80;

interface FamilyTreeRendererProps {
  familyGraph: FamilyGraph;
  generations: any[]; // The explicit DB generations for lanes
}

export function useFamilyTreeRenderer(
  familyGraph: FamilyGraph,
  generations: any[],
  readOnly = false
) {
  const { nodes, edges } = React.useMemo(() => {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    const safeFamilyGraph = safeGraph(familyGraph);
    const graphNodes = safeFamilyGraph.nodes ?? [];
    const graphEdges = safeFamilyGraph.edges ?? [];

    if (graphNodes.length === 0) {
      return { nodes: rfNodes, edges: rfEdges };
    }

    let minGlobalX = 0;

    // 2. Generate React Flow Nodes for Members
    for (const node of graphNodes) {
      const pos = { x: node.layoutHints?.x || 0, y: node.layoutHints?.y || 0 };

      const isCouple = node.type === 'COUPLE_CONTAINER';
      minGlobalX = Math.min(minGlobalX, pos.x);

      const generation = generations?.find(
        (item) => item.orderIndex === node.generation
      );
      const generationName = generation?.name?.trim() || undefined;

      rfNodes.push({
        id: node.id,
        type: isCouple ? 'coupleContainer' : 'member',
        position: { x: pos.x, y: pos.y },
        data: isCouple
          ? {
              members: node.members,
              generationName,
            }
          : {
              member: node.member,
              label: `${node.member?.firstName} ${node.member?.lastName}`,
              generationName,
            },
      });
    }

    // 3. Generate Generation Lanes
    const engineGenerations = Object.keys(safeFamilyGraph.generations || {})
      .map(Number)
      .sort((a, b) => a - b);

    engineGenerations.forEach((level) => {
      const dbGen = generations?.find((g) => g.orderIndex === level);
      const configuredName = dbGen?.name?.trim();
      
      // Do not render if the name is an old system-generated default
      const isLegacyAuto = configuredName && ['GRANDPARENTS', 'PARENTS', 'CHILDREN', 'GRANDCHILDREN', 'GREAT GRANDPARENTS'].includes(configuredName.toUpperCase());
      
      if (configuredName && !isLegacyAuto) {
        rfNodes.push({
          id: `lane-${level}`,
          type: 'generationLane',
          position: { x: minGlobalX, y: level * LEVEL_HEIGHT - 60 },
          data: {
            label: configuredName,
            generationId: dbGen?.id,
            isEditable: !readOnly,
            width: 200,
            height: 50,
            isEven: false,
          },
          zIndex: -2,
          selectable: false,
          draggable: false,
          focusable: false,
        });
      }
    });

    // 4. Generate Edges
    // Spouse Edges
    const spouseEdges = graphEdges.filter((e) => e.type === 'SPOUSE');
    spouseEdges.forEach((rel) => {
      rfEdges.push({
        id: `e-${rel.source}-${rel.target}-SPOUSE`,
        source: rel.source,
        target: rel.target,
        type: 'relationship',
        sourceHandle: 'spouse',
        targetHandle: 'spouse-target',
        animated: false,
        zIndex: 1,
        data: { type: 'SPOUSE' },
        style: { stroke: 'var(--color-tree-spouse)', strokeWidth: 2 },
      });
    });

    // Parent-Child Edges
    // To support multiple parents correctly and cleanly, we can link directly or use junctions.
    // The previous design used familyJunctions for clean parent->junction->child rendering.
    const parentGroups = new Map<
      string,
      { parents: string[]; children: string[] }
    >();

    // Find all children and their exact parent sets
    for (const node of graphNodes) {
      const parents =
        safeFamilyGraph.derivedRelationships[node.id]?.parents || [];
      if (parents.length > 0) {
        const pKey = parents.slice().sort().join('-');
        if (!parentGroups.has(pKey)) {
          parentGroups.set(pKey, { parents, children: [] });
        }
        parentGroups.get(pKey)!.children.push(node.id);
      }
    }

    parentGroups.forEach(({ parents, children }, pKey) => {
      if (parents.length === 0 || children.length === 0) return;

      // Calculate junction position (center of parents, below them)
      let sumX = 0;
      let maxY = 0;
      parents.forEach((pId) => {
        const pNode = graphNodes.find((n) => n.id === pId);
        const pos = pNode
          ? { x: pNode.layoutHints?.x || 0, y: pNode.layoutHints?.y || 0 }
          : undefined;
        if (pos) {
          const isCouple = pNode?.type === 'COUPLE_CONTAINER';
          const nWidth = isCouple ? NODE_WIDTH * 2 + 80 : NODE_WIDTH;
          sumX += pos.x + nWidth / 2;
          maxY = Math.max(maxY, pos.y);
        }
      });
      const junctionX = sumX / parents.length;
      const junctionY = maxY + NODE_HEIGHT + GAP / 2;
      const junctionId = `junction-${pKey}`;

      rfNodes.push({
        id: junctionId,
        type: 'familyJunction',
        position: { x: junctionX - 6, y: junctionY - 6 },
        data: {},
        draggable: false,
        selectable: false,
        zIndex: 2,
      });

      // Parents to Junction
      parents.forEach((pId) => {
        rfEdges.push({
          id: `e-${pId}-to-${junctionId}`,
          source: pId,
          target: junctionId,
          type: 'relationship',
          sourceHandle: 'parent-source',
          targetHandle: 'junction-target',
          animated: false,
          zIndex: 1,
          data: { type: 'PARENT' },
          style: { stroke: 'var(--color-tree-connector)', strokeWidth: 2 },
        });
      });

      // Junction to Children
      children.forEach((cId) => {
        rfEdges.push({
          id: `e-${junctionId}-to-${cId}`,
          source: junctionId,
          target: cId,
          type: 'relationship',
          sourceHandle: 'junction-source',
          targetHandle: 'child-target',
          animated: false,
          zIndex: 1,
          data: { type: 'PARENT' },
          style: { stroke: 'var(--color-tree-connector)', strokeWidth: 2 },
        });
      });
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [familyGraph, generations, readOnly]);

  return { nodes, edges };
}
