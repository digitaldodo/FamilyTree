import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { User2 } from 'lucide-react';
import { getGenerationLabel } from '@/utils/date';
import Image from 'next/image';
import { MemberAvatar } from '../members/member-avatar';

interface MemberNodeProps {
  data: {
    member: MemberWithRelations;
    label: string;
  };
}

function MemberNodeComponent({ data }: MemberNodeProps) {
  const { member } = data;
  const selectedMemberId = useAppStore(s => s.selectedMemberId);
  const setSelectedMemberId = useAppStore(s => s.setSelectedMemberId);
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  const generations = useAppStore(s => s.generations);
  
  const isSelected = selectedMemberId === member.id;
  const generation = generations.find(g => g.id === member.generationId);
  const generationName = getGenerationLabel(member?.birthDate) || generation?.name;

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsMemberModalOpen(true);
  };

  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : '?';
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : 'Present';
  const displayDates = member.birthDate ? `${birthYear} - ${deathYear}` : '';

  return (
    <div
      className={cn(
        'group relative flex flex-col w-[240px] h-[340px] rounded-[24px] overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:scale-[1.03]',
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent' : '',
      )}
      onClick={handleClick}
    >
      {/* Target handle for incoming parent connections */}
      <Handle type="target" position={Position.Top} id="child-target" className="w-3 h-3 bg-purple-500 border-background" />

      {/* Photo Area (70-80% height) */}
      <div className="flex-1 relative bg-muted flex items-center justify-center overflow-hidden">
        <MemberAvatar 
          imageUrl={member.imageUrl} 
          firstName={member.firstName} 
          lastName={member.lastName} 
          gender={member.gender} 
          fallbackSize={80} 
          iconClassName="transition-transform duration-500 group-hover:scale-110"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {/* Soft gradient at the bottom of the photo for text contrast if needed, but we'll put text in a separate box below */}
      </div>

      {/* Info Area */}
      <div className="h-[90px] shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 flex flex-col justify-center border-t border-white/20 dark:border-white/5 relative z-10">
        <h3 className="font-bold text-[17px] text-foreground truncate leading-tight tracking-tight">
          {member.firstName} {member.lastName}
        </h3>
        
        {displayDates && (
          <span className="text-[13px] font-medium text-muted-foreground mt-0.5 tracking-wide">
            {displayDates}
          </span>
        )}
        
        {generationName && (
          <span className="inline-flex mt-1.5 w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            {generationName}
          </span>
        )}
      </div>

      {/* Source handles for outgoing connections */}
      <Handle type="source" position={Position.Bottom} id="parent-source" className="w-3 h-3 bg-purple-500 border-background" />
      <Handle type="source" position={Position.Right} id="spouse" className="w-3 h-3 top-1/2 bg-rose-500 border-background" />
      <Handle type="target" position={Position.Left} id="spouse-target" className="w-3 h-3 top-1/2 bg-rose-500 border-background" />
    </div>
  );
}

export const MemberNode = memo(MemberNodeComponent);
