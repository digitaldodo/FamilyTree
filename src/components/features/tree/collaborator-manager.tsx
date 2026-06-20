'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TreeCollaborator, TreeRole } from '@/types/tree';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

interface CollaboratorManagerProps {
  treeId: string;
}

const roleBadgeStyles: Record<TreeRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function CollaboratorManager({ treeId }: CollaboratorManagerProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['collaborators', treeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${treeId}/collaborators`);
      if (!res.ok) throw new Error('Failed to fetch collaborators');
      return res.json() as Promise<TreeCollaborator[]>;
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/trees/${treeId}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to remove collaborator');
      return userId;
    },
    onMutate: (userId) => {
      setRemovingId(userId);
    },
    onSuccess: (userId, originalUserId) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', treeId] });
      toast.success('Collaborator has been removed');
      setRemovingId(null);
    },
    onError: () => {
      toast.error('Failed to remove collaborator');
      setRemovingId(null);
    }
  });

  const handleRemove = (userId: string) => {
    removeMutation.mutate(userId);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (collaborators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm max-w-xs">
          No collaborators yet. Invite family members to collaborate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {collaborators.map((collab) => {
        const initials = getInitials(collab.user.name, collab.user.email);
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`;
        const roleStyle = roleBadgeStyles[collab.role];

        return (
          <div
            key={collab.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 relative">
              <Image src={avatarUrl} alt={collab.user.name || collab.user.email} fill className="object-cover" unoptimized />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {collab.user.name || 'Unnamed User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {collab.user.email}
              </div>
            </div>

            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium shrink-0', roleStyle)}>
              {collab.role.charAt(0) + collab.role.slice(1).toLowerCase()}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(collab.userId)}
              disabled={removingId === collab.userId || removeMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
