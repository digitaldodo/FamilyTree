'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface MemberDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  memberName: string;
}

export function MemberDeleteDialog({ isOpen, onClose, onConfirm, memberName }: MemberDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Delete Member">
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Are you sure?</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            You are about to delete <strong>{memberName}</strong>. This will also remove any existing relationships tied to this member. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-4 w-full justify-end">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
