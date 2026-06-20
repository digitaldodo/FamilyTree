'use client';

import { useAppStore } from '@/store/use-app-store';
import { useUserTrees } from '@/hooks/use-user-trees';
import { useMembers } from '@/hooks/use-members';
import { useGenerations } from '@/hooks/use-generations';
import { useSearchMembers } from '@/hooks/use-search-members';
import { useFilteredGenerations } from '@/hooks/use-filtered-generations';
import { MemberCard } from '@/components/features/members/member-card';
import { MemberModal } from '@/components/features/members/member-modal';
import { MemberSearch } from '@/components/features/members/member-search';
import { MemberFilter } from '@/components/features/members/member-filter';
import { ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, UserPlus, Plus, UsersRound, TreePine, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { MembersSkeleton } from '@/components/ui/members-skeleton';
import { GenerationDeleteModal } from '@/components/features/generations/generation-delete-modal';
import { GenerationFormModal, GenerationFormMode } from '@/components/features/generations/generation-form-modal';
import { GenerationActionMenu } from '@/components/features/generations/generation-action-menu';
import { useState, useEffect } from 'react';

import { ErrorBoundary } from '@/components/ui/error-boundary';

function MembersContent() {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const { userTrees } = useUserTrees();
  const activeTree = userTrees.find(t => t.id === activeTreeId);
  const userRole = activeTree?.role || null;
  const selectedGenerationIds = useAppStore(s => s.selectedGenerationIds);
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  const setSelectedMemberId = useAppStore(s => s.setSelectedMemberId);
  const setIsEditingMember = useAppStore(s => s.setIsEditingMember);
  const setDefaultGenerationForNewMember = useAppStore(s => s.setDefaultGenerationForNewMember);
  const { isLoading: membersLoading, fetchMembers } = useMembers();
  const { generations, isLoading: gensLoading, createGeneration, renameGeneration, deleteGeneration, moveGeneration } = useGenerations();
  const { filteredMembers } = useSearchMembers();

  const allGenerations = [...generations].sort((a, b) => a.orderIndex - b.orderIndex);
  const sortedGenerations = useFilteredGenerations(allGenerations, selectedGenerationIds);

  const [deleteModalGenId, setDeleteModalGenId] = useState<string | null>(null);
  const [formModalState, setFormModalState] = useState<{
    isOpen: boolean;
    mode: GenerationFormMode;
    initialName?: string;
    targetId?: string;
    targetOrderIndex?: number;
  }>({ isOpen: false, mode: 'createFirst' });

  const hasEditAccess = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'EDITOR';

  const handleAddMember = (genId?: string) => {
    setSelectedMemberId(null);
    setDefaultGenerationForNewMember(genId ?? null);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  const openFormModal = (mode: GenerationFormMode, options?: { initialName?: string; targetId?: string; targetOrderIndex?: number }) => {
    setFormModalState({
      isOpen: true,
      mode,
      ...options,
    });
  };

  const handleFormModalSubmit = async (name: string, insertAt?: number) => {
    if (formModalState.mode === 'rename' && formModalState.targetId) {
      await renameGeneration(formModalState.targetId, name);
    } else {
      await createGeneration(name, insertAt);
    }
  };

  const handleDeleteGenerationClick = async (id: string) => {
    const genMembers = filteredMembers.filter(m => m.generationId === id);
    if (genMembers.length === 0) {
      await deleteGeneration(id);
      fetchMembers();
    } else {
      setDeleteModalGenId(id);
    }
  };

  const handleMoveGeneration = async (id: string, direction: 'up' | 'down') => {
    await moveGeneration(id, direction);
  };

  const handleConfirmDelete = async (action?: 'moveMembers' | 'deleteMembers', targetId?: string) => {
    if (!deleteModalGenId) return;
    await deleteGeneration(deleteModalGenId, action, targetId);
    setDeleteModalGenId(null);
    fetchMembers(); // refresh members because some might have been moved or deleted
  };

  if (!activeTreeId) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={TreePine}
          title="Select a Family Tree"
          description="Choose a family tree from the sidebar to view its members."
        />
      </div>
    );
  }
  const isLoading = membersLoading || gensLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col pb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Members</h1>
          <p className="text-muted-foreground mt-1">Your family tree, organized by generation.</p>
        </div>
        {hasEditAccess && (
          <>
            <Button className="hidden md:flex shrink-0" onClick={() => {
              if (allGenerations.length === 0) {
                const name = prompt('Enter first generation name (e.g. Founders):');
                if (name) createGeneration(name);
              } else {
                handleAddMember();
              }
            }}>
              {allGenerations.length === 0 ? <TreePine className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {allGenerations.length === 0 ? 'Create First Generation' : 'Add Member'}
            </Button>
            {/* Mobile FAB */}
            <Button 
              className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-30 p-0 flex items-center justify-center bg-primary text-primary-foreground" 
              onClick={() => {
                if (allGenerations.length === 0) {
                  openFormModal('createFirst');
                } else {
                  handleAddMember();
                }
              }}
            >
              {allGenerations.length === 0 ? <TreePine className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        <div className="w-full md:w-auto flex-1">
          <MemberSearch />
        </div>
        <div className="w-full md:w-auto">
          <MemberFilter />
        </div>
      </div>

      {isLoading ? (
        <MembersSkeleton />
      ) : allGenerations.length === 0 ? (
        <div className="py-12">
          <EmptyState 
            icon={UsersRound}
            title="No generations added yet"
            description="Start building your family tree by creating the first generation."
            actionLabel={hasEditAccess ? "Create First Generation" : undefined}
            onAction={hasEditAccess ? () => openFormModal('createFirst') : undefined}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGenerations.map((gen, idx) => {
            const genMembers = filteredMembers.filter(m => m.generationId === gen.id);
            
            return (
              <section key={gen.id} className="relative">
                {/* Connector line between generations */}
                {idx > 0 && (
                  <div className="absolute left-8 -top-2 w-px h-4 bg-border" aria-hidden="true" />
                )}

                {/* Generation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h2 className="text-sm font-semibold text-foreground">
                      {gen.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums mr-2 hidden sm:inline-block">
                      {genMembers.length} {genMembers.length === 1 ? 'member' : 'members'}
                    </span>
                    {hasEditAccess && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAddMember(gen.id)}>
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          <span className="hidden sm:inline">Add Member</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                        <Button variant="outline" size="sm" className="hidden lg:flex h-7 text-xs" onClick={() => openFormModal('addAbove', { targetOrderIndex: gen.orderIndex })}>
                          <ArrowUpToLine className="w-3.5 h-3.5 mr-1" />
                          Add Above
                        </Button>
                        <Button variant="outline" size="sm" className="hidden lg:flex h-7 text-xs" onClick={() => openFormModal('addBelow', { targetOrderIndex: gen.orderIndex })}>
                          <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
                          Add Below
                        </Button>
                        <Button variant="outline" size="sm" className="hidden sm:flex h-7 text-xs" onClick={() => openFormModal('rename', { initialName: gen.name, targetId: gen.id })}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Rename
                        </Button>
                        <Button variant="outline" size="sm" className="hidden sm:flex h-7 text-xs text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleDeleteGenerationClick(gen.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                        <GenerationActionMenu
                          generation={gen}
                          index={idx}
                          totalGenerations={sortedGenerations.length}
                          onAddAbove={() => openFormModal('addAbove', { targetOrderIndex: gen.orderIndex })}
                          onAddBelow={() => openFormModal('addBelow', { targetOrderIndex: gen.orderIndex })}
                          onRename={() => openFormModal('rename', { initialName: gen.name, targetId: gen.id })}
                          onMoveUp={() => handleMoveGeneration(gen.id, 'up')}
                          onMoveDown={() => handleMoveGeneration(gen.id, 'down')}
                          onDelete={() => handleDeleteGenerationClick(gen.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Generation Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4 min-h-[140px]">
                  {genMembers.length === 0 ? (
                    <div className="col-span-full w-full rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <UsersRound className="w-8 h-8 text-muted-foreground/50 mb-3" />
                      <p className="text-base font-medium text-foreground mb-1">No members yet</p>
                      <p className="text-sm mb-4">Add the first member to this generation</p>
                      {hasEditAccess && (
                        <Button variant="outline" onClick={() => handleAddMember(gen.id)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add First Member
                        </Button>
                      )}
                    </div>
                  ) : (
                    genMembers.map((member) => (
                      <div key={member.id} className="w-full">
                        <MemberCard member={member} calculatedGeneration={idx} />
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <MemberModal />
      <GenerationFormModal
        isOpen={formModalState.isOpen}
        onClose={() => setFormModalState(prev => ({ ...prev, isOpen: false }))}
        mode={formModalState.mode}
        initialName={formModalState.initialName}
        targetGenerationId={formModalState.targetId}
        targetOrderIndex={formModalState.targetOrderIndex}
        existingGenerations={sortedGenerations}
        onSubmit={handleFormModalSubmit}
      />
      <GenerationDeleteModal
        isOpen={!!deleteModalGenId}
        onClose={() => setDeleteModalGenId(null)}
        onConfirm={handleConfirmDelete}
        generation={generations.find(g => g.id === deleteModalGenId) || null}
        memberCount={filteredMembers.filter(m => m.generationId === deleteModalGenId).length}
        availableGenerations={sortedGenerations}
      />
    </div>
  );
}

export default function MembersPage() {
  return (
    <ErrorBoundary>
      <MembersContent />
    </ErrorBoundary>
  );
}
