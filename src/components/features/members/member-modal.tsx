'use client';

import { Modal } from '@/components/ui/modal';
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
  ImageIcon,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberForm } from './member-form';
import { MemberDeleteDialog } from './member-delete-dialog';
import { useMemberMutations } from '@/hooks/use-member-mutations';
import { MemoryGallery, Memory } from '../memories/memory-gallery';
import * as React from 'react';

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
  const { createMember, updateMember, deleteMember, isSubmitting } =
    useMemberMutations();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const member = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId)
    : undefined;

  if (!member && !isEditingMember) return null;

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
  const spouses =
    member?.relationsFrom.filter((r) => r.type === 'SPOUSE') || [];
  const parents =
    member?.relationsTo.filter((r) => r.type === 'PARENT') || [];
  const children =
    member?.relationsFrom.filter((r) => r.type === 'PARENT') || [];
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

  return (
    <>
      <Modal
        isOpen={isMemberModalOpen}
        onClose={handleClose}
        className="max-w-2xl w-full p-0 overflow-hidden"
      >
        {/* ── Compact Cover with Avatar Overlay ── */}
        <div className="h-24 sm:h-28 bg-gradient-to-br from-primary/30 via-purple-500/20 to-rose-500/10 relative overflow-hidden">
          {member?.coverImage && (
            <img
              src={member.coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          {/* Dark gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Avatar + Name Overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-3 border-white/90 dark:border-zinc-800 overflow-hidden bg-muted flex items-center justify-center shadow-lg shrink-0">
              {member?.avatar ? (
                <img
                  src={member.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User2 className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-0.5">
              {member && !isEditingMember && (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate leading-tight">
                    {member.firstName} {member.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white/90">
                      Gen {member.generation}
                    </span>
                    {member.occupation && (
                      <span className="text-xs text-white/70 truncate">
                        {member.occupation}
                      </span>
                    )}
                    {age !== null && (
                      <span className="text-xs text-white/70">
                        {member.deathDate
                          ? `Lived ${age} years`
                          : `${age} years old`}
                      </span>
                    )}
                  </div>
                </>
              )}
              {isEditingMember && (
                <h2 className="text-lg font-bold text-white">
                  {member ? 'Edit Member' : 'Add New Member'}
                </h2>
              )}
            </div>

            {/* Action Buttons */}
            {!isEditingMember && member && !readOnly && (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setIsEditingMember(true)}
                  className="p-2 rounded-xl bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
                  aria-label="Edit member"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="p-2 rounded-xl bg-white/15 backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-colors"
                  aria-label="Delete member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="px-5 py-4 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto space-y-5">
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
              <>
                {/* ── Bio ── */}
                {member.bio ? (
                  <div>
                    <p className="text-sm leading-relaxed text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                      {member.bio}
                    </p>
                  </div>
                ) : (
                  !readOnly && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/60 italic">
                      <span>No biography yet — </span>
                      <button
                        onClick={() => setIsEditingMember(true)}
                        className="text-primary hover:underline"
                      >
                        add one
                      </button>
                    </div>
                  )
                )}

                {/* ── Details Grid ── */}
                <div className="grid grid-cols-2 gap-3">
                  {member.birthDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Born:</span>
                      <span className="font-medium">
                        {new Date(member.birthDate).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  )}
                  {member.deathDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Passed:</span>
                      <span className="font-medium">
                        {new Date(member.deathDate).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  )}
                  {member.gender && (
                    <div className="flex items-center gap-2 text-sm">
                      <User2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-medium capitalize">
                        {member.gender.toLowerCase()}
                      </span>
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

                {/* ── Relationship Chips ── */}
                {hasRelationships && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      Family
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {parents.map((r) => {
                        const p = members.find((m) => m.id === r.fromId);
                        return (
                          p && (
                            <button
                              key={r.id}
                              onClick={() => navigateToMember(p.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 hover:scale-[1.03] transition-all cursor-pointer"
                            >
                              <Users className="w-3 h-3" />
                              Parent: {p.firstName}
                            </button>
                          )
                        );
                      })}
                      {spouses.map((r) => {
                        const s = members.find((m) => m.id === r.toId);
                        return (
                          s && (
                            <button
                              key={r.id}
                              onClick={() => navigateToMember(s.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200/50 dark:border-rose-800/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:scale-[1.03] transition-all cursor-pointer"
                            >
                              <Heart className="w-3 h-3" />
                              Spouse: {s.firstName}
                            </button>
                          )
                        );
                      })}
                      {children.map((r) => {
                        const c = members.find((m) => m.id === r.toId);
                        return (
                          c && (
                            <button
                              key={r.id}
                              onClick={() => navigateToMember(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:scale-[1.03] transition-all cursor-pointer"
                            >
                              <Users className="w-3 h-3" />
                              Child: {c.firstName}
                            </button>
                          )
                        );
                      })}
                      {siblings.map((r) => {
                        const sibId =
                          r.fromId === member.id ? r.toId : r.fromId;
                        const sib = members.find((m) => m.id === sibId);
                        return (
                          sib && (
                            <button
                              key={r.id}
                              onClick={() => navigateToMember(sib.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:scale-[1.03] transition-all cursor-pointer"
                            >
                              <Users className="w-3 h-3" />
                              Sibling: {sib.firstName}
                            </button>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty Relationships State */}
                {!hasRelationships && !readOnly && (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground/60">
                      No family connections yet
                    </p>
                    <button
                      onClick={() => setIsEditingMember(true)}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Add relationships
                    </button>
                  </div>
                )}

                {/* ── Memories Section ── */}
                <div className="pt-4 border-t border-border/50">
                  {readOnly ? (
                    // Read-only memory preview
                    memories.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                          Memories
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {memories.slice(0, 6).map((m: any) => (
                            <div
                              key={m.id}
                              className="aspect-square rounded-xl overflow-hidden bg-muted"
                            >
                              <img
                                src={m.url}
                                alt={m.caption || ''}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                        {memories.length > 6 && (
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            +{memories.length - 6} more memories
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Camera className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground/50 italic">
                          No memories captured yet
                        </p>
                      </div>
                    )
                  ) : (
                    <MemoryGallery
                      memberId={member.id}
                      memories={memories}
                      compact
                      onUpload={async (url, publicId, caption, eventTag) => {
                        console.log('Upload memory', url, publicId);
                      }}
                      onDelete={async (id) => {
                        console.log('Delete memory', id);
                      }}
                    />
                  )}
                </div>
              </>
            )
          )}
        </div>
      </Modal>

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
