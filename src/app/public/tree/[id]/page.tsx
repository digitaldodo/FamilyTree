'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MemberNode } from '@/components/features/tree/member-node';
import { RelationshipEdgeMemo } from '@/components/features/tree/relationship-edge';
import { GenerationLaneNode } from '@/components/features/tree/generation-lane-node';
import { FamilyJunctionNode } from '@/components/features/tree/family-junction-node';
import { TreeBackground } from '@/components/features/tree/tree-background';
import { Loader2, TreePine, Eye, LogIn } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Calendar, MapPin, Briefcase, Heart, Users } from 'lucide-react';
import { MemberAvatar } from '@/components/features/members/member-avatar';
import Image from 'next/image';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';
import { useFamilyTreeRenderer } from '@/components/features/tree/family-tree-renderer';

const nodeTypes = { member: MemberNode, generationLane: GenerationLaneNode, familyJunction: FamilyJunctionNode };
const edgeTypes = { relationship: RelationshipEdgeMemo };



function PublicMemberModal({ member, members, generations, isOpen, onClose }: { member: any; members: any[]; generations: any[]; isOpen: boolean; onClose: () => void }) {
  if (!member) return null;

  const getAge = () => {
    if (!member.birthDate) return null;
    const birth = new Date(member.birthDate);
    const end = member.deathDate ? new Date(member.deathDate) : new Date();
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const spouses = member.relationsFrom?.filter((r: any) => r.type === 'SPOUSE') || [];
  const parents = member.relationsTo?.filter((r: any) => r.type === 'PARENT') || [];
  const children = member.relationsFrom?.filter((r: any) => r.type === 'PARENT') || [];
  const siblings = [...(member.relationsFrom?.filter((r: any) => r.type === 'SIBLING') || []), ...(member.relationsTo?.filter((r: any) => r.type === 'SIBLING') || [])];
  const hasRelationships = spouses.length > 0 || parents.length > 0 || children.length > 0 || siblings.length > 0;
  const age = getAge();

  const memories = member.media?.filter((m: any) => m.type === 'image') || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl w-full p-0 overflow-hidden">
      {/* Compact Cover */}
      <div className="h-24 sm:h-28 bg-gradient-to-br from-primary/30 via-purple-500/20 to-rose-500/10 relative overflow-hidden">
        {member.coverImage && (
          <Image src={member.coverImage} alt="" fill className="w-full h-full object-cover" unoptimized />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-3 border-white/90 dark:border-zinc-800 overflow-hidden bg-muted flex items-center justify-center shadow-lg shrink-0 relative">
            <MemberAvatar 
              imageUrl={member.imageUrl} 
              firstName={member.firstName} 
              lastName={member.lastName} 
              gender={member.gender} 
              fallbackSize={32} 
            />
          </div>
          <div className="flex-1 min-w-0 pb-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate leading-tight">
              {member.firstName} {member.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white/90">
                {generations.find(g => g.id === member.generationId)?.name || 'Unnamed Generation'}
              </span>
              {member.deathDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/40 backdrop-blur-sm text-xs font-medium text-white/90">
                  🕊 In Loving Memory
                </span>
              )}
              {member.occupation && (
                <span className="text-xs text-white/70 truncate">{member.occupation}</span>
              )}
              {age !== null && (
                <span className="text-xs text-white/70">
                  {member.deathDate ? `Age at Passing ${age} years` : `${age} years old`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-5 py-4 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto space-y-5">
        {/* Bio */}
        {member.bio && (
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground italic border-l-2 border-primary/30 pl-3">
              {member.bio}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {member.birthDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Born:</span>
              <span className="font-medium">{new Date(member.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {member.deathDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Date of Death:</span>
              <span className="font-medium">{new Date(member.deathDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {member.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{member.address}</span>
            </div>
          )}
          {member.occupation && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{member.occupation}</span>
            </div>
          )}
        </div>

        {/* Relationships */}
        {hasRelationships && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Family</h4>
            <div className="flex flex-wrap gap-2">
              {parents.map((r: any) => {
                const p = members.find(m => m.id === r.fromId);
                return p && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors cursor-default">
                    <Users className="w-3 h-3" />
                    Parent: {p.firstName}
                  </span>
                );
              })}
              {spouses.map((r: any) => {
                const s = members.find(m => m.id === r.toId);
                return s && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200/50 dark:border-rose-800/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors cursor-default">
                    <Heart className="w-3 h-3" />
                    Spouse: {s.firstName}
                  </span>
                );
              })}
              {children.map((r: any) => {
                const c = members.find(m => m.id === r.toId);
                return c && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors cursor-default">
                    <Users className="w-3 h-3" />
                    Child: {c.firstName}
                  </span>
                );
              })}
              {siblings.map((r: any) => {
                const sibId = r.fromId === member.id ? r.toId : r.fromId;
                const sib = members.find(m => m.id === sibId);
                return sib && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-default">
                    <Users className="w-3 h-3" />
                    Sibling: {sib.firstName}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Memories Preview */}
        {memories.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Memories</h4>
            <div className="grid grid-cols-3 gap-2">
              {memories.slice(0, 6).map((m: any) => (
                <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <Image src={m.url} alt={m.caption || ''} fill className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function PublicTreeCanvas({ treeData }: { treeData: any }) {

  const familyGraph = React.useMemo(() => {
    return GenealogyEngine.buildFamilyGraph(treeData.members || []);
  }, [treeData.members]);

  const { nodes: rendererNodes, edges: rendererEdges } = useFamilyTreeRenderer(familyGraph, treeData.generations || []);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(rendererNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rendererEdges);
  const [selectedMember, setSelectedMember] = React.useState<any>(null);

  React.useEffect(() => {
    setNodes(rendererNodes);
    setEdges(rendererEdges);
  }, [rendererNodes, rendererEdges, setNodes, setEdges]);

  // Listen for member clicks via the store — override to use local state
  const handleNodeClick = React.useCallback((_: any, node: any) => {
    const member = treeData.members?.find((m: any) => m.id === node.id);
    if (member) setSelectedMember(member);
  }, [treeData.members]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ zIndex: 0 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <TreeBackground />
      </ReactFlow>

      <PublicMemberModal
        member={selectedMember}
        members={treeData.members || []}
        generations={treeData.generations || []}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}

export default function PublicTreePage() {
  const params = useParams();
  const id = params?.id as string;
  const [treeData, setTreeData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/trees/${id}/public`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTreeData(data.data);
        } else {
          setError(data.message || 'Tree not found');
        }
      })
      .catch(() => setError('Failed to load tree'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading shared family tree...</p>
        </div>
      </div>
    );
  }

  if (error || !treeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <TreePine className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Tree not found</h2>
          <p className="text-muted-foreground mb-6">
            This family tree doesn&apos;t exist or isn&apos;t shared publicly.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <LogIn className="w-4 h-4" />
            Sign in to Family Legacy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Public Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            You&apos;re viewing <span className="font-semibold text-foreground">{treeData.name}</span> — a shared family tree
          </span>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Create your own
        </Link>
      </div>

      {/* Tree */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <PublicTreeCanvas treeData={treeData} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
