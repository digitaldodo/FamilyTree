import React, { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { FamilyGraph } from '@/domain/inference/genealogy-engine';

export const LEVEL_HEIGHT = 450;
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 300;
export const GAP = 80;

interface FamilyTreeRendererProps {
  familyGraph: FamilyGraph;
  generations: any[]; // The explicit DB generations for lanes
}

export function useFamilyTreeRenderer(familyGraph: FamilyGraph, generations: any[]) {
  
  const { nodes, edges } = useMemo(() => {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    if (!familyGraph || familyGraph.nodes.length === 0) {
      return { nodes: rfNodes, edges: rfEdges };
    }

    const nodePositions = new Map<string, { x: number, y: number }>();
    let minGlobalX = 0;
    let maxGlobalX = 0;

    // 1. Calculate Positions Level by Level
    const levels = Object.keys(familyGraph.generations).map(Number).sort((a, b) => a - b);
    
    // Map to keep track of right-most X per level to prevent overlaps
    const levelRightEdge = new Map<number, number>();

    for (const level of levels) {
      const nodeIds = familyGraph.generations[level] || [];
      let currentX = levelRightEdge.get(level) || 0;
      
      // Sort to roughly keep siblings together by their shared parent X
      nodeIds.sort((a, b) => {
        const aParents = familyGraph.derivedRelationships[a]?.parents || [];
        const bParents = familyGraph.derivedRelationships[b]?.parents || [];
        const aParentX = aParents.length > 0 ? (nodePositions.get(aParents[0])?.x || 0) : 0;
        const bParentX = bParents.length > 0 ? (nodePositions.get(bParents[0])?.x || 0) : 0;
        return aParentX - bParentX;
      });

      // Group spouses
      const levelGroups = new Set<string>();
      const groupedNodes: string[][] = [];
      
      for (const id of nodeIds) {
        const node = familyGraph.nodes.find(n => n.id === id);
        const spouseGroup = node?.layoutHints?.spouseGroupId;
        if (spouseGroup) {
          if (!levelGroups.has(spouseGroup)) {
            levelGroups.add(spouseGroup);
            const membersInGroup = familyGraph.nodes
              .filter(n => n.layoutHints?.spouseGroupId === spouseGroup && n.generation === level)
              .map(n => n.id);
            groupedNodes.push(membersInGroup);
          }
        } else {
          groupedNodes.push([id]);
        }
      }

      for (const group of groupedNodes) {
        let parentAvgX = 0;
        let parentCount = 0;
        
        for (const id of group) {
          const parents = familyGraph.derivedRelationships[id]?.parents || [];
          for (const p of parents) {
            const pPos = nodePositions.get(p);
            if (pPos) {
              parentAvgX += pPos.x;
              parentCount++;
            }
          }
        }
        
        // Attempt to center under parents
        if (parentCount > 0) {
          const desiredCenterX = parentAvgX / parentCount;
          const startXForGroup = desiredCenterX - ((group.length * (NODE_WIDTH + GAP)) / 2) + (NODE_WIDTH / 2);
          currentX = Math.max(currentX, startXForGroup);
        }

        // Place group members
        for (let i = 0; i < group.length; i++) {
          const id = group[i];
          nodePositions.set(id, { x: currentX, y: level * LEVEL_HEIGHT });
          currentX += NODE_WIDTH + GAP;
        }
      }
      
      levelRightEdge.set(level, currentX);
    }

    // 2. Generate React Flow Nodes for Members
    for (const node of familyGraph.nodes) {
      const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
      
      minGlobalX = Math.min(minGlobalX, pos.x);
      maxGlobalX = Math.max(maxGlobalX, pos.x + NODE_WIDTH);

      rfNodes.push({
        id: node.id,
        type: 'member',
        position: { x: pos.x, y: pos.y },
        data: {
          member: node.member,
          label: `${node.member.firstName} ${node.member.lastName}`,
          generationName: Array.isArray(generations) ? generations.find(g => g.id === node.member.generationId)?.name : undefined,
        }
      });
    }

    // 3. Generate Generation Lanes
    const laneWidth = Math.max(3000, maxGlobalX - minGlobalX + 1200);
    const laneX = minGlobalX === 0 && maxGlobalX === 0 ? -1000 : minGlobalX - 600;

    const safeGenerations = Array.isArray(generations) ? generations : [];
    safeGenerations.forEach((gen, index) => {
      // Use the generation orderIndex to map to our vertical levels
      // Or fallback to linear index
      const level = gen.orderIndex !== undefined ? gen.orderIndex : index;
      
      rfNodes.push({
        id: `lane-${gen.id || level}`,
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

    // 4. Generate Edges
    // Spouse Edges
    const spouseEdges = familyGraph.edges.filter(e => e.type === 'SPOUSE');
    spouseEdges.forEach(rel => {
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
        style: { stroke: '#f43f5e', strokeWidth: 2 },
      });
    });

    // Parent-Child Edges
    // To support multiple parents correctly and cleanly, we can link directly or use junctions.
    // The previous design used familyJunctions for clean parent->junction->child rendering.
    const parentGroups = new Map<string, { parents: string[], children: string[] }>();
    
    // Find all children and their exact parent sets
    for (const node of familyGraph.nodes) {
      const parents = familyGraph.derivedRelationships[node.id]?.parents || [];
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
      parents.forEach(pId => {
        const pos = nodePositions.get(pId);
        if (pos) {
          sumX += pos.x + (NODE_WIDTH / 2);
          maxY = Math.max(maxY, pos.y);
        }
      });
      const junctionX = sumX / parents.length;
      const junctionY = maxY + NODE_HEIGHT + (GAP / 2);
      const junctionId = `junction-${pKey}`;

      rfNodes.push({
        id: junctionId,
        type: 'familyJunction',
        position: { x: junctionX - 6, y: junctionY - 6 },
        data: {},
        draggable: false,
        selectable: false,
        zIndex: 0,
      });

      // Parents to Junction
      parents.forEach(pId => {
        rfEdges.push({
          id: `e-${pId}-to-${junctionId}`,
          source: pId,
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

      // Junction to Children
      children.forEach(cId => {
        rfEdges.push({
          id: `e-${junctionId}-to-${cId}`,
          source: junctionId,
          target: cId,
          type: 'relationship',
          sourceHandle: 'junction-source',
          targetHandle: 'child-target',
          animated: false,
          zIndex: 0,
          data: { type: 'PARENT' },
          style: { stroke: '#6366f1', strokeWidth: 2 },
        });
      });
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [familyGraph, generations]);

  return { nodes, edges };
}
