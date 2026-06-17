import { MemberWithRelations } from '@/types/member';
import { Card, CardContent } from '@/components/ui/card';
import { User2, Calendar, Users } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { getGenerationLabel } from '@/utils/date';
import { format } from 'date-fns';
interface MemberCardProps {
  member: MemberWithRelations;
  calculatedGeneration?: number;
}

export function MemberCard({ member, calculatedGeneration }: MemberCardProps) {
  const { generations, setSelectedMemberId, setIsMemberModalOpen, setIsEditingMember } = useAppStore();

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsEditingMember(false);
    setIsMemberModalOpen(true);
  };

  const relationCount =
    member.relationsFrom.length + member.relationsTo.length;

  const genName = generations.find(g => g.id === member.generationId)?.name || (calculatedGeneration !== undefined ? `Gen ${calculatedGeneration + 1}` : 'Unknown Gen');

  const genderAccent =
    member.gender === 'MALE'
      ? 'from-blue-500/15 to-indigo-500/10 hover:border-blue-400/50'
      : member.gender === 'FEMALE'
        ? 'from-pink-500/15 to-rose-500/10 hover:border-pink-400/50'
        : 'from-primary/10 to-purple-500/10 hover:border-primary/50';

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 group overflow-hidden hover:shadow-md border-border/60 hover:scale-[1.02] w-full max-w-none sm:max-w-[220px]`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className={`h-14 bg-gradient-to-r ${genderAccent}`} />
        <div className="px-4 pb-4 flex flex-col">
          <div className="flex gap-4">
            <div className="-mt-8 flex-shrink-0 relative">
              <div className="w-14 h-14 rounded-xl bg-card border-[3px] border-card flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User2 className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col pt-2">
              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 break-words">
                {member.firstName} {member.lastName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] font-medium text-primary">
              {genName}
            </span>
            {relationCount > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                <Users className="w-2.5 h-2.5" />
                {relationCount}
              </span>
            )}
          </div>

          {member.birthDate && (
            <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>
                  Born: {format(new Date(member.birthDate), 'dd-MM-yyyy')}
                </span>
              </div>
              {getGenerationLabel(member.birthDate) && (
                <div className="text-[11px] font-medium text-foreground/70 pl-4.5">
                  {getGenerationLabel(member.birthDate)}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
