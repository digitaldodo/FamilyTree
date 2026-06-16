import { useState, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { useMembers } from './use-members';
import { MemberWithRelations } from '@/types/member';
import { calculateGenerations } from '@/utils/generation';

const LEVEL_HEIGHT = 150;
const NODE_WIDTH = 250;

export function useFamilyTree(treeId?: string) {
  const { members, isLoading, error: fetchError } = useMembers(treeId);
  const [error, setError] = useState<string | null>(null);

  // Transform members into React Flow Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    if (members.length === 0) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    // Calculate dynamic generations via BFS
    const generationMap = calculateGenerations(members);

    // Group members by calculated generation for auto-layout
    const gens = new Map<number, MemberWithRelations[]>();
    members.forEach(m => {
      const g = generationMap.get(m.id) ?? 0;
      if (!gens.has(g)) gens.set(g, []);
      gens.get(g)?.push(m);
    });

    // Sort generation keys for consistent ordering
    const sortedGens = Array.from(gens.keys()).sort((a, b) => a - b);

    // Create Nodes
    sortedGens.forEach((genIndex) => {
      const genMembers = gens.get(genIndex) || [];
      genMembers.forEach((member, i) => {
        // Simple horizontal layout calculation
        const xOffset = (i - genMembers.length / 2) * NODE_WIDTH * 1.5;
        const yOffset = genIndex * LEVEL_HEIGHT * 2;

        nodes.push({
          id: member.id,
          type: 'member',
          position: { x: xOffset, y: yOffset },
          data: {
            member,
            label: `${member.firstName} ${member.lastName}`,
            calculatedGeneration: genIndex,
          }
        });

        // Create Edges from this member
        member.relationsFrom.forEach(rel => {
          const edgeId = `e-${member.id}-${rel.toId}-${rel.type}`;
          
          let edgeColor = '#94a3b8'; // Default slate
          let animated = false;

          if (rel.type === 'SPOUSE') {
            edgeColor = '#f43f5e'; // Rose for spouse
          } else if (rel.type === 'PARENT') {
            edgeColor = '#6366f1'; // Indigo for child
            animated = true;
          }

          edges.push({
            id: edgeId,
            source: member.id,
            target: rel.toId,
            type: 'relationship',
            animated,
            data: { type: rel.type },
            style: { stroke: edgeColor, strokeWidth: 2 },
            markerEnd: rel.type === 'PARENT' ? {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            } : undefined,
          });
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [members]);

  return {
    members,
    initialNodes,
    initialEdges,
    isLoading,
    error: fetchError || error,
  };
}
