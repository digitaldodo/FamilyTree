'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MemberNode } from '@/components/features/tree/member-node';
import { RelationshipEdgeMemo } from '@/components/features/tree/relationship-edge';
import { GenerationLaneNode } from '@/components/features/tree/generation-lane-node';
import { FamilyJunctionNode } from '@/components/features/tree/family-junction-node';
import { TreeBackground } from '@/components/features/tree/tree-background';
import { Loader2, TreePine, Eye, LogIn, Printer, Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Calendar, MapPin, Briefcase, Heart, Users } from 'lucide-react';
import { MemberAvatar } from '@/components/features/members/member-avatar';
import Image from 'next/image';
import { GenealogyEngine } from '@/domain/inference/genealogy-engine';
import { useFamilyTreeRenderer } from '@/components/features/tree/family-tree-renderer';
import { exportTreeToPDF } from '@/lib/pdf-export';
import { toast } from 'sonner';

import { CoupleContainerNode } from '@/components/features/tree/couple-container-node';

const nodeTypes = { member: MemberNode, generationLane: GenerationLaneNode, familyJunction: FamilyJunctionNode, coupleContainer: CoupleContainerNode };
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden border-border bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Member Profile</DialogTitle>
        </DialogHeader>
        {/* Compact Cover */}
        <div className="h-24 sm:h-28 bg-muted relative overflow-hidden">
          {member.coverImage && (
            <Image src={member.coverImage} alt="" fill className="w-full h-full object-cover" unoptimized />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3 z-10">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-3 border-background overflow-hidden bg-muted flex items-center justify-center shadow-lg shrink-0 relative">
            <MemberAvatar 
              imageUrl={member.imageUrl} 
              firstName={member.firstName} 
              lastName={member.lastName} 
              gender={member.gender} 
              fallbackSize={32} 
            />
          </div>
          <div className="flex-1 min-w-0 pb-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-primary-foreground truncate leading-tight">
              {member.firstName} {member.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-sm text-xs font-medium text-primary-foreground">
                {generations.find((g: any) => g.id === member.generationId)?.name || 'Unnamed Generation'}
              </span>
              {member.deathDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/80 backdrop-blur-sm text-xs font-medium text-secondary-foreground">
                  🕊 In Loving Memory
                </span>
              )}
              {member.occupation && (
                <span className="text-xs text-primary-foreground/70 truncate">{member.occupation}</span>
              )}
              {age !== null && (
                <span className="text-xs text-primary-foreground/70">
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
                const p = members.find((m: any) => m.id === r.fromId);
                return p && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors cursor-default">
                    <Users className="w-3 h-3" />
                    Parent: {p.firstName}
                  </span>
                );
              })}
              {spouses.map((r: any) => {
                const s = members.find((m: any) => m.id === r.toId);
                return s && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20 hover:bg-accent/20 transition-colors cursor-default">
                    <Heart className="w-3 h-3" />
                    Spouse: {s.firstName}
                  </span>
                );
              })}
              {children.map((r: any) => {
                const c = members.find((m: any) => m.id === r.toId);
                return c && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border hover:bg-secondary/80 transition-colors cursor-default">
                    <Users className="w-3 h-3" />
                    Child: {c.firstName}
                  </span>
                );
              })}
              {siblings.map((r: any) => {
                const sibId = r.fromId === member.id ? r.toId : r.fromId;
                const sib = members.find((m: any) => m.id === sibId);
                return sib && (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border hover:bg-muted/80 transition-colors cursor-default">
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
      </DialogContent>
    </Dialog>
  );
}

function PublicTreeToolbar({ treeName }: { treeName: string }) {
  const { zoomIn, zoomOut, fitView, getNodes } = useReactFlow();

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col sm:flex-row items-end sm:items-center gap-3 print:hidden">
      <div className="flex items-center gap-1 p-1.5 bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-sm">
        <button
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          onClick={() => window.print()}
          title="Print Tree"
        >
          <Printer className="h-4 w-4" />
        </button>
        <button
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          onClick={() => {
            const nodes = getNodes();
            if (!nodes.length) {
              toast.error('No family members to export.');
              return;
            }
            toast.promise(exportTreeToPDF(treeName, nodes), {
              loading: 'Building family tree PDF…',
              success: 'PDF downloaded successfully!',
              error: (err: Error) => `Unable to generate PDF: ${err?.message ?? 'Please try again.'}`,
            });
          }}
          title="Download PDF"
        >
          <Download className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-border/80 mx-0.5" />
        <button
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          onClick={() => zoomIn({ duration: 300 })}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          onClick={() => zoomOut({ duration: 300 })}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          onClick={() => fitView({ duration: 500, padding: 0.2, maxZoom: 1 })}
          title="Fit View"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
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
      
      <PublicTreeToolbar treeName={treeData.name || 'family-tree'} />

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
      {/* Polished Public Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-card border-b border-border shadow-sm z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
            <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">FamilyTree</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Eye className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <span className="text-muted-foreground truncate max-w-[150px] sm:max-w-none">
              Viewing <span className="font-semibold text-foreground">{treeData.name}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Shared</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div id="public-tree-actions" className="flex items-center gap-2" />
          
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all hover:scale-105"
          >
            Create Your Own
          </Link>
        </div>
      </header>

      {/* Tree */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <PublicTreeCanvas treeData={treeData} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
