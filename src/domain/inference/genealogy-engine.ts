import { MemberWithRelations } from '@/types/member';
import { EMPTY_GRAPH } from '@/lib/safe-helpers';

export type FamilyGraphNode = {
  id: string;
  type?: 'MEMBER' | 'COUPLE_CONTAINER';
  member?: MemberWithRelations;
  members?: MemberWithRelations[];
  generation: number;
  layoutHints: {
    x?: number;
    y?: number;
    spouseGroupId?: string;
    siblingGroupId?: string;
  };
};

export type FamilyGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: 'PARENT' | 'SPOUSE' | 'SIBLING';
};

export type DerivedRelationships = Record<string, {
  parents: string[];
  children: string[];
  spouses: string[];
  siblings: string[];
  ancestors: string[];
}>;

export type FamilyGraph = {
  nodes: FamilyGraphNode[];
  edges: FamilyGraphEdge[];
  derivedRelationships: DerivedRelationships;
  generations: Record<number, string[]>;
  layoutHints: {
    spouseGroups: Record<string, string[]>;
    siblingGroups: Record<string, string[]>;
  };
};

export type BuildGraphPayload = {
  treeId: string;
  versionId?: string | null;
  members: MemberWithRelations[];
};

export const GenealogyEngine = {
  buildFamilyGraph(payload: BuildGraphPayload): FamilyGraph {
    try {
      let { members } = payload;
      members = Array.isArray(members) ? members : [];
      
      const nodesMap = new Map<string, FamilyGraphNode>();
      const edges: FamilyGraphEdge[] = [];
      
      // 1. Initialize nodes
      for (const m of members) {
        nodesMap.set(m.id, {
          id: m.id,
          member: structuredClone(m),
          generation: 0,
          layoutHints: {}
        });
      }

      const nodes = Array.from(nodesMap.values());

      // Extract basic edges (filter out any legacy SIBLING edges from DB)
      for (const m of members) {
        if (!m.relationsFrom) continue;
        for (const rel of m.relationsFrom) {
          if (rel.type === 'PARENT' || rel.type === 'SPOUSE') {
            edges.push({
              id: rel.id || `e-${rel.fromId}-${rel.toId}-${rel.type}`,
              source: rel.fromId,
              target: rel.toId,
              type: rel.type as 'PARENT' | 'SPOUSE'
            });
          }
        }
      }

      // De-duplicate spouse edges
      const uniqueEdges = this.deduplicateSpouseEdges(edges);

      // 2. Derive Generational levels
      this.inferGenerations(nodes, uniqueEdges);

      // 3. Derive Siblings
      const siblingEdges = this.inferSiblings(nodes, uniqueEdges);
      const allEdges = [...uniqueEdges, ...siblingEdges];

      // 4. Resolve Spouse Links (groupings)
      const spouseGroups = this.resolveSpouseLinks(nodes, allEdges);

      const finalNodes: FamilyGraphNode[] = [];
      const nodeToContainerMap = new Map<string, string>();
      
      for (const [groupId, group] of Object.entries(spouseGroups)) {
        if (group.length > 1) {
          const membersInGroup = group.map(id => nodesMap.get(id)!.member!);
          const minGen = Math.min(...group.map(id => nodesMap.get(id)!.generation));
          const coupleNode: FamilyGraphNode = {
            id: groupId,
            type: 'COUPLE_CONTAINER',
            members: membersInGroup,
            generation: minGen,
            layoutHints: { spouseGroupId: groupId }
          };
          finalNodes.push(coupleNode);
          nodesMap.set(groupId, coupleNode);
          for (const id of group) {
            nodeToContainerMap.set(id, groupId);
          }
        }
      }
      
      for (const node of nodes) {
        if (!nodeToContainerMap.has(node.id)) {
          node.type = 'MEMBER';
          finalNodes.push(node);
        }
      }
      
      const finalEdges: FamilyGraphEdge[] = [];
      const seenEdgeKeys = new Set<string>();
      
      for (const e of allEdges) {
         const newSource = nodeToContainerMap.get(e.source) || e.source;
         const newTarget = nodeToContainerMap.get(e.target) || e.target;
         
         if (newSource === newTarget) continue;
         
         const edgeKey = `${newSource}-${newTarget}-${e.type}`;
         if (!seenEdgeKeys.has(edgeKey)) {
             seenEdgeKeys.add(edgeKey);
             finalEdges.push({
                 id: e.id,
                 source: newSource,
                 target: newTarget,
                 type: e.type
             });
         }
      }

      // 5. Build DerivedRelationships & Ancestors using final nodes/edges
      const derivedRelationships = this.buildDerivedRelationships(finalNodes, finalEdges);
      this.inferAncestors(finalNodes, finalEdges, derivedRelationships);
      
      // Group siblings for layout hints (using finalEdges)
      const siblingGroups = this.buildSiblingGroups(finalEdges);
      
      // Assign layout hints to final nodes
      for (const node of finalNodes) {
        for (const [groupId, group] of Object.entries(siblingGroups)) {
          if (group.includes(node.id)) {
            node.layoutHints.siblingGroupId = groupId;
          }
        }
      }

      const generationsRec: Record<number, string[]> = {};
      for (const node of finalNodes) {
        if (!generationsRec[node.generation]) generationsRec[node.generation] = [];
        generationsRec[node.generation].push(node.id);
      }

      // 6. Compute Layout (X/Y coordinates)
      const LEVEL_HEIGHT = 450;
      const NODE_WIDTH = 220;
      const GAP = 80;

      const nodePositions = new Map<string, { x: number, y: number }>();
      const levels = Object.keys(generationsRec).map(Number).sort((a, b) => a - b);
      const levelRightEdge = new Map<number, number>();

      for (const level of levels) {
        const nodeIds = generationsRec[level] || [];
        let currentX = levelRightEdge.get(level) || 0;
        
        nodeIds.sort((a, b) => {
          const aParents = derivedRelationships[a]?.parents || [];
          const bParents = derivedRelationships[b]?.parents || [];
          const aParentX = aParents.length > 0 ? (nodePositions.get(aParents[0])?.x || 0) : 0;
          const bParentX = bParents.length > 0 ? (nodePositions.get(bParents[0])?.x || 0) : 0;
          return aParentX - bParentX;
        });

        for (const id of nodeIds) {
          const parents = derivedRelationships[id]?.parents || [];
          let parentAvgX = 0;
          let parentCount = 0;
          
          for (const p of parents) {
            const pPos = nodePositions.get(p);
            if (pPos) {
              parentAvgX += pPos.x;
              parentCount++;
            }
          }
          
          if (parentCount > 0) {
            const desiredCenterX = parentAvgX / parentCount;
            const startXForNode = desiredCenterX;
            currentX = Math.max(currentX, startXForNode);
          }

          nodePositions.set(id, { x: currentX, y: level * LEVEL_HEIGHT });
          const node = nodesMap.get(id)!;
          node.layoutHints.x = currentX;
          node.layoutHints.y = level * LEVEL_HEIGHT;
          
          const isCouple = node.type === 'COUPLE_CONTAINER';
          const nodeWidth = isCouple ? NODE_WIDTH * 2 + GAP : NODE_WIDTH;
          
          currentX += nodeWidth + GAP;
        }
        levelRightEdge.set(level, currentX);
      }

      const graph: FamilyGraph = {
        nodes: finalNodes,
        edges: finalEdges,
        derivedRelationships,
        generations: generationsRec,
        layoutHints: {
          spouseGroups,
          siblingGroups
        }
      };

      return graph;
    } catch (error) {
      console.error('Inference Engine Error:', error);
      return EMPTY_GRAPH;
    }
  },

  deduplicateSpouseEdges(edges: FamilyGraphEdge[]): FamilyGraphEdge[] {
    const seen = new Set<string>();
    return edges.filter(e => {
      if (e.type !== 'SPOUSE') return true;
      const key = [e.source, e.target].sort().join('-');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  inferGenerations(nodes: FamilyGraphNode[], edges: FamilyGraphEdge[]) {
    const parentEdges = edges.filter(e => e.type === 'PARENT');
    
    const parentsOf = new Map<string, string[]>();
    for (const e of parentEdges) {
      if (!parentsOf.has(e.target)) parentsOf.set(e.target, []);
      parentsOf.get(e.target)!.push(e.source);
    }

    const roots = nodes.filter(n => !parentsOf.has(n.id) || parentsOf.get(n.id)!.length === 0);

    const genMap = new Map<string, number>();
    const visited = new Set<string>();
    const queue: { id: string, gen: number }[] = [];
    
    for (const root of roots) {
      queue.push({ id: root.id, gen: 0 });
      genMap.set(root.id, 0);
      visited.add(root.id);
    }

    if (roots.length === 0 && nodes.length > 0) {
      queue.push({ id: nodes[0].id, gen: 0 });
      genMap.set(nodes[0].id, 0);
      visited.add(nodes[0].id);
    }

    const childrenOf = new Map<string, string[]>();
    const spousesOf = new Map<string, string[]>();
    for (const e of edges) {
      if (e.type === 'PARENT') {
        if (!childrenOf.has(e.source)) childrenOf.set(e.source, []);
        childrenOf.get(e.source)!.push(e.target);
      } else if (e.type === 'SPOUSE') {
        if (!spousesOf.has(e.source)) spousesOf.set(e.source, []);
        if (!spousesOf.has(e.target)) spousesOf.set(e.target, []);
        spousesOf.get(e.source)!.push(e.target);
        spousesOf.get(e.target)!.push(e.source);
      }
    }

    while (queue.length > 0) {
      const { id: curr, gen: currGen } = queue.shift()!;
      
      const spouses = spousesOf.get(curr) || [];
      for (const sp of spouses) {
        if (!visited.has(sp)) {
          visited.add(sp);
          genMap.set(sp, currGen);
          queue.push({ id: sp, gen: currGen });
        }
      }

      const children = childrenOf.get(curr) || [];
      for (const child of children) {
        if (!visited.has(child)) {
          visited.add(child);
          genMap.set(child, currGen + 1);
          queue.push({ id: child, gen: currGen + 1 });
        }
      }
    }

    for (const n of nodes) {
      const gen = genMap.get(n.id);
      if (gen === undefined || gen === null || isNaN(gen)) {
        console.warn(`[GenealogyEngine] generation missing for member ${n.id}. Assigning fallback 0`);
        n.generation = 0;
      } else {
        n.generation = gen;
      }
    }
  },

  inferSiblings(nodes: FamilyGraphNode[], edges: FamilyGraphEdge[]): FamilyGraphEdge[] {
    const parentMap = new Map<string, Set<string>>();
    for (const e of edges) {
      if (e.type === 'PARENT') {
        if (!parentMap.has(e.target)) parentMap.set(e.target, new Set());
        parentMap.get(e.target)!.add(e.source);
      }
    }

    const siblingEdges: FamilyGraphEdge[] = [];
    const seenSibPairs = new Set<string>();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i].id;
        const n2 = nodes[j].id;
        const p1 = parentMap.get(n1) || new Set();
        const p2 = parentMap.get(n2) || new Set();
        
        let shared = false;
        for (const p of p1) {
          if (p2.has(p)) {
            shared = true;
            break;
          }
        }

        if (shared) {
          const key = [n1, n2].sort().join('-');
          if (!seenSibPairs.has(key)) {
            seenSibPairs.add(key);
            siblingEdges.push({
              id: `derived-sib-${key}`,
              source: n1,
              target: n2,
              type: 'SIBLING'
            });
          }
        }
      }
    }
    return siblingEdges;
  },

  resolveSpouseLinks(nodes: FamilyGraphNode[], edges: FamilyGraphEdge[]) {
    const parent = new Map<string, string>();
    const find = (i: string): string => {
      if (!parent.has(i)) parent.set(i, i);
      if (parent.get(i) === i) return i;
      const p = find(parent.get(i)!);
      parent.set(i, p);
      return p;
    };
    const union = (i: string, j: string) => {
      parent.set(find(i), find(j));
    };

    for (const e of edges) {
      if (e.type === 'SPOUSE') {
        union(e.source, e.target);
      }
    }

    const groups: Record<string, string[]> = {};
    for (const n of nodes) {
      const root = find(n.id);
      if (!groups[root]) groups[root] = [];
      groups[root].push(n.id);
    }

    const spouseGroups: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(groups)) {
      if (v.length > 1) {
        spouseGroups[`spouse-group-${k}`] = v;
      }
    }
    return spouseGroups;
  },

  buildSiblingGroups(siblingEdges: FamilyGraphEdge[]) {
    const parent = new Map<string, string>();
    const find = (i: string): string => {
      if (!parent.has(i)) parent.set(i, i);
      if (parent.get(i) === i) return i;
      const p = find(parent.get(i)!);
      parent.set(i, p);
      return p;
    };
    const union = (i: string, j: string) => {
      parent.set(find(i), find(j));
    };

    for (const e of siblingEdges) {
      union(e.source, e.target);
    }

    const groups: Record<string, string[]> = {};
    for (const k of parent.keys()) {
      const root = find(k);
      if (!groups[root]) groups[root] = [];
      groups[root].push(k);
    }

    const siblingGroups: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(groups)) {
      if (v.length > 1) {
        siblingGroups[`sibling-group-${k}`] = v;
      }
    }
    return siblingGroups;
  },

  buildDerivedRelationships(nodes: FamilyGraphNode[], edges: FamilyGraphEdge[]): DerivedRelationships {
    const dr: DerivedRelationships = {};
    for (const n of nodes) {
      dr[n.id] = { parents: [], children: [], spouses: [], siblings: [], ancestors: [] };
    }

    for (const e of edges) {
      if (e.type === 'PARENT') {
        dr[e.target].parents.push(e.source);
        dr[e.source].children.push(e.target);
      } else if (e.type === 'SPOUSE') {
        dr[e.source].spouses.push(e.target);
        dr[e.target].spouses.push(e.source);
      } else if (e.type === 'SIBLING') {
        dr[e.source].siblings.push(e.target);
        dr[e.target].siblings.push(e.source);
      }
    }

    for (const k in dr) {
      dr[k].parents = Array.from(new Set(dr[k].parents));
      dr[k].children = Array.from(new Set(dr[k].children));
      dr[k].spouses = Array.from(new Set(dr[k].spouses));
      dr[k].siblings = Array.from(new Set(dr[k].siblings));
    }
    return dr;
  },

  inferAncestors(nodes: FamilyGraphNode[], edges: FamilyGraphEdge[], dr: DerivedRelationships) {
    for (const n of nodes) {
      const ancestors = new Set<string>();
      const queue = [...dr[n.id].parents];
      while(queue.length > 0) {
        const curr = queue.shift()!;
        if (!ancestors.has(curr)) {
          ancestors.add(curr);
          queue.push(...dr[curr].parents);
        }
      }
      dr[n.id].ancestors = Array.from(ancestors);
    }
  },

  validateFamilyGraph(graph: FamilyGraph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const node of graph.nodes) {
      if (graph.derivedRelationships[node.id].ancestors.includes(node.id)) {
        errors.push(`Circular ancestry detected for node ${node.id}`);
      }
    }

    for (const [nodeId, rels] of Object.entries(graph.derivedRelationships)) {
      if (rels.parents.length > 2) {
        errors.push(`Node ${nodeId} has more than 2 parents`);
      }
    }

    for (const edge of graph.edges) {
      if (edge.type === 'PARENT') {
        const parent = graph.nodes.find(n => n.id === edge.source);
        const child = graph.nodes.find(n => n.id === edge.target);
        if (parent && child && child.generation <= parent.generation) {
          errors.push(`Invalid generation ordering between ${parent.id} and ${child.id}`);
        }
      }
    }

    for (const edge of graph.edges) {
      if (edge.source === edge.target) {
        errors.push(`Self relationship detected on node ${edge.source}`);
      }
    }

    // Check duplicate edges
    const seenEdges = new Set<string>();
    for (const edge of graph.edges) {
        const edgeKey = `${edge.source}-${edge.target}-${edge.type}`;
        if (seenEdges.has(edgeKey)) {
            errors.push(`Duplicate edge detected: ${edgeKey}`);
        }
        seenEdges.add(edgeKey);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
