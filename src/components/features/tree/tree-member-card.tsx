import { memo, useState } from 'react';
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
  const [hasLoadError, setHasLoadError] = useState(false);
  
  const generationName = getGenerationLabel(member?.birthDate) || propGenerationName;

  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;
  
  let displayDates = '';
  if (birthYear && deathYear) {
    displayDates = `${birthYear} - ${deathYear}`;
  } else if (birthYear) {
    const age = new Date().getFullYear() - birthYear;
    displayDates = `Born ${birthYear} (Age ${age})`;
  }

  const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div
      onClick={(e) => onClick?.(e, member.id)}
      className={cn(
        'group relative flex flex-col w-full h-full rounded-2xl overflow-hidden bg-card border shadow-sm transition-all duration-300 cursor-pointer text-center hover:bg-card/90',
        isSelected
          ? 'border-primary ring-1 ring-primary/30 shadow-md'
          : 'border-border/60 hover:border-border/90 hover:shadow-md',
        className
      )}
    >
      {/* Photograph Area (Top ~64%) */}
      <div className="w-full h-[64%] relative bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
        {member.imageUrl && !hasLoadError ? (
          <Image
            src={member.imageUrl}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 190px, 220px"
            onError={() => setHasLoadError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/80 text-muted-foreground transition-transform duration-700 group-hover:scale-[1.03]">
            <span className="text-4xl font-semibold tracking-wider opacity-60">
               {initials}
            </span>
          </div>
        )}
        
        {/* Subtle gradient overlay to merge image with card background smoothly */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none transition-colors duration-300" />
      </div>

      {/* Information Area */}
      <div className="flex-1 px-3 pb-3 pt-1 flex flex-col justify-start items-center relative z-10">
        <h3 className="font-semibold text-[14px] text-foreground leading-tight mb-1 line-clamp-2 break-words max-w-full">
          {member.firstName} {member.lastName}
        </h3>
        
        {displayDates && (
          <span className="text-[11px] text-muted-foreground font-medium mb-1.5">
            {displayDates}
          </span>
        )}

        {generationName && (
          <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-auto">
            {generationName}
          </span>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none z-20" />
      )}
      
      {/* Subtle Status Indicator */}
      {member.deathDate && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-foreground/40 border border-background z-20 shadow-sm" title="Deceased" />
      )}
    </div>
  );
}

export const TreeMemberCard = memo(TreeMemberCardComponent);
