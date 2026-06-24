'use client';

import * as React from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useQueryClient } from '@tanstack/react-query';
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
import { MemberSearch } from '@/components/features/members/member-search';
import { GenerationFilter } from '@/components/features/generations/generation-filter';
import { TreeVersionsDropdown } from './tree-versions-dropdown';

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
  const queryClient = useQueryClient();
  
  const { isSyncing, hasConflict, pendingChanges } = useTreeCollaboration(activeTreeId, selectedTreeVersionId);
  
  const { members: treeMembers, allMembers, familyGraph, generations, isLoading, error } = useFamilyTree(activeTreeId || undefined);
  
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

  const isTreeEmpty = allMembers.length === 0;
  const isFilteredEmpty = !isTreeEmpty && treeMembers.length === 0;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-background">
      {!isTreeEmpty && (
        <div className="w-full z-10 p-4 pb-0 flex flex-col gap-3 pointer-events-none">
          {/* Main Toolbar */}
          <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between w-full gap-3 pointer-events-auto">
            {/* Left Section */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full 2xl:w-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-md p-2 rounded-xl border border-white/20 dark:border-slate-800/50 shadow-sm">
              <MemberSearch />
              <GenerationFilter />
              <div className="hidden lg:block h-6 w-px bg-border/50" />
              <FloatingFamilyStats totalMembers={treeMembers.length} generations={generations.length} />
            </div>

            {/* Right Section */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full 2xl:w-auto justify-start 2xl:justify-end pointer-events-auto">
              <div className="flex flex-wrap items-center gap-2">
                {hasConflict && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-sm font-medium rounded-full border border-destructive/20 shadow-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Conflict</span>
                  </div>
                )}
                {!hasConflict && pendingChanges.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 text-sm font-medium rounded-full border border-amber-500/20 shadow-sm">
                    <SaveAll className="w-4 h-4" />
                    <span>{pendingChanges.length} Pending</span>
                  </div>
                )}
                {isSyncing && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing</span>
                  </div>
                )}
              </div>
              <TreeToolbar />
            </div>
          </div>

          {/* Version Selector (docked right below toolbar) */}
          <div className="flex justify-start 2xl:justify-end w-full pointer-events-auto">
            <TreeVersionsDropdown />
          </div>
        </div>
      )}

      <div className={`flex-1 relative w-full h-full ${!isTreeEmpty ? 'mt-8' : ''}`}>
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
          
          {isTreeEmpty && (
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
                      const name = prompt('Enter first generation name (e.g. Founders):');
                      if (name) {
                        fetch('/api/generations', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ treeId: activeTreeId, name })
                        }).then(() => {
                          queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] });
                        });
                      }
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
          )}
          {isFilteredEmpty && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div className="bg-card/90 backdrop-blur-xl border border-border shadow-lg rounded-xl px-5 py-4 text-center">
                <h2 className="text-base font-semibold">No members in selected generations</h2>
                <p className="text-sm text-muted-foreground mt-1">Adjust the generation filter to show more of the tree.</p>
              </div>
            </div>
          )}
        </ReactFlow>
      </div>
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
