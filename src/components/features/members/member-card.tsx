import { MemberWithRelations } from '@/types/member';
import { Card, CardContent } from '@/components/ui/card';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { format } from 'date-fns';
import { MemberAvatar } from './member-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MemberCardProps {
  member: MemberWithRelations;
  calculatedGeneration?: number;
}

export function MemberCard({ member, calculatedGeneration: _calculatedGeneration }: MemberCardProps) {
  const {
    setSelectedMemberId,
    setIsMemberModalOpen,
    setIsEditingMember,
    activeTreeId,
  } = useAppStore();

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsEditingMember(false);
    setIsMemberModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberId(member.id);
    setIsEditingMember(true);
    setIsMemberModalOpen(true);
  };

  const relationsFrom = Array.isArray(member.relationsFrom)
    ? member.relationsFrom
    : [];
  const relationsTo = Array.isArray(member.relationsTo)
    ? member.relationsTo
    : [];
  const relationCount = relationsFrom.length + relationsTo.length;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    let warning = `Are you sure you want to delete ${member.firstName} ${member.lastName}?`;
    if (relationCount > 0) {
      warning = `Deleting ${member.firstName} ${member.lastName} will remove spouse, sibling and parent-child links. Are you sure?`;
    }
    if (confirm(warning)) {
      deleteMutation.mutate();
    }
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete member');
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned invalid response');
      }
      return data;
    },
    onSuccess: async () => {
      toast.success('Member deleted successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tree', activeTreeId] }),
        queryClient.invalidateQueries({
          queryKey: ['tree-versions', activeTreeId],
        }),
      ]);
    },
    onError: () => {
      toast.error('Failed to delete member');
    },
  });

  const birthDisplay = member.birthDate
    ? format(new Date(member.birthDate), 'dd/MM/yyyy')
    : null;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 group overflow-hidden hover:shadow-md border-border/60 hover:scale-[1.02] w-full max-w-none sm:max-w-[220px] h-[280px] relative flex flex-col`}
      onClick={handleClick}
    >
      <div
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full focus-visible:ring-1 focus-visible:ring-ring"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 z-50">
            <DropdownMenuItem
              className="cursor-pointer py-2"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Eye className="w-4 h-4 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer py-2"
              onClick={handleEdit}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer py-2 text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative w-full flex-grow shrink bg-muted overflow-hidden">
          <MemberAvatar
            imageUrl={member.imageUrl}
            firstName={member.firstName}
            lastName={member.lastName}
            gender={member.gender}
            fallbackSize={48}
            iconClassName="transition-transform duration-500 group-hover:scale-110"
            className="w-full h-full rounded-none text-5xl transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-3 flex flex-col justify-center items-center min-h-[100px] shrink-0 bg-card text-center border-t border-border/50">
          <h3 className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors line-clamp-2 break-words">
            {member.firstName} {member.lastName}
          </h3>
          {birthDisplay && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {birthDisplay}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
