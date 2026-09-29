'use client';

import * as React from 'react';
import { Share2, Link2, Check, Globe, Lock, Mail, Activity, Trash2, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface ShareTreeButtonProps {
  treeId: string;
  isPublic: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
}

export function ShareTreeButton({
  treeId,
  isPublic: initialPublic,
  onTogglePublic,
}: ShareTreeButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(initialPublic);
  const [copied, setCopied] = React.useState(false);
  
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('VIEWER');

  const queryClient = useQueryClient();

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/public/tree/${treeId}`
    : `/public/tree/${treeId}`;

  // Queries
  const { data: collaboratorsData } = useQuery({
    queryKey: ['tree', treeId, 'collaborators'],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${treeId}/collaborators`);
      return res.json();
    },
    enabled: isOpen,
  });

  const { data: invitesData } = useQuery({
    queryKey: ['tree', treeId, 'invites'],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${treeId}/invites`);
      return res.json();
    },
    enabled: isOpen,
  });

  const { data: activityData } = useQuery({
    queryKey: ['tree', treeId, 'activity'],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${treeId}/activity`);
      return res.json();
    },
    enabled: isOpen,
  });

  const collaborators = collaboratorsData?.data || [];
  const invites = invitesData?.data || [];
  const activities = activityData?.data || [];

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: async (newIsPublic: boolean) => {
      const res = await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newIsPublic }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to update sharing settings');
      return newIsPublic;
    },
    onSuccess: (newIsPublic) => {
      setIsPublic(newIsPublic);
      onTogglePublic?.(newIsPublic);
      toast.success(newIsPublic ? 'Tree is now public!' : 'Tree is now private');
      queryClient.invalidateQueries({ queryKey: ['tree', treeId] });
    },
    onError: () => toast.error('Failed to update sharing settings'),
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/trees/${treeId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Failed to send invite');
      return data;
    },
    onSuccess: () => {
      toast.success('Invite sent successfully');
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['tree', treeId, 'invites'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/trees/${treeId}/invites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to cancel invite');
      return data;
    },
    onSuccess: () => {
      toast.success('Invite cancelled');
      queryClient.invalidateQueries({ queryKey: ['tree', treeId, 'invites'] });
    },
    onError: () => toast.error('Failed to cancel invite'),
  });

  const removeCollabMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/trees/${treeId}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to remove collaborator');
      return data;
    },
    onSuccess: () => {
      toast.success('Collaborator removed');
      queryClient.invalidateQueries({ queryKey: ['tree', treeId, 'collaborators'] });
    },
    onError: () => toast.error('Failed to remove collaborator'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/trees/${treeId}/collaborators`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to update role');
      return data;
    },
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['tree', treeId, 'collaborators'] });
    },
    onError: () => toast.error('Failed to update role'),
  });

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
      <Button variant="outline" onClick={() => setIsOpen(true)} className="rounded-md gap-2" aria-label="Share tree">
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Access Management</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="share" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4 pr-2">
              <TabsContent value="share" className="space-y-6 mt-0">
                {/* Public Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    {isPublic ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{isPublic ? 'Public Access' : 'Private Access'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isPublic ? 'Anyone with the link can view' : 'Only invited people can access'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMutation.mutate(!isPublic)}
                    disabled={toggleMutation.isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isPublic ? 'bg-primary' : 'bg-muted-foreground/30'
                    } ${toggleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Share Link */}
                {isPublic && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Public Link</label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground truncate font-mono">
                        {shareUrl}
                      </div>
                      <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5 h-10">
                        {copied ? <><Check className="w-4 h-4 text-primary" />Copied</> : <><Link2 className="w-4 h-4" />Copy Link</>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Invite */}
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium">Invite People</h4>
                    <p className="text-xs text-muted-foreground">Invite family members to collaborate on this tree.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Email address" 
                        type="email" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => inviteMutation.mutate()} 
                      disabled={!inviteEmail || inviteMutation.isPending}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="people" className="space-y-4 mt-0">
                <div className="space-y-4">
                  {invites.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Invites</h4>
                      {invites.map((invite: any) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{invite.email}</p>
                              <p className="text-xs text-muted-foreground">Invited as {invite.role}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => cancelInviteMutation.mutate(invite.id)}>
                            Cancel
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collaborators</h4>
                    {collaborators.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No collaborators yet.</p>
                    ) : (
                      collaborators.map((collab: any) => (
                        <div key={collab.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{collab.user.name || collab.user.email}</p>
                              <p className="text-xs text-muted-foreground">{collab.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={collab.role} 
                              onValueChange={(val) => updateRoleMutation.mutate({ userId: collab.userId, role: val })}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="VIEWER">Viewer</SelectItem>
                                <SelectItem value="EDITOR">Editor</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeCollabMutation.mutate(collab.userId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-0">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visitor & Edit Activity</h4>
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No recent activity.</p>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {activity.type === 'VIEW' ? <Activity className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-foreground">{activity.user.name || activity.user.email}</div>
                            <time className="text-xs font-medium text-primary">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</time>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.type === 'VIEW' ? 'Viewed the tree' : `Performed ${activity.type} action`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
