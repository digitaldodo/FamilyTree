'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Generation } from '@/types/member';
import { Loader2, AlertTriangle } from 'lucide-react';

interface GenerationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action?: 'moveMembers' | 'deleteMembers', targetId?: string) => Promise<void>;
  generation: Generation | null;
  memberCount: number;
  availableGenerations: Generation[];
}

export function GenerationDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  generation,
  memberCount,
  availableGenerations,
}: GenerationDeleteModalProps) {
  const [action, setAction] = useState<'moveMembers' | 'deleteMembers'>('moveMembers');
  const [targetId, setTargetId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherGenerations = availableGenerations.filter(g => g.id !== generation?.id);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (memberCount > 0) {
        await onConfirm(action, action === 'moveMembers' ? targetId : undefined);
      } else {
        await onConfirm(); // empty generation can just be deleted
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!generation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Generation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the generation <strong>{generation.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {memberCount > 0 ? (
            <div className="space-y-4">
              <div className="bg-amber-500/15 text-amber-600 dark:text-amber-500 p-3 rounded-md flex gap-3 items-start text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>
                  This generation contains <strong>{memberCount}</strong> {memberCount === 1 ? 'member' : 'members'}. 
                  You must choose what to do with them before deleting.
                </p>
              </div>

              <RadioGroup value={action} onValueChange={(val: any) => setAction(val)} className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="moveMembers" id="move" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="move" className="font-medium cursor-pointer">Move members to another generation</Label>
                    <p className="text-xs text-muted-foreground">Keep the members but assign them to a different generation.</p>
                    {action === 'moveMembers' && (
                      <Select value={targetId} onValueChange={setTargetId}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Select target generation" />
                        </SelectTrigger>
                        <SelectContent>
                          {otherGenerations.length === 0 ? (
                            <SelectItem value="none" disabled>No other generations available</SelectItem>
                          ) : (
                            otherGenerations.map(gen => (
                              <SelectItem key={gen.id} value={gen.id}>
                                {gen.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t pt-3">
                  <RadioGroupItem value="deleteMembers" id="delete" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="delete" className="font-medium text-destructive cursor-pointer">Delete generation and members</Label>
                    <p className="text-xs text-muted-foreground">This will permanently delete these members and their relationships.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <p className="text-sm">This generation is empty and will be safely removed. Subsequent generations will shift up.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant={memberCount > 0 && action === 'deleteMembers' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isSubmitting || (memberCount > 0 && action === 'moveMembers' && (!targetId || targetId === 'none'))}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Generation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
