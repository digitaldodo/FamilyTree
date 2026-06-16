"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryCard } from './memory-card';
import { UploadMemoryModal } from './upload-memory-modal';
import { Image as ImageIcon, Plus, Camera } from 'lucide-react';
import { staggerContainer, fadeUp } from '@/utils/animations';

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
  compact?: boolean;
  readOnly?: boolean;
  onUpload?: (url: string, publicId: string, caption?: string, eventTag?: string) => Promise<void>;
  onDelete?: (id: string, publicId?: string) => Promise<void>;
}

export function MemoryGallery({ memberId, memories, compact = false, readOnly = false, onUpload, onDelete }: MemoryGalleryProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-foreground ${compact ? 'text-xs uppercase tracking-wider text-muted-foreground' : 'text-xl'}`}>
          Memories
        </h3>
        {!readOnly && onUpload && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center gap-1.5 font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-sm ${
              compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'
            }`}
          >
            <Plus className={compact ? "w-3 h-3" : "w-4 h-4"} />
            {compact ? 'Add' : 'Add Memory'}
          </button>
        )}
      </div>

      {memories.length === 0 ? (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-10'}`}>
          <div className={`rounded-full bg-primary/5 flex items-center justify-center mb-3 ${
            compact ? 'w-12 h-12' : 'w-16 h-16'
          }`}>
            <Camera className={`text-primary/30 ${compact ? 'w-5 h-5' : 'w-8 h-8'}`} />
          </div>
          <p className={`font-medium text-muted-foreground/70 ${compact ? 'text-xs' : 'text-sm'}`}>
            No memories captured yet
          </p>
          <p className={`text-muted-foreground/50 mt-0.5 max-w-xs ${compact ? 'text-[11px]' : 'text-xs'}`}>
            Every photo tells a story — start preserving your family moments
          </p>
          {!readOnly && onUpload && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-3 px-4 py-1.5 text-xs font-medium text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
            >
              Upload first memory
            </button>
          )}
        </div>
      ) : compact ? (
        // Compact masonry grid for modal view
        <div className="grid grid-cols-3 gap-2">
          {memories.slice(0, 6).map((memory) => (
            <div key={memory.id} className="aspect-square rounded-xl overflow-hidden bg-muted group cursor-pointer">
              {memory.publicId ? (
                <img
                  src={memory.url}
                  alt={memory.caption || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <img
                  src={memory.url}
                  alt={memory.caption || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        // Full masonry layout
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {memories.map((memory) => (
              <motion.div key={memory.id} variants={fadeUp} layoutId={`memory-${memory.id}`}>
                <MemoryCard memory={memory} onDelete={readOnly ? undefined : onDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {compact && memories.length > 6 && (
        <p className="text-xs text-center text-muted-foreground">
          +{memories.length - 6} more memories
        </p>
      )}

      {!readOnly && onUpload && (
        <UploadMemoryModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={onUpload}
        />
      )}
    </div>
  );
}
