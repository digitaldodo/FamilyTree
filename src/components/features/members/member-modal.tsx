'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { Edit2, Trash2, Camera, X } from 'lucide-react';
import { MemberForm } from './member-form';
import { MemberDeleteDialog } from './member-delete-dialog';
import { useMemberMutations } from '@/hooks/use-member-mutations';
import { type Memory } from '../memories/memory-gallery';
import { getGenerationLabel } from '@/utils/date';
import { MemberDetails } from './member-details';
import { MemberRelationships } from './member-relationships';
import Image from 'next/image';
import { MemberAvatar } from './member-avatar';

interface MemberModalProps {
  readOnly?: boolean;
}

export function MemberModal({ readOnly = false }: MemberModalProps) {
  const {
    isMemberModalOpen,
    setIsMemberModalOpen,
    selectedMemberId,
    setSelectedMemberId,
    isEditingMember,
    setIsEditingMember,
  } = useAppStore();
  const { members, generations } = useMembers();
  const { createMember, updateMember, deleteMember, isSubmitting } =
    useMemberMutations();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMemberModalOpen(false);
        setIsEditingMember(false);
      }
    };
    if (isMemberModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMemberModalOpen, setIsMemberModalOpen, setIsEditingMember]);

  const member = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId)
    : undefined;

  const memberGeneration = member
    ? generations.find((g) => g.id === member.generationId)
    : undefined;

  const memberGenIndex = memberGeneration
    ? generations.findIndex((g) => g.id === memberGeneration.id)
    : 0;

  const handleClose = () => {
    setIsMemberModalOpen(false);
    setIsEditingMember(false);
  };

  const handleSubmit = async (data: any) => {
    if (member) {
      await updateMember(member.id, data);
    } else {
      await createMember(data);
    }
  };

  const handleDelete = async () => {
    if (member) {
      await deleteMember(member.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Calculate age
  const getAge = () => {
    if (!member?.birthDate) return null;
    const birth = new Date(member.birthDate);
    const end = member.deathDate ? new Date(member.deathDate) : new Date();
    return Math.floor(
      (end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
  };

  const age = getAge();
  const memories: Memory[] =
    (member as any)?.media?.filter((m: any) => m.type === 'image') || [];

  // Navigate to a related member
  const navigateToMember = (id: string) => {
    setSelectedMemberId(id);
  };

  // Mobile check for animation
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const drawerVariants = {
    hidden: {
      opacity: 0,
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 },
    },
    exit: {
      opacity: 0,
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
      transition: { type: 'tween', duration: 0.2 },
    },
  } satisfies Variants;

  return (
    <>
      <AnimatePresence>
        {isMemberModalOpen && (member || isEditingMember) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Drawer */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 z-50 w-full md:w-[520px] h-[90vh] md:h-screen bg-background md:border-l border-border shadow-lg flex flex-col rounded-t-2xl md:rounded-none overflow-hidden"
            >
              {/* ── Header ── */}
              <div className="relative shrink-0 bg-card border-b border-border p-6 flex flex-col md:flex-row md:items-center gap-4">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-md bg-transparent hover:bg-muted text-muted-foreground transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 w-full pt-4 md:pt-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    <MemberAvatar
                      imageUrl={member?.imageUrl}
                      firstName={member?.firstName}
                      lastName={member?.lastName}
                      gender={member?.gender}
                      fallbackSize={32}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    {member && !isEditingMember && (
                      <>
                        <h2 className="text-xl font-semibold text-foreground truncate">
                          {member.firstName} {member.lastName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                            Gen {memberGenIndex + 1} ·{' '}
                            {getGenerationLabel(member.birthDate) ||
                              memberGeneration?.name ||
                              'Unknown'}
                          </span>
                          {member.deathDate && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                              🕊 In Loving Memory
                            </span>
                          )}
                          {age !== null && (
                            <span className="text-xs text-muted-foreground">
                              {member.deathDate
                                ? `Age at Passing ${age} years`
                                : `${age} years old`}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    {isEditingMember && (
                      <h2 className="text-xl font-semibold text-foreground">
                        {member ? 'Edit Member' : 'Add New Member'}
                      </h2>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditingMember && member && !readOnly && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setIsEditingMember(true)}
                        className="p-2 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shadow-sm"
                        aria-label="Edit member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shadow-sm"
                        aria-label="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Scrollable Content ── */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8 modal-scroll">
                {isEditingMember ? (
                  <div>
                    <MemberForm
                      member={member}
                      onSubmit={handleSubmit}
                      onCancel={handleClose}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                ) : (
                  member && (
                    <div className="space-y-8">
                      {/* ── Bio ── */}
                      {member.bio ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-[15px] leading-relaxed text-muted-foreground/90">
                            {member.bio}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          No bio added yet
                          {!readOnly && (
                            <>
                              {' — '}
                              <button
                                onClick={() => setIsEditingMember(true)}
                                className="text-foreground underline font-medium"
                              >
                                add one
                              </button>
                            </>
                          )}
                        </p>
                      )}

                      {/* ── Details Grid ── */}
                      <MemberDetails member={member} />

                      {/* ── Relationships ── */}
                      <MemberRelationships
                        member={member}
                        members={members}
                        onNavigateToMember={navigateToMember}
                        readOnly={readOnly}
                        onAddRelationshipsClick={() => setIsEditingMember(true)}
                      />

                      {/* ── Memories Section ── */}
                      <div>
                        {readOnly ? (
                          memories.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-medium mb-4">
                                Memories
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {memories.slice(0, 6).map((m: any) => (
                                  <div
                                    key={m.id}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-muted shadow-sm"
                                  >
                                    <Image
                                      src={m.url}
                                      alt={m.caption || ''}
                                      fill
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                      unoptimized
                                    />
                                  </div>
                                ))}
                              </div>
                              {memories.length > 6 && (
                                <p className="text-sm font-medium text-muted-foreground text-center mt-4">
                                  +{memories.length - 6} more memories
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Camera className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground/50 italic">
                                No memories uploaded yet
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border/50">
                            <Camera className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                            <h4 className="text-sm font-medium text-foreground">
                              Memory Uploads
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                              The memory upload feature is currently under
                              construction. Check back soon!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {member && !readOnly && (
        <MemberDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          memberName={`${member.firstName} ${member.lastName}`}
        />
      )}
    </>
  );
}
