'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Generation } from '@/types/member';

export type GenerationFormMode = 'rename' | 'addAbove' | 'addBelow' | 'createFirst';

interface GenerationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: GenerationFormMode;
  initialName?: string;
  targetGenerationId?: string;
  targetOrderIndex?: number;
  existingGenerations: Generation[];
  onSubmit: (name: string, insertAt?: number) => Promise<void>;
}

import { ErrorBoundary } from '@/components/ui/error-boundary';

export function GenerationFormModal({
  isOpen,
  onClose,
  mode,
  initialName = '',
  targetGenerationId,
  targetOrderIndex,
  existingGenerations,
  onSubmit,
}: GenerationFormModalProps) {
  const [name, setName] = React.useState(initialName);
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset state when opened/closed
  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError('');
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Generation name is required');
      return;
    }

    // Check for duplicates
    const isDuplicate = existingGenerations.some(
      g => g.name.toLowerCase() === trimmedName.toLowerCase() && g.id !== targetGenerationId
    );

    if (isDuplicate) {
      setError('A generation with this name already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      let insertAt: number | undefined;
      if (mode === 'addAbove' && targetOrderIndex !== undefined) {
        insertAt = targetOrderIndex;
      } else if (mode === 'addBelow' && targetOrderIndex !== undefined) {
        insertAt = targetOrderIndex + 1;
      }

      await onSubmit(trimmedName, insertAt);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'rename': return 'Rename Generation';
      case 'addAbove': return 'Add Generation Above';
      case 'addBelow': return 'Add Generation Below';
      case 'createFirst': return 'Create First Generation';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'rename': return 'Enter a new name for this generation.';
      case 'addAbove': return 'Create a new generation directly above this one.';
      case 'addBelow': return 'Create a new generation directly below this one.';
      case 'createFirst': return 'Start your family tree by naming the first generation.';
    }
  };

  return (
    <ErrorBoundary>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{getTitle()}</DialogTitle>
              <DialogDescription>
                {getDescription()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="generation-name">Name</Label>
                <Input
                  id="generation-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. Grandparents"
                  autoFocus
                  disabled={isSubmitting}
                />
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'rename' ? 'Save Changes' : 'Create Generation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
