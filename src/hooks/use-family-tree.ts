import { useState, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import dagre from 'dagre';
import { useMembers } from './use-members';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';

const LEVEL_HEIGHT = 150;
const NODE_WIDTH = 250;

export function useFamilyTree(treeId?: string) {
  const { members, isLoading, error: fetchError } = useMembers(treeId);
  const [error, setError] = useState<string | null>(null);

  const generations = useAppStore(s => s.generations);

  // Transform members into React Flow Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    if (members.length === 0) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    const sortedGens = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

    // Group spouses into "Family Units" using Union-Find
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
    familyUnits.forEach((familyMembers, root) => {
      familyMembers.forEach(m => memberToFamily.set(m, root));
    });

    // Create Dagre Graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 100, edgesep: 50, ranksep: LEVEL_HEIGHT * 2 });
    g.setDefaultEdgeLabel(() => ({}));

    const MEMBER_SPACING = NODE_WIDTH + 40;

    // Add nodes to Dagre
    familyUnits.forEach((familyMembers, root) => {
      g.setNode(root, { width: familyMembers.length * MEMBER_SPACING, height: LEVEL_HEIGHT });
    });

    // Add edges to Dagre (PARENT relationships)
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

    // Compute layout
    dagre.layout(g);

    const genOrderMap = new Map<string, number>();
    sortedGens.forEach((g, i) => genOrderMap.set(g.id, i));

    let minX = Infinity;

    // Create React Flow Nodes (Members)
    familyUnits.forEach((familyMembers, root) => {
      const dagreNode = g.node(root);
      const startX = dagreNode.x - dagreNode.width / 2;

      familyMembers.forEach((memberId, i) => {
        const member = members.find(m => m.id === memberId)!;
        const genOrder = genOrderMap.get(member.generationId) ?? 0;
        
        // Dagre computes X. We force Y based on user-defined generation.
        const xOffset = startX + i * MEMBER_SPACING + MEMBER_SPACING / 2 - NODE_WIDTH / 2;
        const yOffset = genOrder * LEVEL_HEIGHT * 2.5; // Spread vertically slightly more

        minX = Math.min(minX, xOffset);

        nodes.push({
          id: member.id,
          type: 'member',
          position: { x: xOffset, y: yOffset },
          data: {
            member,
            label: `${member.firstName} ${member.lastName}`,
            calculatedGeneration: genOrder,
          }
        });
      });
    });

    // Add lightweight Generation Labels at the far left
    sortedGens.forEach((gen, genIndex) => {
      nodes.push({
        id: `lane-${gen.id}`,
        type: 'generationLane',
        position: { x: minX === Infinity ? 0 : minX - 350, y: genIndex * LEVEL_HEIGHT * 2.5 },
        data: {
          label: gen.name,
          width: 250,
          height: LEVEL_HEIGHT,
          isEven: false,
        },
        zIndex: -1,
        selectable: false,
        draggable: false,
        focusable: false,
      });
    });

    // Create React Flow Edges
    const addedEdgeKeys = new Set<string>();

    members.forEach(member => {
      // Process relationships where member is the 'from' node
      member.relationsFrom.forEach(rel => {
        const edgeKey = `${member.id}-${rel.toId}-${rel.type}`;
        if (addedEdgeKeys.has(edgeKey)) return;
        addedEdgeKeys.add(edgeKey);

        const edgeId = `e-${edgeKey}`;
        
        let edgeColor = '#94a3b8'; // Default slate
        let animated = false;
        let sourceHandle: string | undefined = undefined;
        let targetHandle: string | undefined = undefined;
        let zIndex = 0;

        if (rel.type === 'SPOUSE') {
          edgeColor = '#f43f5e'; // Rose for spouse
          sourceHandle = 'spouse';
          targetHandle = 'spouse-target';
          zIndex = 1;
        } else if (rel.type === 'PARENT') {
          edgeColor = '#6366f1'; // Indigo for child
          animated = true;
          sourceHandle = 'parent-source';
          targetHandle = 'child-target';
          zIndex = 0;
        } else if (rel.type === 'SIBLING') {
          edgeColor = '#10b981'; // Emerald for sibling
          sourceHandle = 'spouse'; // Reuse lateral handles for siblings for now
          targetHandle = 'spouse-target';
          zIndex = 1;
        }

        edges.push({
          id: edgeId,
          source: member.id,
          target: rel.toId,
          type: 'relationship',
          sourceHandle,
          targetHandle,
          animated,
          zIndex,
          data: { type: rel.type },
          style: { stroke: edgeColor, strokeWidth: 2 },
          markerEnd: rel.type === 'PARENT' ? {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          } : undefined,
        });
      });

      // Process relationships where member is the 'to' node
      member.relationsTo.forEach(rel => {
        const edgeKey = `${rel.fromId}-${member.id}-${rel.type}`;
        if (addedEdgeKeys.has(edgeKey)) return;
        addedEdgeKeys.add(edgeKey);

        const edgeId = `e-${edgeKey}`;
        
        let edgeColor = '#94a3b8'; // Default slate
        let animated = false;
        let sourceHandle: string | undefined = undefined;
        let targetHandle: string | undefined = undefined;
        let zIndex = 0;

        if (rel.type === 'SPOUSE') {
          edgeColor = '#f43f5e'; // Rose for spouse
          sourceHandle = 'spouse';
          targetHandle = 'spouse-target';
          zIndex = 1;
        } else if (rel.type === 'PARENT') {
          edgeColor = '#6366f1'; // Indigo for child
          animated = true;
          sourceHandle = 'parent-source';
          targetHandle = 'child-target';
          zIndex = 0;
        } else if (rel.type === 'SIBLING') {
          edgeColor = '#10b981'; // Emerald for sibling
          sourceHandle = 'spouse'; // Reuse lateral handles for siblings for now
          targetHandle = 'spouse-target';
          zIndex = 1;
        }

        edges.push({
          id: edgeId,
          source: rel.fromId,
          target: member.id,
          type: 'relationship',
          sourceHandle,
          targetHandle,
          animated,
          zIndex,
          data: { type: rel.type },
          style: { stroke: edgeColor, strokeWidth: 2 },
          markerEnd: rel.type === 'PARENT' ? {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          } : undefined,
        });
      });
    });

    console.log('[Tree Diagnostics] Nodes:', nodes.length, 'Edges:', edges.length, 'Generations:', sortedGens.map(g => g.name));

    return { initialNodes: nodes, initialEdges: edges };
  }, [members, generations]);

  return {
    members,
    initialNodes,
    initialEdges,
    isLoading,
    error: fetchError || error,
  };
}
