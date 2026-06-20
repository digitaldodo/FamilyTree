"use client";

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Calendar, Tag, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { Memory } from './memory-gallery';
import { cn } from '@/lib/utils';

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string, publicId?: string) => Promise<void>;
  compact?: boolean;
  onClick?: () => void;
}

export function MemoryCard({ memory, onDelete, compact, onClick }: MemoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className={cn(
        "relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 break-inside-avoid",
        compact ? "h-full w-full" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
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
          className={cn("w-full object-cover transition-transform duration-500 group-hover:scale-105", compact ? "h-full" : "h-auto")}
        />
      ) : (
        <Image
          src={memory.url}
          alt={memory.caption || 'Family memory'}
          width={600}
          height={600}
          className={cn("w-full object-cover transition-transform duration-500 group-hover:scale-105", compact ? "h-full" : "h-auto")}
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
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end cursor-pointer"
          >
            {/* Top actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              {onClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="p-2 bg-black/20 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 bg-black/20 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {!compact && (
              <>
                {memory.caption && (
                  <p className="text-white font-medium text-sm mb-2 line-clamp-2 drop-shadow-md">
                    {memory.caption}
                  </p>
                )}

                <div className="flex items-center gap-3 text-white/90 text-xs drop-shadow-md">
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
