'use client';

import * as React from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { motion, AnimatePresence } from 'framer-motion';
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
import { Loader2, SaveAll, AlertTriangle, RefreshCw } from 'lucide-react';
import { TreeBackground } from './tree-background';
import { FloatingFamilyStats } from './floating-family-stats';
import { TreeSkeleton } from '@/components/ui/tree-skeleton';
import { useFamilyTreeRenderer } from './family-tree-renderer';
import { MemberSearch } from '@/components/features/members/member-search';
import { GenerationFilter } from '@/components/features/generations/generation-filter';
import { TreeVersionsDropdown } from './tree-versions-dropdown';
import { fetchJson } from '@/lib/fetcher';
import { useUserTrees } from '@/hooks/use-user-trees';
import { GlobalGlowController } from './global-glow-controller';

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
  const { fitView, getNodes } = useReactFlow();
  const activeTreeId = useAppStore((s) => s.activeTreeId);
  const selectedTreeVersionId = useAppStore((s) => s.selectedTreeVersionId);
  const setSelectedMemberId = useAppStore((s) => s.setSelectedMemberId);
  const setIsMemberModalOpen = useAppStore((s) => s.setIsMemberModalOpen);
  const setIsEditingMember = useAppStore((s) => s.setIsEditingMember);
  const queryClient = useQueryClient();
  const { userTrees } = useUserTrees();
  const activeTreeName =
    userTrees.find((tree) => tree.id === activeTreeId)?.name || 'Family Tree';

  const { isSyncing, hasConflict, pendingChanges } = useTreeCollaboration(
    activeTreeId,
    selectedTreeVersionId
  );

  const {
    members: treeMembers,
    allMembers,
    familyGraph,
    generations,
    isLoading,
    error,
    errorStatus,
    refetch,
  } = useFamilyTree(activeTreeId || undefined);

  const { nodes: rendererNodes, edges: rendererEdges } = useFamilyTreeRenderer(
    familyGraph,
    generations
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rendererNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rendererEdges);

  React.useEffect(() => {
    setNodes(rendererNodes);
    setEdges(rendererEdges);
  }, [rendererNodes, rendererEdges, setNodes, setEdges]);

  const fitTree = React.useCallback(
    (duration = 0) => {
      const treeNodes = getNodes().filter(
        (node) => node.type !== 'generationLane'
      );

      if (treeNodes.length > 0) {
        fitView({ nodes: treeNodes, duration, padding: 0.16, maxZoom: 1 });
      }
    },
    [fitView, getNodes]
  );

  // Wait for React Flow to measure the freshly-rendered cards, then fit only
  // visible family nodes. Generation labels are intentionally excluded so they
  // can never create excess margins or change the tree's layout.
  React.useEffect(() => {
    if (rendererNodes.length === 0) return;

    let secondFrame: number | undefined;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => fitTree());
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [rendererNodes, fitTree]);

  React.useEffect(() => {
    let frame: number | undefined;
    const handleResize = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => fitTree());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [fitTree]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddFirstMember = () => {
    setSelectedMemberId(null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  const handleCreateGeneration = async () => {
    if (!activeTreeId) return;
    const name = prompt('Enter first generation name (e.g. Founders):');
    if (!name) return;

    try {
      await fetchJson('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeId: activeTreeId, name }),
      });
      await queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] });
    } catch {
      console.error('Failed to create generation', error);
    }
  };

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
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="p-8 bg-card border rounded-lg text-center max-w-md shadow-sm">
          <h3 className="text-lg font-medium text-destructive mb-2">
            Error Loading Tree
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          {errorStatus ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Status {errorStatus}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isTreeEmpty = allMembers.length === 0;
  const isFilteredEmpty = !isTreeEmpty && treeMembers.length === 0;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-background">
      {!isTreeEmpty && (
        <div data-toolbar className="w-full z-10 p-4 pb-0 flex flex-col gap-3 pointer-events-none">
          {/* Main Toolbar */}
          <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between w-full gap-3 pointer-events-auto">
            {/* Left Section */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full 2xl:w-auto bg-card p-2 rounded-lg border border-border shadow-sm">
              <MemberSearch />
              <GenerationFilter />
              <div className="hidden lg:block h-6 w-px bg-border/50" />
              <FloatingFamilyStats
                totalMembers={treeMembers.length}
                generations={generations.length}
              />
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
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full border border-accent/20 shadow-sm">
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
              <TreeToolbar treeName={activeTreeName} />
            </div>
          </div>

          {/* Version Selector (docked right below toolbar) */}
          <div className="flex justify-start 2xl:justify-end w-full pointer-events-auto">
            <TreeVersionsDropdown />
          </div>
        </div>
      )}

      <div
        className={`flex-1 relative w-full h-full ${!isTreeEmpty ? 'mt-8' : ''}`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{
            padding: 0.16,
            maxZoom: 1,
            minZoom: 0.2,
            nodes: nodes.filter((node) => node.type !== 'generationLane'),
          }}
          minZoom={0.05}
          maxZoom={1.5}
          defaultEdgeOptions={{ zIndex: 0 }}
          proOptions={{ hideAttribution: true }}
          onlyRenderVisibleElements={true}
        >
          <GlobalGlowController />
          <TreeBackground />

          <AnimatePresence>
            {isTreeEmpty && (
              <motion.div
                key="tree-empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none"
              >
                <div className="bg-card border border-border shadow-lg rounded-lg p-8 max-w-md w-full text-center pointer-events-auto">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-3 tracking-tight">
                    Your family tree is empty
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Start building your family legacy by adding the first member
                    or setting up a generation.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCreateGeneration}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md text-sm font-medium transition-colors"
                    >
                      Create Generation
                    </button>
                    <button
                      onClick={handleAddFirstMember}
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 rounded-md text-sm font-medium transition-colors"
                    >
                      Add First Member
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {isFilteredEmpty && (
              <motion.div
                key="tree-filter-empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-card border border-border shadow-lg rounded-lg px-5 py-4 text-center">
                  <h2 className="text-base font-semibold">
                    No members in selected generations
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adjust the generation filter to show more of the tree.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
