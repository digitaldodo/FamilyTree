import { memo } from 'react';
import { MemberWithRelations } from '@/types/member';
import { cn } from '@/lib/utils';
import { getGenerationLabel } from '@/utils/date';
import { MemberAvatar } from '../members/member-avatar';

interface TreeMemberCardProps {
  member: MemberWithRelations;
  generationName?: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent, memberId: string) => void;
}

function TreeMemberCardComponent({
  member,
  generationName: propGenerationName,
  isSelected,
  onClick,
}: TreeMemberCardProps) {
  const generationName =
    getGenerationLabel(member?.birthDate) || propGenerationName;

  const birthYear = member.birthDate
    ? new Date(member.birthDate).getFullYear()
    : null;
  const deathYear = member.deathDate
    ? new Date(member.deathDate).getFullYear()
    : null;
  const displayDates = birthYear
    ? `${birthYear}–${deathYear || 'Present'}`
    : '';

  return (
    <div
      onClick={(e) => onClick?.(e, member.id)}
      className={cn(
        'group relative flex flex-col w-[190px] h-[250px] rounded-xl overflow-hidden bg-card border border-border shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:border-foreground/20',
        isSelected &&
          'ring-2 ring-foreground ring-offset-2 ring-offset-background'
      )}
    >
      {/* Photo */}
      <div className="flex-1 relative bg-muted flex items-center justify-center overflow-hidden">
        <MemberAvatar
          imageUrl={member.imageUrl}
          firstName={member.firstName}
          lastName={member.lastName}
          gender={member.gender}
          fallbackSize={64}
          className="transition-transform duration-300 group-hover:scale-105"
        />

        {/* Deceased indicator */}
        {member.deathDate && (
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-muted-foreground/40"
            title="Deceased"
          />
        )}
      </div>

      {/* Info */}
      <div className="h-[80px] shrink-0 bg-card p-3 flex flex-col justify-center border-t border-border">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight tracking-tight">
          {member.firstName} {member.lastName}
        </h3>

        <div className="flex items-center justify-between mt-1">
          {displayDates ? (
            <span className="text-xs text-muted-foreground truncate pr-2">
              {displayDates}
            </span>
          ) : (
            <span className="flex-1" />
          )}

          {generationName && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0 max-w-[80px] truncate">
              {generationName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const TreeMemberCard = memo(TreeMemberCardComponent);
