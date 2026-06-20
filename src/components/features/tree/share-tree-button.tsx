'use client';

import * as React from 'react';
import { Share2, Link2, Check, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ShareTreeButtonProps {
  treeId: string;
  isPublic: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
}

export function ShareTreeButton({ treeId, isPublic: initialPublic, onTogglePublic }: ShareTreeButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(initialPublic);
  const [copied, setCopied] = React.useState(false);
  const queryClient = useQueryClient();

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/public/tree/${treeId}`
    : `/public/tree/${treeId}`;

  const toggleMutation = useMutation({
    mutationFn: async (newIsPublic: boolean) => {
      const res = await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newIsPublic }),
      });
      let data;
    try {
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }
    } catch (e) {
      throw new Error("Invalid JSON response from server");
    }
      if (!data.success) throw new Error('Failed to update sharing settings');
      return newIsPublic;
    },
    onSuccess: (newIsPublic) => {
      setIsPublic(newIsPublic);
      onTogglePublic?.(newIsPublic);
      toast.success(newIsPublic ? 'Tree is now public!' : 'Tree is now private');
      queryClient.invalidateQueries({ queryKey: ['tree', treeId] });
      queryClient.invalidateQueries({ queryKey: ['userTrees'] });
    },
    onError: () => {
      toast.error('Failed to update sharing settings');
    }
  });

  const handleToggle = () => {
    toggleMutation.mutate(!isPublic);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="rounded-xl"
        aria-label="Share tree"
      >
        <Share2 className="h-5 w-5" />
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Share Family Tree">
        <div className="space-y-5">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{isPublic ? 'Public' : 'Private'}</p>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? 'Anyone with the link can view' : 'Only you can access'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isPublic ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
              } ${toggleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={isPublic}
              aria-label="Toggle public sharing"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Share Link */}
          {isPublic && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Share link</label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground truncate font-mono">
                  {shareUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {isPublic
              ? 'Public viewers can see the tree and member profiles but cannot make any changes.'
              : 'Enable public sharing to let family members view the tree without signing in.'}
          </p>
        </div>
      </Modal>
    </>
  );
}
