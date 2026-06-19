"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Link as LinkIcon, Check, Copy, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  treeId: string;
  treeName: string;
}

export function InviteModal({ isOpen, onClose, treeId, treeName }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeId, role, email })
      });
      if (!res.ok) throw new Error("Failed to send invite");
      toast.success(`Invite sent to ${email} as ${role.toLowerCase()}`);
      setEmail("");
    } catch (error) {
      toast.error("Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeId, role }) // No email = persistent link
      });
      if (!res.ok) throw new Error("Failed to generate link");
      const data = await res.json();
      
      const link = `${window.location.origin}/invite/${data.token}`;
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to generate link");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            Share &quot;{treeName}&quot;
          </DialogTitle>
          <DialogDescription>
            Invite family members to view or collaborate on this family tree.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite by Email</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Invite
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or share link</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              Share Link
              <span className="text-xs text-muted-foreground">Anyone with the link can join</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md border border-border text-sm text-muted-foreground truncate flex items-center gap-2 cursor-not-allowed">
                <LinkIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">Click &apos;Copy Link&apos; to generate</span>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={copyLink}
                className="w-[110px]"
              >
                {isCopied ? (
                  <><Check className="w-4 h-4 mr-2 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy Link</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
