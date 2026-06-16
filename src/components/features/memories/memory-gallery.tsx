"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryCard } from './memory-card';
import { UploadMemoryModal } from './upload-memory-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Image as ImageIcon, Plus } from 'lucide-react';
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
  onUpload?: (url: string, publicId: string, caption?: string, eventTag?: string) => Promise<void>;
  onDelete?: (id: string, publicId?: string) => Promise<void>;
}

export function MemoryGallery({ memberId, memories, onUpload, onDelete }: MemoryGalleryProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Memories</h3>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No memories yet"
          description="Upload photos to create a beautiful gallery for this family member."
          actionLabel="Upload First Memory"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {memories.map((memory) => (
              <motion.div key={memory.id} variants={fadeUp} layoutId={`memory-${memory.id}`}>
                <MemoryCard memory={memory} onDelete={onDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

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
