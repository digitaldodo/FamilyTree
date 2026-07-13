'use client';

import { useEffect, useState } from 'react';
import { CreateTreeModal } from '@/components/features/tree/create-tree-modal';

export function CreateTreeModalHost() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openModal = () => setIsOpen(true);
    window.addEventListener('open-create-tree-modal', openModal);
    return () => window.removeEventListener('open-create-tree-modal', openModal);
  }, []);

  return (
    <CreateTreeModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
