'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TreePine } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/use-app-store';

interface CreateTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTreeModal({ isOpen, onClose }: CreateTreeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setActiveTreeId, setUserRole, userTrees, setUserTrees } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, isPublic }),
      });

      if (!res.ok) throw new Error('Failed to create tree');

      const newTree = await res.json();

      const treeSummary = {
        id: newTree.id,
        name: newTree.name,
        description: newTree.description,
        isPublic: newTree.isPublic,
        role: 'OWNER' as const,
        _count: { members: 0 },
        createdAt: newTree.createdAt,
      };

      setUserTrees([...userTrees, treeSummary]);
      setActiveTreeId(newTree.id);
      setUserRole('OWNER');

      toast.success(`"${newTree.name}" created successfully!`);

      setName('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch {
      toast.error('Failed to create tree. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TreePine className="w-5 h-5 text-primary" />
            Create a Family Tree
          </DialogTitle>
          <DialogDescription>
            Start preserving your family history. Give your family tree a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <label htmlFor="tree-name" className="text-sm font-medium">
              Give your family tree a name
            </label>
            <Input
              id="tree-name"
              placeholder="e.g. The Johnson Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tree-description" className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="tree-description"
              placeholder="A few words about this family tree..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Public tree</div>
              <div className="text-xs text-muted-foreground">Allow anyone with the link to view</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Tree
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
