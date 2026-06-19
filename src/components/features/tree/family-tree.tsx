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

import { useAppStore } from '@/store/use-app-store';
import { useFamilyTree } from '@/hooks/use-family-tree';
import { MemberNode } from './member-node';
import { GenerationLaneNode } from './generation-lane-node';
import { FamilyJunctionNode } from './family-junction-node';
import { RelationshipEdgeMemo } from './relationship-edge';
import { TreeToolbar } from './tree-toolbar';
import { Loader2, Activity } from 'lucide-react';
import { TreeBackground } from './tree-background';
import { FloatingFamilyStats } from './floating-family-stats';

const nodeTypes = {
  member: MemberNode,
  generationLane: GenerationLaneNode,
  familyJunction: FamilyJunctionNode,
};

const edgeTypes = {
  relationship: RelationshipEdgeMemo,
};

function FamilyTreeCanvas() {
  const { activeTreeId } = useAppStore();
  const { initialNodes, initialEdges, isLoading, error } = useFamilyTree(activeTreeId || undefined);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
        setShowDiagnostics(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            {memberNodes.length >= 5 && (
              <MiniMap 
                zoomable 
                pannable 
                nodeColor={(node) => {
                  if (node.type === 'generationLane') return 'transparent';
                  const data = node.data as any;
                  if (data?.member?.gender === 'MALE') return '#60a5fa';
                  if (data?.member?.gender === 'FEMALE') return '#f472b6';
                  return '#6366f1';
                }}
                style={{ width: 220, height: 140 }}
                className="!bottom-6 !left-6 !m-0 rounded-2xl shadow-xl border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"
              />
            )}
            <div className="absolute top-4 inset-x-4 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pointer-events-none">
              <div className="pointer-events-auto w-full md:w-auto">
                <FloatingFamilyStats totalMembers={memberNodes.length} generations={useAppStore.getState().generations.length} />
              </div>
              <div className="pointer-events-auto w-full md:w-auto flex justify-start md:justify-end overflow-x-hidden">
                <TreeToolbar />
              </div>
            </div>
          </>
        )}

        {showDiagnostics && (
          <Panel position="top-left" className="bg-black/80 backdrop-blur-md p-4 rounded-xl text-white font-mono text-xs z-50 min-w-[200px] border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <strong className="text-sm">Tree Diagnostics</strong>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between"><span>Members:</span> <span>{useAppStore.getState().members.length}</span></div>
              <div className="flex justify-between"><span>Generations:</span> <span>{useAppStore.getState().generations.length}</span></div>
              <div className="flex justify-between"><span>Nodes:</span> <span>{nodes.length}</span></div>
              <div className="flex justify-between"><span>Edges:</span> <span>{edges.length}</span></div>
              <div className="flex justify-between"><span>Relationships:</span> <span>{useAppStore.getState().members.reduce((acc, m) => acc + m.relationsFrom.length + m.relationsTo.length, 0) / 2}</span></div>
              <div className="flex justify-between"><span>Photos Loaded:</span> <span className={useAppStore.getState().members.some(m => m.imageUrl) ? 'text-emerald-400' : 'text-amber-400'}>{useAppStore.getState().members.filter(m => m.imageUrl).length}</span></div>
            </div>
            <div className="mt-3 text-[10px] text-white/50 text-center pt-2 border-t border-white/20">Press ` to hide</div>
          </Panel>
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
