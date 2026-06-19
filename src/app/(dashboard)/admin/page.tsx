'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { CollaboratorManager } from '@/components/features/tree/collaborator-manager';
import { InviteModal } from '@/components/features/invite/invite-modal';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Shield, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { activeTreeId, userTrees, userRole, setActiveTreeId, setUserTrees } = useAppStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!activeTreeId) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={Shield}
          title="Select a Family Tree"
          description="Choose a family tree from the sidebar to manage its settings and collaborators."
        />
      </div>
    );
  }

  const activeTree = userTrees.find(t => t.id === activeTreeId);
  const hasManageAccess = userRole === 'OWNER' || userRole === 'ADMIN';
  const hasDeleteAccess = userRole === 'OWNER';

  const handleDeleteTree = async () => {
    if (!confirm('Are you absolutely sure you want to delete this tree? This action cannot be undone and will delete all members, relationships, and memories associated with it.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/trees/${activeTreeId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete tree');

      toast.success('Tree deleted successfully');
      
      const newTrees = userTrees.filter(t => t.id !== activeTreeId);
      setUserTrees(newTrees);
      setActiveTreeId(newTrees.length > 0 ? newTrees[0].id : null);
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete tree');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tree Settings</h1>
        <p className="text-muted-foreground mt-2">Manage settings and collaborators for &quot;{activeTree?.name}&quot;.</p>
      </div>

      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Collaborators
          </h2>
          {hasManageAccess && (
            <Button onClick={() => setIsInviteModalOpen(true)}>
              Invite Members
            </Button>
          )}
        </div>

        {hasManageAccess ? (
          <CollaboratorManager treeId={activeTreeId} />
        ) : (
          <div className="p-4 bg-muted/50 rounded-xl text-center text-sm text-muted-foreground">
            You do not have permission to manage collaborators for this tree.
          </div>
        )}
      </section>

      {hasDeleteAccess && (
        <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-red-500/80">
              Once you delete a tree, there is no going back. All members, relationships, and memories will be permanently deleted. Please be certain.
            </p>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={handleDeleteTree}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Tree'}
            </Button>
          </div>
        </section>
      )}

      {activeTree && (
        <InviteModal 
          isOpen={isInviteModalOpen} 
          onClose={() => setIsInviteModalOpen(false)} 
          treeId={activeTreeId}
          treeName={activeTree?.name || 'Tree'}
        />
      )}
    </div>
  );
}
