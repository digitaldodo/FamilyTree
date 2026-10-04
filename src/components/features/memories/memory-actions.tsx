'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MemoryFormModal } from '../timeline/memory-form-modal';
import { useMemories } from '@/hooks/use-memories';

export function MemoryActions({ memory, treeId }: { memory: any, treeId: string }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { updateMemory, deleteMemory } = useMemories(treeId);

  const handleUpdate = async (data: any) => {
    await updateMemory({ id: memory.id, data });
    setIsEditOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // Server verifies permission; hook invalidates memory queries and toasts success
      await deleteMemory(memory.id);
      setIsDeleteOpen(false);
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      // Memory is untouched; keep the dialog open with a useful message
      setDeleteError(err?.message || 'Could not delete this memory. Please try again.');
    } finally {
      setIsDeleting(false);
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
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => { setDeleteError(null); setIsDeleteOpen(true); }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Memory
        </Button>
      </div>
      
      <MemoryFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={formData}
      />

      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!isDeleting) setIsDeleteOpen(open); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
            <DialogDescription>
              This will permanently remove this memory and its associated data.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete Memory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
