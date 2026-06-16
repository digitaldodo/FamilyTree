'use client';

// Reusable Modal Component
// TODO: Implement with Framer Motion AnimatePresence
// TODO: Add backdrop blur
// TODO: Add close on escape key
// TODO: Add close on backdrop click

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  if (!isOpen) return null;

  // TODO: Animate with Framer Motion
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* TODO: Backdrop */}
      <div onClick={onClose} />
      {/* TODO: Modal content */}
      <div>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
