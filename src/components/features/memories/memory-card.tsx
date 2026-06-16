"use client";

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Memory } from './memory-gallery';

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string, publicId?: string) => Promise<void>;
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(memory.id, memory.publicId);
    } catch (e) {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 break-inside-avoid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {memory.publicId ? (
        <CldImage
          src={memory.publicId}
          width={600}
          height={600}
          crop="fill"
          gravity="auto"
          quality="auto"
          format="auto"
          alt={memory.caption || 'Family memory'}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={memory.url}
          alt={memory.caption || 'Family memory'}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end"
          >
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {memory.caption && (
              <p className="text-white font-medium text-sm mb-2 line-clamp-2">
                {memory.caption}
              </p>
            )}

            <div className="flex items-center gap-3 text-white/80 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(memory.createdAt), 'MMM d, yyyy')}</span>
              </div>
              {memory.eventTag && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{memory.eventTag}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
