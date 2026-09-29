import { memo } from 'react';
import { MemberWithRelations } from '@/types/member';
import { cn } from '@/lib/utils';
import { getGenerationLabel } from '@/utils/date';
import Image from 'next/image';

interface TreeMemberCardProps {
  member: MemberWithRelations;
  generationName?: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent, memberId: string) => void;
  className?: string;
}

function TreeMemberCardComponent({
  member,
  generationName: propGenerationName,
  isSelected,
  onClick,
  className,
}: TreeMemberCardProps) {
  const generationName = getGenerationLabel(member?.birthDate) || propGenerationName;

  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;
  const displayDates = birthYear ? `${birthYear} - ${deathYear || 'Present'}` : '';

  return (
    <div
      onClick={(e) => onClick?.(e, member.id)}
      className={cn(
        'group relative flex flex-col w-[190px] h-[250px] rounded-2xl overflow-hidden bg-card border shadow-sm transition-all duration-300 cursor-pointer',
        isSelected
          ? 'border-foreground ring-1 ring-foreground/20 shadow-md'
          : 'border-border/60 hover:border-border hover:shadow-md',
        className
      )}
    >
      {/* Photo Area - Fixed 1:1 or 4:3 Ratio */}
      <div className="w-full h-[160px] relative bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
        {member.imageUrl ? (
          <Image
            src={member.imageUrl}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 170px, 190px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/60 transition-transform duration-500 group-hover:scale-105">
            <span className="text-3xl font-medium tracking-tight">
               {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
            </span>
          </div>
        )}

        {/* Selected Overlay Indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        )}
      </div>

      {/* Info Area */}
      <div className="flex-1 p-4 flex flex-col justify-center bg-card z-10 relative">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 leading-tight tracking-tight mb-1">
          {member.firstName} {member.lastName}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-muted-foreground truncate">
            {displayDates}
          </span>
        </div>

        {generationName && (
          <span className="absolute top-0 right-0 -translate-y-1/2 bg-background border border-border text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
            {generationName}
          </span>
        )}
      </div>

      {/* Subtle Status Indicator */}
      {member.deathDate && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-foreground/30 border border-background z-20 shadow-sm" title="Deceased" />
      )}
    </div>
  );
}

export const TreeMemberCard = memo(TreeMemberCardComponent);
