'use client';

import * as React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFamilyTree } from '@/hooks/use-family-tree';
import { MemberNode } from './member-node';
import { RelationshipEdgeMemo } from './relationship-edge';
import { TreeToolbar } from './tree-toolbar';
import { Loader2 } from 'lucide-react';

const nodeTypes = {
  member: MemberNode,
};

const edgeTypes = {
  relationship: RelationshipEdgeMemo,
};

function FamilyTreeCanvas() {
  const { initialNodes, initialEdges, isLoading, error } = useFamilyTree('default');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading family tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="p-6 glass-card rounded-2xl text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Tree</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ zIndex: 0 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="currentColor" className="text-muted-foreground/20" />
        <MiniMap 
          zoomable 
          pannable 
          nodeColor={(node) => {
            const data = node.data as any;
            if (data?.member?.gender === 'MALE') return '#60a5fa';
            if (data?.member?.gender === 'FEMALE') return '#f472b6';
            return '#6366f1';
          }}
          className="!bottom-6 !left-6 !m-0 rounded-2xl shadow-xl border-border"
        />
        <TreeToolbar />
      </ReactFlow>
    </div>
  );
}

export function FamilyTree() {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvas />
    </ReactFlowProvider>
  );
}
