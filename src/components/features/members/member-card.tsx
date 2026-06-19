import { MemberWithRelations } from '@/types/member';
import { Card, CardContent } from '@/components/ui/card';
import { User2, Calendar, Users, MoreVertical, Eye, Pencil, ArrowRightLeft, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { getGenerationLabel } from '@/utils/date';
import { format } from 'date-fns';
import Image from 'next/image';
import { MemberAvatar } from './member-avatar';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MemberCardProps {
  member: MemberWithRelations;
  calculatedGeneration?: number;
}

export function MemberCard({ member, calculatedGeneration }: MemberCardProps) {
  const { generations, setSelectedMemberId, setIsMemberModalOpen, setIsEditingMember, deleteMember: deleteStoreMember } = useAppStore();

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

  const relationCount =
    member.relationsFrom.length + member.relationsTo.length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let warning = `Are you sure you want to delete ${member.firstName} ${member.lastName}?`;
    if (relationCount > 0) {
      warning = `Deleting ${member.firstName} ${member.lastName} will remove spouse, sibling and parent-child links. Are you sure?`;
    }
    if (confirm(warning)) {
      try {
        const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
        if (res.ok) {
          deleteStoreMember(member.id);
          toast.success('Member deleted successfully');
          window.dispatchEvent(new Event('refresh-members'));
        } else {
          toast.error('Failed to delete member');
        }
      } catch (e) {
        toast.error('An error occurred');
      }
    }
  };

  const genName = generations.find(g => g.id === member.generationId)?.name || (calculatedGeneration !== undefined ? `Gen ${calculatedGeneration + 1}` : 'Unknown Gen');

  const genderAccent =
    member.gender === 'MALE'
      ? 'from-blue-500/15 to-indigo-500/10 hover:border-blue-400/50'
      : member.gender === 'FEMALE'
        ? 'from-pink-500/15 to-rose-500/10 hover:border-pink-400/50'
        : 'from-primary/10 to-purple-500/10 hover:border-primary/50';

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 group overflow-hidden hover:shadow-md border-border/60 hover:scale-[1.02] w-full max-w-none sm:max-w-[220px] h-[280px] relative flex flex-col`}
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <Dropdown 
          trigger={
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        >
          <div className="flex flex-col text-sm w-40">
            <button className="flex items-center w-full px-4 py-2 text-left hover:bg-muted" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              <Eye className="w-4 h-4 mr-2" /> View
            </button>
            <button className="flex items-center w-full px-4 py-2 text-left hover:bg-muted" onClick={handleEdit}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </button>
            <button className="flex items-center w-full px-4 py-2 text-left hover:bg-muted" onClick={handleEdit}>
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Move Gen
            </button>
            <button className="flex items-center w-full px-4 py-2 text-left text-destructive hover:bg-muted" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </button>
          </div>
        </Dropdown>
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
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-3 flex flex-col justify-center items-center min-h-[100px] shrink-0 bg-card text-center border-t border-border/50">
          <h3 className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors line-clamp-2 break-words">
            {member.firstName} {member.lastName}
          </h3>
          <div className="text-xs text-muted-foreground mt-0.5">
            {member.birthDate ? format(new Date(member.birthDate), 'yyyy') : 'Unknown'}
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] font-medium text-primary">
              {genName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
