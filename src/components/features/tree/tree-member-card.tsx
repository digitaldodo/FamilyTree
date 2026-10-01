import { memo, useState } from 'react';
import { MemberWithRelations } from '@/types/member';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TreeMemberCardProps {
  member: MemberWithRelations;
  generationName?: string; // kept for API compatibility; no longer rendered on card
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent, memberId: string) => void;
  className?: string;
}

function TreeMemberCardComponent({
  member,
  // generationName is intentionally unused — generation labels must not appear on member cards
  isSelected,
  onClick,
  className,
}: TreeMemberCardProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  // Format dates: DD/MM/YYYY when full date is available, else YYYY
  const formatCardDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const birthFormatted = formatCardDate(member.birthDate);
  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
  const deathFormatted = formatCardDate(member.deathDate);
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;

  let displayDates = '';
  if (birthFormatted && deathFormatted) {
    displayDates = `${birthFormatted} – ${deathFormatted}`;
  } else if (birthYear && deathYear) {
    displayDates = `${birthYear} – ${deathYear}`;
  } else if (birthFormatted) {
    displayDates = birthFormatted;
  } else if (birthYear) {
    displayDates = String(birthYear);
  }

  // Age: only for living members with a known birth year
  const age =
    birthYear && !deathYear
      ? new Date().getFullYear() - birthYear
      : null;

  const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div
      onClick={(e) => onClick?.(e, member.id)}
      className={cn(
        'group relative flex flex-col w-[190px] h-[250px] rounded-xl overflow-hidden bg-card border border-border cursor-pointer text-center transition-all duration-300',
        isSelected
          ? 'ring-2 ring-primary/70 shadow-md'
          : 'hover:shadow-md hover:border-primary/40',
        className
      )}
      style={{ boxShadow: 'var(--shadow-tree-card)' }}
    >
      {/* Photograph Area (Top ~64%) */}
      <div className="w-full h-[160px] relative flex items-center justify-center overflow-hidden shrink-0">
        {member.imageUrl && !hasLoadError ? (
          <Image
            src={member.imageUrl}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="190px"
            onError={() => setHasLoadError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/[0.85] dark:bg-primary text-primary-foreground transition-transform duration-700 group-hover:scale-[1.03]">
            <span className="text-4xl font-light tracking-widest opacity-90">{initials}</span>
          </div>
        )}

      </div>

      {/* Information Area */}
      <div className="flex-1 px-3 pb-3 pt-1.5 flex flex-col justify-start items-center relative z-10">
        <h3 className="font-semibold text-[14px] text-foreground leading-tight mb-1 line-clamp-2 break-words max-w-full">
          {member.firstName} {member.lastName}
        </h3>

        {displayDates && (
          <span className="text-[11px] text-muted-foreground font-medium">
            {displayDates}
          </span>
        )}

        {age !== null && (
          <span className="text-[10px] text-muted-foreground/75 mt-0.5">
            Age {age}
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
