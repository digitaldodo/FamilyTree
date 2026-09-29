'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFamilyTree } from '@/hooks/use-family-tree';
import { useFamilyTreeRenderer } from '@/components/features/tree/family-tree-renderer';
import { MemberNode } from '@/components/features/tree/member-node';
import { CoupleContainerNode } from '@/components/features/tree/couple-container-node';
import { GenerationLaneNode } from '@/components/features/tree/generation-lane-node';
import { FamilyJunctionNode } from '@/components/features/tree/family-junction-node';
import { RelationshipEdgeMemo } from '@/components/features/tree/relationship-edge';
import { TreePine, Loader2 } from 'lucide-react';

const nodeTypes = {
  member: MemberNode,
  coupleContainer: CoupleContainerNode,
  generationLane: GenerationLaneNode,
  familyJunction: FamilyJunctionNode,
};
const edgeTypes = {
  relationship: RelationshipEdgeMemo,
};

interface DashboardTreePreviewProps {
  treeId: string;
}

function DashboardTreePreviewCanvas({ treeId }: DashboardTreePreviewProps) {
  const router = useRouter();
  const { familyGraph, generations, isLoading, error } = useFamilyTree(treeId);
  const { nodes, edges } = useFamilyTreeRenderer(familyGraph, generations);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin opacity-50" />
        <span className="text-sm font-medium">Loading family structure...</span>
      </div>
    );
  }

  if (error || nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
           <TreePine className="w-8 h-8 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Tree preview unavailable</p>
          <p className="text-xs mt-1">Add more members to visualize your family tree.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative cursor-pointer group bg-card"
      onClick={() => router.push('/tree')}
    >
      <div className="absolute inset-0 pointer-events-none z-10 transition-colors group-hover:bg-primary/5" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 0.5, minZoom: 0.05 }}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

export function DashboardTreePreview({ treeId }: DashboardTreePreviewProps) {
  return (
    <ReactFlowProvider>
      <DashboardTreePreviewCanvas treeId={treeId} />
    </ReactFlowProvider>
  );
}
