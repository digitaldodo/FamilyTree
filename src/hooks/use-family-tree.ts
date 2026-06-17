import { useState, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { useMembers } from './use-members';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';

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

    // Use generation from store
    const { generations } = useAppStore.getState();
    const sortedGens = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);

    // Group members by their generationId
    const gens = new Map<string, MemberWithRelations[]>();
    sortedGens.forEach(g => gens.set(g.id, []));

    members.forEach(m => {
      if (m.generationId) {
        if (!gens.has(m.generationId)) gens.set(m.generationId, []);
        gens.get(m.generationId)?.push(m);
      }
    });

    // Create Nodes
    sortedGens.forEach((gen, genIndex) => {
      const genMembers = gens.get(gen.id) || [];
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
