'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  MapPin,
  Users,
  Calendar,
  Link as LinkIcon,
  Edit,
  Trash2,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MemberAvatar } from '../members/member-avatar';
import { useAppStore } from '@/store/use-app-store';

interface MemoryDetailModalProps {
  memory: any | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (memory: any) => void;
  onDelete: (id: string) => void;
}

export function MemoryDetailModal({
  memory,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoryDetailModalProps) {
  const isReadOnly = useAppStore((s) => s.isReadOnly);

  if (!memory) return null;

  const canEdit = !isReadOnly;

  const safeMembers = Array.isArray(memory.members) ? memory.members : [];
  const safeMedia = Array.isArray(memory.media) ? memory.media : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none shadow-2xl bg-background modal-scroll">
        <div className="relative w-full h-[300px] md:h-[400px] bg-muted overflow-hidden">
          {safeMedia.length > 0 ? (
            <Image
              src={safeMedia[0].url}
              alt={memory.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900">
              <Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button handled by Dialog primitive, but we can add custom header actions here if needed */}

          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end text-white">
            <span className="text-sm font-bold tracking-widest text-primary uppercase mb-3">
              {format(new Date(memory.date), 'MMMM d, yyyy')}
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 font-serif leading-tight text-white drop-shadow-md">
              {memory.title}
            </h2>
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/90">
              {memory.location && (
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-white/70" />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-12">
          {/* Main Story Column */}
          <div className="flex-1 space-y-12">
            {memory.description && (
              <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none font-serif leading-relaxed text-foreground/90">
                <p className="whitespace-pre-wrap">{memory.description}</p>
              </div>
            )}

            {safeMedia.length > 1 && (
              <div className="space-y-6 pt-6 border-t border-border/50">
                <h3 className="font-semibold text-xl font-serif tracking-tight text-foreground">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {safeMedia.slice(1).map((media: any) => (
                    <div
                      key={media.id}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border shadow-sm group"
                    >
                      <Image
                        src={media.url}
                        alt="Memory photo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memory.googlePhotosAlbumUrl && (
              <div className="flex items-center p-5 bg-muted/50 rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mr-5 shadow-sm border border-border">
                  <LinkIcon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Google Photos Album</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    View the full collection of photos from this memory
                  </p>
                </div>
                <a
                  href={memory.googlePhotosAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-5 text-sm font-medium rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
                >
                  Open Album
                </a>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-72 space-y-8 shrink-0">
            {safeMembers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People Involved
                </h3>
                <div className="flex flex-col gap-3">
                  {safeMembers.map((m: any) => (
                    <div
                      key={m.member.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card shadow-sm hover:bg-muted/50 transition-colors"
                    >
                      <MemberAvatar
                        imageUrl={m.member.imageUrl || m.member.avatar}
                        firstName={m.member.firstName}
                        lastName={m.member.lastName}
                        fallbackSize={16}
                        className="w-10 h-10"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {m.member.firstName} {m.member.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memory.tags && memory.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {canEdit && (
              <div className="pt-6 border-t border-border flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 rounded-xl font-medium shadow-sm"
                  onClick={() => {
                    onClose();
                    onEdit(memory);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Memory
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 rounded-xl font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 shadow-sm transition-colors"
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure you want to delete this memory? This action cannot be undone.'
                      )
                    ) {
                      onDelete(memory.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Memory
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
