import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TreeMember } from '@/hooks/use-family-tree';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { User2 } from 'lucide-react';

interface MemberNodeProps {
  data: {
    member: TreeMember;
    label: string;
  };
}

function MemberNodeComponent({ data }: MemberNodeProps) {
  const { member } = data;
  const { selectedMemberId, setSelectedMemberId, setIsMemberModalOpen } = useAppStore();
  
  const isSelected = selectedMemberId === member.id;

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsMemberModalOpen(true);
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-4 w-64 p-3 rounded-2xl bg-card border-2 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02]',
        isSelected ? 'border-primary shadow-primary/20' : 'border-border',
        member.gender === 'MALE' ? 'hover:border-blue-400' : member.gender === 'FEMALE' ? 'hover:border-pink-400' : 'hover:border-primary'
      )}
      onClick={handleClick}
    >
      {/* Target handle for incoming parent connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-background" />

      {/* Avatar */}
      <div className="w-14 h-14 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
        {member.avatar ? (
          <img src={member.avatar} alt={data.label} className="w-full h-full object-cover" />
        ) : (
          <User2 className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-sm truncate">{member.firstName}</span>
        <span className="font-bold text-base truncate">{member.lastName}</span>
        {member.birthDate && (
          <span className="text-xs text-muted-foreground mt-1">
            {new Date(member.birthDate).getFullYear()} - {member.deathDate ? new Date(member.deathDate).getFullYear() : 'Present'}
          </span>
        )}
      </div>

      {/* Source handles for outgoing connections */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-background" />
      <Handle type="source" position={Position.Right} id="spouse" className="w-3 h-3 top-1/2 bg-rose-500 border-background" />
      <Handle type="target" position={Position.Left} id="spouse-target" className="w-3 h-3 top-1/2 bg-rose-500 border-background" />
    </div>
  );
}

export const MemberNode = memo(MemberNodeComponent);
