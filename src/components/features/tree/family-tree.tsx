'use client';

import * as React from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '@/store/use-app-store';
import { useFamilyTree } from '@/hooks/use-family-tree';
import { useTreeCollaboration } from '@/hooks/use-tree-collaboration';
import { MemberNode } from './member-node';
import { CoupleContainerNode } from './couple-container-node';
import { GenerationLaneNode } from './generation-lane-node';
import { FamilyJunctionNode } from './family-junction-node';
import { RelationshipEdgeMemo } from './relationship-edge';
import { TreeToolbar } from './tree-toolbar';
import { Loader2, Activity, SaveAll, AlertTriangle } from 'lucide-react';
import { TreeBackground } from './tree-background';
import { FloatingFamilyStats } from './floating-family-stats';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';
import { TreeSkeleton } from '@/components/ui/tree-skeleton';
import { useFamilyTreeRenderer } from './family-tree-renderer';

const nodeTypes = {
  member: MemberNode,
  coupleContainer: CoupleContainerNode,
  generationLane: GenerationLaneNode,
  familyJunction: FamilyJunctionNode,
};

const edgeTypes = {
  relationship: RelationshipEdgeMemo,
};

function FamilyTreeCanvas() {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const selectedTreeVersionId = useAppStore(s => s.selectedTreeVersionId);
  
  const { isSyncing, hasConflict, pendingChanges } = useTreeCollaboration(activeTreeId, selectedTreeVersionId);
  
  const { members: treeMembers, familyGraph, generations, isLoading, error } = useFamilyTree(activeTreeId || undefined);
  
  const { nodes: rendererNodes, edges: rendererEdges } = useFamilyTreeRenderer(familyGraph, generations);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(rendererNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rendererEdges);

  React.useEffect(() => {
    setNodes(rendererNodes);
    setEdges(rendererEdges);
  }, [rendererNodes, rendererEdges, setNodes, setEdges]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeTreeId) return null;

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <TreeSkeleton />
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

  const memberNodes = nodes.filter(n => n.type === 'member');
  const isEmpty = memberNodes.length === 0;

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
        fitViewOptions={{ padding: 0.3, maxZoom: 1, minZoom: 0.2 }}
        minZoom={0.05}
        maxZoom={1.5}
        defaultEdgeOptions={{ zIndex: 0 }}
        proOptions={{ hideAttribution: true }}
        onlyRenderVisibleElements={true}
      >
        <TreeBackground />
        
        {isEmpty ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm pointer-events-none">
            <div className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-8 max-w-md w-full text-center pointer-events-auto">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Your family tree is empty</h2>
              <p className="text-muted-foreground mb-8">Start building your family legacy by adding the first member or setting up a generation.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    // Implement generation creation logic or open modal
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-medium transition-colors"
                >
                  Create Generation
                </button>
                <button 
                  onClick={() => {
                    useAppStore.getState().setSelectedMemberId(null);
                    useAppStore.getState().setIsEditingMember(true);
                    useAppStore.getState().setIsMemberModalOpen(true);
                  }}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-12 rounded-xl font-medium transition-colors"
                >
                  Add First Member
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute top-4 inset-x-4 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pointer-events-none">
              <div className="pointer-events-auto w-full md:w-auto">
                <FloatingFamilyStats totalMembers={memberNodes.length} generations={generations.length} />
              </div>
              <div className="pointer-events-auto w-full md:w-auto flex justify-start md:justify-end overflow-x-hidden">
                <div className="flex items-center gap-2 mr-4">
                  {hasConflict && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-sm font-medium rounded-full border border-destructive/20">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Conflict</span>
                    </div>
                  )}
                  {!hasConflict && pendingChanges.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 text-sm font-medium rounded-full border border-amber-500/20">
                      <SaveAll className="w-4 h-4" />
                      <span>{pendingChanges.length} Pending</span>
                    </div>
                  )}
                  {isSyncing && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing</span>
                    </div>
                  )}
                </div>
                <TreeToolbar />
              </div>
            </div>
          </>
        )}
        
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
