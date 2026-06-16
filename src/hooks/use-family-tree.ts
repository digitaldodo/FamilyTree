import { useState, useEffect, useCallback, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';

// Using types that match the Prisma schema conceptually
type Gender = 'MALE' | 'FEMALE' | 'OTHER';
type RelationshipType = 'PARENT' | 'SPOUSE' | 'SIBLING';

export interface TreeMember {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  deathDate?: string | null;
  gender?: Gender | null;
  avatar?: string | null;
  bio?: string | null;
  generation: number;
  relationsFrom: Array<{
    id: string;
    type: RelationshipType;
    toId: string;
  }>;
  relationsTo: Array<{
    id: string;
    type: RelationshipType;
    fromId: string;
  }>;
}

const LEVEL_HEIGHT = 150;
const NODE_WIDTH = 250;

export function useFamilyTree(treeId: string = 'default') {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, this would be an API call. For Phase 3, we mock some robust data.
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setIsLoading(true);
        // Mock data to demonstrate the UI structure
        const mockMembers: TreeMember[] = [
          {
            id: 'm1',
            firstName: 'Arthur',
            lastName: 'Pendragon',
            birthDate: '1940-01-01',
            gender: 'MALE',
            generation: 1,
            relationsFrom: [
              { id: 'r1', type: 'SPOUSE', toId: 'm2' },
              { id: 'r2', type: 'PARENT', toId: 'm3' },
              { id: 'r3', type: 'PARENT', toId: 'm4' }
            ],
            relationsTo: []
          },
          {
            id: 'm2',
            firstName: 'Guinevere',
            lastName: 'Pendragon',
            birthDate: '1942-05-12',
            gender: 'FEMALE',
            generation: 1,
            relationsFrom: [
              { id: 'r4', type: 'PARENT', toId: 'm3' },
              { id: 'r5', type: 'PARENT', toId: 'm4' }
            ],
            relationsTo: [{ id: 'r1', type: 'SPOUSE', fromId: 'm1' }]
          },
          {
            id: 'm3',
            firstName: 'Mordred',
            lastName: 'Pendragon',
            birthDate: '1965-10-31',
            gender: 'MALE',
            generation: 2,
            relationsFrom: [],
            relationsTo: [
              { id: 'r2', type: 'PARENT', fromId: 'm1' },
              { id: 'r4', type: 'PARENT', fromId: 'm2' }
            ]
          },
          {
            id: 'm4',
            firstName: 'Morgana',
            lastName: 'Le Fay',
            birthDate: '1968-02-14',
            gender: 'FEMALE',
            generation: 2,
            relationsFrom: [],
            relationsTo: [
              { id: 'r3', type: 'PARENT', fromId: 'm1' },
              { id: 'r5', type: 'PARENT', fromId: 'm2' }
            ]
          }
        ];

        // Simulate network delay
        setTimeout(() => {
          setMembers(mockMembers);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to fetch tree data');
        setIsLoading(false);
      }
    };

    fetchTreeData();
  }, [treeId]);

  // Transform members into React Flow Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Group members by generation for auto-layout
    const gens = new Map<number, TreeMember[]>();
    members.forEach(m => {
      const g = m.generation || 1;
      if (!gens.has(g)) gens.set(g, []);
      gens.get(g)?.push(m);
    });

    // Create Nodes
    gens.forEach((genMembers, genIndex) => {
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
            label: `${member.firstName} ${member.lastName}`
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
    error,
  };
}
