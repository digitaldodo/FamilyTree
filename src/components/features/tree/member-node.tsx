import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { User2 } from 'lucide-react';

interface MemberNodeProps {
  data: {
    member: MemberWithRelations;
    label: string;
  };
}

function MemberNodeComponent({ data }: MemberNodeProps) {
  const { member } = data;
  const { selectedMemberId, setSelectedMemberId, setIsMemberModalOpen, generations } = useAppStore();
  
  const isSelected = selectedMemberId === member.id;
  const generation = generations.find(g => g.id === member.generationId);

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsMemberModalOpen(true);
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 w-[280px] p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border/50 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1',
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '',
        member.gender === 'MALE' ? 'hover:border-blue-400/50' : member.gender === 'FEMALE' ? 'hover:border-pink-400/50' : 'hover:border-primary/50'
      )}
      onClick={handleClick}
    >
      {/* Target handle for incoming parent connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-background" />

      {/* Avatar */}
      <div className={cn(
        "w-16 h-16 shrink-0 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-inner transition-transform group-hover:scale-105",
        member.gender === 'MALE' ? 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900' : 
        member.gender === 'FEMALE' ? 'bg-pink-50 border-pink-100 dark:bg-pink-950/30 dark:border-pink-900' : 
        'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800'
      )}>
        {member.avatar ? (
          <img src={member.avatar} alt={data.label} className="w-full h-full object-cover" />
        ) : (
          <User2 className={cn(
            "w-7 h-7",
            member.gender === 'MALE' ? 'text-blue-400' : 
            member.gender === 'FEMALE' ? 'text-pink-400' : 
            'text-slate-400'
          )} />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-[13px] text-muted-foreground truncate leading-tight">{member.firstName}</span>
            <span className="font-bold text-base text-foreground truncate leading-tight">{member.lastName}</span>
          </div>
          {generation && (
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wider">
              {generation.name}
            </span>
          )}
        </div>
        
        {member.birthDate && (
          <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
            {new Date(member.birthDate).getFullYear()} &ndash; {member.deathDate ? new Date(member.deathDate).getFullYear() : 'Present'}
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
