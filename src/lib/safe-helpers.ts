import { FamilyGraph, FamilyGraphNode, FamilyGraphEdge } from '@/domain/inference/genealogy-engine';

export const EMPTY_GRAPH: FamilyGraph = {
  nodes: [],
  edges: [],
  generations: {},
  derivedRelationships: {},
  layoutHints: {
    spouseGroups: {},
    siblingGroups: {}
  }
};

export function safeArray<T>(input: any): T[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [];
}

export function safeObject<T extends object>(input: any, fallback: T): T {
  if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
    return input as T;
  }
  return fallback;
}

export function safeGraph(input: any): FamilyGraph {
  if (!input) return EMPTY_GRAPH;
  
  const nodes = safeArray<FamilyGraphNode>(input.nodes);
  const edges = safeArray<FamilyGraphEdge>(input.edges);
  const generations = safeObject(input.generations, {});
  const derivedRelationships = safeObject(input.derivedRelationships, {});
  const layoutHintsRaw = safeObject(input.layoutHints, { spouseGroups: {}, siblingGroups: {} });

  const layoutHints = {
    spouseGroups: safeObject(layoutHintsRaw.spouseGroups, {}),
    siblingGroups: safeObject(layoutHintsRaw.siblingGroups, {})
  };

  return {
    nodes,
    edges,
    generations,
    derivedRelationships,
    layoutHints
  };
}
