'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay — uses onPointerDown to prevent accidental close from drags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={(e) => {
              // Only close if the pointer event target IS the overlay itself
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Modal dialog'}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'pointer-events-auto relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl border border-border glass',
                className
              )}
            >
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/90 hover:bg-black/40 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close dialog"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute right-3 top-3 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/90 hover:bg-black/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Close dialog"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
