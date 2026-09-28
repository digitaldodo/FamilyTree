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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-xl">
        <div className="relative w-full h-[250px] bg-muted">
          {safeMedia.length > 0 ? (
            <Image
              src={safeMedia[0].url}
              alt={memory.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Calendar className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 flex flex-col justify-end text-white">
            <h2 className="text-xl font-semibold mb-2">{memory.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(memory.date), 'MMMM d, yyyy')}</span>
              </div>
              {memory.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {memory.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                <p className="whitespace-pre-wrap text-foreground">
                  {memory.description}
                </p>
              </div>
            )}

            {safeMedia.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-medium text-lg border-b pb-2">Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {safeMedia.slice(1).map((media: any) => (
                    <div
                      key={media.id}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={media.url}
                        alt="Memory photo"
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memory.googlePhotosAlbumUrl && (
              <div className="flex items-center p-4 bg-muted/50 rounded-lg border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4">
                  <LinkIcon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Google Photos Album</h4>
                  <p className="text-xs text-muted-foreground">
                    View all photos from this memory
                  </p>
                </div>
                <a
                  href={memory.googlePhotosAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Open Album
                </a>
              </div>
            )}
          </div>

          <div className="w-full md:w-64 space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                People Involved
              </h3>
              {safeMembers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {safeMembers.map((m: any) => (
                    <div
                      key={m.member.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                    >
                      <MemberAvatar
                        imageUrl={m.member.imageUrl || m.member.avatar}
                        firstName={m.member.firstName}
                        lastName={m.member.lastName}
                        fallbackSize={16}
                        className="w-8 h-8"
                      />
                      <span className="text-sm">
                        {m.member.firstName} {m.member.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No specific people tagged.
                </p>
              )}
            </div>

            {memory.tags && memory.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {canEdit && (
              <div className="pt-4 border-t flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
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
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
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
