import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MemberWithRelations } from '@/types/member';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { getGenerationLabel } from '@/utils/date';
import { MemberAvatar } from '../members/member-avatar';
import { Users, Heart, Baby } from 'lucide-react';

interface MemberNodeProps {
  data: {
    member: MemberWithRelations;
    label: string;
    generationName?: string;
  };
}

function MemberNodeComponent({ data }: MemberNodeProps) {
  const { member } = data;
  const selectedMemberId = useAppStore(s => s.selectedMemberId);
  const setSelectedMemberId = useAppStore(s => s.setSelectedMemberId);
  const setIsMemberModalOpen = useAppStore(s => s.setIsMemberModalOpen);
  
  const isSelected = selectedMemberId === member.id;
  const generationName = getGenerationLabel(member?.birthDate) || data.generationName;

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsMemberModalOpen(true);
  };

  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : '?';
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : 'Present';
  const displayDates = member.birthDate ? `${birthYear} - ${deathYear}` : '';

  const safeRelsFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
  const safeRelsTo = Array.isArray(member.relationsTo) ? member.relationsTo : [];
  
  const childrenCount = safeRelsFrom.filter(r => r.type === 'PARENT').length;
  const spouseCount = safeRelsFrom.filter(r => r.type === 'SPOUSE').length + safeRelsTo.filter(r => r.type === 'SPOUSE').length;
  const siblingCount = safeRelsFrom.filter(r => r.type === 'SIBLING').length + safeRelsTo.filter(r => r.type === 'SIBLING').length;

  return (
    <div
      className={cn(
        'group relative flex flex-col w-[220px] h-[300px] rounded-[24px] overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:scale-[1.03]',
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent' : '',
      )}
      onClick={handleClick}
    >
      {/* Target handle for incoming parent connections */}
      <Handle type="target" position={Position.Top} id="child-target" className="w-3 h-3 bg-purple-500 border-background" />

      {/* Photo Area (Top) */}
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
        
        {/* Hover Quick Stats Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-3 backdrop-blur-sm z-20">
           {childrenCount > 0 && (
             <div className="flex items-center gap-2"><Baby className="w-4 h-4" /> {childrenCount} {childrenCount === 1 ? 'Child' : 'Children'}</div>
           )}
           {spouseCount > 0 && (
             <div className="flex items-center gap-2 text-rose-300"><Heart className="w-4 h-4" /> {spouseCount} {spouseCount === 1 ? 'Spouse' : 'Spouses'}</div>
           )}
           {siblingCount > 0 && (
             <div className="flex items-center gap-2 text-emerald-300"><Users className="w-4 h-4" /> {siblingCount} {siblingCount === 1 ? 'Sibling' : 'Siblings'}</div>
           )}
           {childrenCount === 0 && spouseCount === 0 && siblingCount === 0 && (
             <div className="text-sm font-medium text-white/80">No relations added</div>
           )}
        </div>
      </div>

      {/* Info Area (Middle & Bottom) */}
      <div className="h-[90px] shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 flex flex-col justify-center border-t border-white/20 dark:border-white/5 relative z-10">
        <h3 className="font-bold text-[17px] text-foreground line-clamp-2 leading-tight tracking-tight break-words">
          {member.firstName} {member.lastName}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          {displayDates ? (
            <span className="text-[13px] font-medium text-muted-foreground tracking-wide">
              {displayDates}
            </span>
          ) : <span />}
          
          {generationName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 uppercase tracking-wider shrink-0">
              {generationName}
            </span>
          )}
        </div>
      </div>

      {/* Source handles for outgoing connections */}
      <Handle type="source" position={Position.Bottom} id="parent-source" className="w-3 h-3 bg-purple-500 border-background" />
      <Handle type="source" position={Position.Right} id="spouse" className="w-3 h-3 top-1/2 bg-rose-500 border-background" />
      <Handle type="target" position={Position.Left} id="spouse-target" className="w-3 h-3 top-1/2 bg-rose-500 border-background" />
    </div>
  );
}

export const MemberNode = memo(MemberNodeComponent);
