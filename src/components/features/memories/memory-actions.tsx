'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemoryFormModal } from '../timeline/memory-form-modal';
import { useMemories } from '@/hooks/use-memories';

export function MemoryActions({ memory, treeId }: { memory: any, treeId: string }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { updateMemory, deleteMemory } = useMemories(treeId);

  const handleUpdate = async (data: any) => {
    await updateMemory({ id: memory.id, data });
    setIsEditOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this memory?')) {
      await deleteMemory(memory.id);
      router.push('/dashboard/timeline');
    }
  };

  // Convert schema if needed for the form
  const formData = {
    ...memory,
    members: memory.members || []
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
      
      <MemoryFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={formData}
      />
    </>
  );
}
