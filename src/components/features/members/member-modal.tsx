'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import {
  User2,
  Calendar,
  Edit2,
  Trash2,
  MapPin,
  Briefcase,
  Heart,
  Users,
  Camera,
  X
} from 'lucide-react';
import { MemberForm } from './member-form';
import { MemberDeleteDialog } from './member-delete-dialog';
import { useMemberMutations } from '@/hooks/use-member-mutations';
import { MemoryGallery, Memory } from '../memories/memory-gallery';
import { getGenerationLabel } from '@/utils/date';
import { toast } from 'sonner';

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
  const { members } = useMembers();
  const { generations } = useAppStore();
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
    ? generations.find(g => g.id === member.generationId)
    : undefined;
  
  const memberGenIndex = memberGeneration ? generations.findIndex(g => g.id === memberGeneration.id) : 0;
  const totalGenerations = generations.length;

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

  // Build relationship data
  const spouses = member?.relationsFrom.filter((r) => r.type === 'SPOUSE') || [];
  const parents = member?.relationsTo.filter((r) => r.type === 'PARENT') || [];
  const children = member?.relationsFrom.filter((r) => r.type === 'PARENT') || [];
  const siblings = [
    ...(member?.relationsFrom.filter((r) => r.type === 'SIBLING') || []),
    ...(member?.relationsTo.filter((r) => r.type === 'SIBLING') || []),
  ];
  const hasRelationships =
    spouses.length > 0 ||
    parents.length > 0 ||
    children.length > 0 ||
    siblings.length > 0;
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
      y: isMobile ? '100%' : 0 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    exit: { 
      opacity: 0, 
      x: isMobile ? 0 : '100%', 
      y: isMobile ? '100%' : 0,
      transition: { type: 'tween', duration: 0.2 }
    }
  };

  return (
    <>
      <AnimatePresence>
        {(isMemberModalOpen && (member || isEditingMember)) && (
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
              className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 z-50 w-full md:w-[600px] h-[90vh] md:h-screen bg-background md:border-l border-border shadow-2xl flex flex-col rounded-t-3xl md:rounded-none overflow-hidden"
            >
              {/* ── Premium Cover & Header ── */}
              <div className="relative h-48 md:h-64 shrink-0 bg-gradient-to-br from-primary/30 via-purple-500/20 to-rose-500/10">
                {member?.coverImage && (
                  <img
                    src={member.coverImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Dark gradient overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Close Button */}
                <button 
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Avatar + Name Overlay */}
                <div className="absolute -bottom-6 left-6 right-6 flex items-end gap-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-background overflow-hidden bg-muted flex items-center justify-center shadow-xl shrink-0 relative z-10">
                    {member?.avatar ? (
                      <img
                        src={member.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User2 className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pb-8 md:pb-10 relative z-10">
                    {member && !isEditingMember && (
                      <>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground truncate leading-tight tracking-tight">
                          {member.firstName} {member.lastName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
                            Gen {memberGenIndex + 1} · {getGenerationLabel(member.birthDate) || memberGeneration?.name || 'Unknown'}
                          </span>
                          {age !== null && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {member.deathDate
                                ? `Lived ${age} years`
                                : `${age} years old`}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    {isEditingMember && (
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        {member ? 'Edit Member' : 'Add New Member'}
                      </h2>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditingMember && member && !readOnly && (
                    <div className="flex gap-2 pb-8 md:pb-10 shrink-0 relative z-10">
                      <button
                        onClick={() => setIsEditingMember(true)}
                        className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-sm"
                        aria-label="Edit member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                        aria-label="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Scrollable Content ── */}
              <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8 modal-scroll">
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
                                className="text-purple-500 hover:underline font-medium"
                              >
                                add one
                              </button>
                            </>
                          )}
                        </p>
                      )}

                      {/* ── Details Grid ── */}
                      <div className="grid grid-cols-2 gap-4">
                        {member.birthDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Born</span>
                              <span className="text-sm font-semibold">
                                {new Date(member.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        )}
                        {member.deathDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Passed</span>
                              <span className="text-sm font-semibold">
                                {new Date(member.deathDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        )}
                        {member.address && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                              <span className="text-sm font-semibold truncate">{member.address}</span>
                            </div>
                          </div>
                        )}
                        {member.occupation && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                              <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Occupation</span>
                              <span className="text-sm font-semibold truncate">{member.occupation}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Relationships ── */}
                      <div>
                        <h3 className="text-lg font-bold mb-4">Family Connections</h3>
                        
                        {hasRelationships ? (
                          <div className="space-y-4">
                            {parents.length > 0 && (
                              <div>
                                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parents</h4>
                                <div className="flex flex-wrap gap-2">
                                  {parents.map((r) => {
                                    const p = members.find((m) => m.id === r.fromId);
                                    if (!p) return null;
                                    return (
                                      <div key={r.id} onClick={() => navigateToMember(p.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
                                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                          {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 m-2 text-muted-foreground" />}
                                        </div>
                                        <span className="text-sm font-medium">{p.firstName} {p.lastName}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {spouses.length > 0 && (
                              <div>
                                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Spouses</h4>
                                <div className="flex flex-wrap gap-2">
                                  {spouses.map((r) => {
                                    const s = members.find((m) => m.id === r.toId);
                                    if (!s) return null;
                                    return (
                                      <div key={r.id} onClick={() => navigateToMember(s.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer transition-colors border border-rose-200/50 dark:border-rose-800/30">
                                        <div className="w-8 h-8 rounded-full bg-rose-200/50 dark:bg-rose-900/50 overflow-hidden flex items-center justify-center">
                                          {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : <Heart className="w-4 h-4 text-rose-500" />}
                                        </div>
                                        <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {children.length > 0 && (
                              <div>
                                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Children</h4>
                                <div className="flex flex-wrap gap-2">
                                  {children.map((r) => {
                                    const c = members.find((m) => m.id === r.toId);
                                    if (!c) return null;
                                    return (
                                      <div key={r.id} onClick={() => navigateToMember(c.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
                                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                          {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 m-2 text-muted-foreground" />}
                                        </div>
                                        <span className="text-sm font-medium">{c.firstName} {c.lastName}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {siblings.length > 0 && (
                              <div>
                                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Siblings</h4>
                                <div className="flex flex-wrap gap-2">
                                  {siblings.map((r) => {
                                    const sibId = r.fromId === member.id ? r.toId : r.fromId;
                                    const sib = members.find((m) => m.id === sibId);
                                    if (!sib) return null;
                                    return (
                                      <div key={r.id} onClick={() => navigateToMember(sib.id)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors border border-border">
                                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                          {sib.avatar ? <img src={sib.avatar} alt="" className="w-full h-full object-cover" /> : <User2 className="w-4 h-4 m-2 text-muted-foreground" />}
                                        </div>
                                        <span className="text-sm font-medium">{sib.firstName} {sib.lastName}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          !readOnly && (
                            <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="text-sm font-medium text-muted-foreground">No family connections yet</p>
                              <button onClick={() => setIsEditingMember(true)} className="text-sm text-purple-500 hover:underline mt-1">
                                Add relationships
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      {/* ── Memories Section ── */}
                      <div>
                        {readOnly ? (
                          memories.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-bold mb-4">Memories</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {memories.slice(0, 6).map((m: any) => (
                                  <div key={m.id} className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-sm">
                                    <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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
                              <p className="text-sm text-muted-foreground/50 italic">No memories uploaded yet</p>
                            </div>
                          )
                        ) : (
                          <MemoryGallery
                            memberId={member.id}
                            memories={memories}
                            onUpload={async (url, publicId, caption, eventTag) => {
                              toast.info('Memory uploading is coming soon!', { icon: '📸' });
                            }}
                            onDelete={async (id) => {
                              toast.info('Memory deletion is coming soon!', { icon: '🗑️' });
                            }}
                          />
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

