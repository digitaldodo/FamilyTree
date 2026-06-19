"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryCard } from './memory-card';
import { UploadMemoryModal } from './upload-memory-modal';
import { Plus, Camera, LayoutGrid, Folders, Clock, X } from 'lucide-react';
import { staggerContainer, fadeUp } from '@/utils/animations';
import { CldImage } from 'next-cloudinary';

export interface Memory {
  id: string;
  url: string;
  publicId?: string;
  caption?: string | null;
  eventTag?: string | null;
  createdAt: Date;
}

interface MemoryGalleryProps {
  memberId: string;
  memories: Memory[];
  onUpload?: (url: string, publicId: string, caption?: string, eventTag?: string) => Promise<void>;
  onDelete?: (id: string, publicId?: string) => Promise<void>;
}

type Tab = 'gallery' | 'albums' | 'timeline';

export function MemoryGallery({ memberId, memories, onUpload, onDelete }: MemoryGalleryProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Derived state for albums
  const albums = useMemo(() => {
    const defaultAlbums = ['Wedding', 'Childhood', 'Family Events', 'Education', 'Career', 'Vacations'];
    const grouped = memories.reduce((acc, memory) => {
      const tag = memory.eventTag || 'Other';
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(memory);
      return acc;
    }, {} as Record<string, Memory[]>);

    // Sort so default albums that have photos come first
    const sortedAlbums: { name: string; memories: Memory[] }[] = [];
    defaultAlbums.forEach(name => {
      if (grouped[name]) {
        sortedAlbums.push({ name, memories: grouped[name] });
        delete grouped[name];
      }
    });

    Object.keys(grouped).forEach(name => {
      sortedAlbums.push({ name, memories: grouped[name] });
    });

    return sortedAlbums;
  }, [memories]);

  // Derived state for timeline
  const timelineMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [memories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-2xl text-foreground tracking-tight">Memories</h3>
          {onUpload && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Upload
            </button>
          )}
        </div>

        {/* Tabs */}
        {memories.length > 0 && (
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'gallery' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'albums' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Folders className="w-4 h-4" />
              Albums
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'timeline' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Clock className="w-4 h-4" />
              Timeline
            </button>
          </div>
        )}
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border mt-4">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-purple-400" />
          </div>
          <h4 className="text-lg font-bold mb-1">Preserve Family Moments</h4>
          <p className="text-muted-foreground/70 text-sm max-w-sm mb-6">
            Upload the first photo or create a memory album to start documenting their life story.
          </p>
          {onUpload && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
            >
              Upload first memory
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
              >
                {memories.map((memory) => (
                  <div key={memory.id} className="break-inside-avoid relative group overflow-hidden rounded-2xl shadow-sm">
                    <MemoryCard memory={memory} onDelete={onDelete} onClick={() => setSelectedMemory(memory)} />
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'albums' && (
              <motion.div
                key="albums"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {albums.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground italic">No albums created yet.</p>
                  </div>
                ) : (
                  albums.map(album => (
                    <div key={album.name} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold">{album.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {album.memories.length} {album.memories.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {album.memories.map(memory => (
                          <div key={memory.id} className="aspect-square rounded-2xl overflow-hidden shadow-sm relative group">
                            <MemoryCard memory={memory} onDelete={onDelete} compact onClick={() => setSelectedMemory(memory)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative pl-6 space-y-12 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-border"
              >
                {timelineMemories.map((memory, index) => (
                  <div key={memory.id} className="relative">
                    <div className="absolute -left-6 w-6 h-6 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-background" />
                    </div>
                    
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">
                        {new Date(memory.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                      </span>
                      {memory.eventTag && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
                          {memory.eventTag}
                        </span>
                      )}
                    </div>
                    
                    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-sm">
                      <MemoryCard memory={memory} onDelete={onDelete} onClick={() => setSelectedMemory(memory)} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox Viewer */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedMemory(null)}
          >
            <button
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              onClick={() => setSelectedMemory(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div 
              className="relative w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMemory.publicId ? (
                <CldImage
                  src={selectedMemory.publicId}
                  width={1920}
                  height={1080}
                  crop="fit"
                  gravity="auto"
                  quality="auto"
                  format="auto"
                  alt={selectedMemory.caption || 'Memory'}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <img
                  src={selectedMemory.url}
                  alt={selectedMemory.caption || 'Memory'}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
              )}
              {selectedMemory.caption && (
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white text-center rounded-b-xl">
                  <p className="text-lg font-medium drop-shadow-md">{selectedMemory.caption}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {onUpload && (
        <UploadMemoryModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={onUpload}
        />
      )}
    </div>
  );
}
