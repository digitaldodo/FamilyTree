import { MemberWithRelations } from '@/types/member';
import { Card, CardContent } from '@/components/ui/card';
import { User2, Calendar, Users } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { generationLabel } from '@/utils/helpers';

interface MemberCardProps {
  member: MemberWithRelations;
  calculatedGeneration?: number;
}

export function MemberCard({ member, calculatedGeneration }: MemberCardProps) {
  const { setSelectedMemberId, setIsMemberModalOpen, setIsEditingMember } = useAppStore();

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsEditingMember(false);
    setIsMemberModalOpen(true);
  };

  const relationCount =
    member.relationsFrom.length + member.relationsTo.length;

  const gen = calculatedGeneration ?? member.generation ?? 0;

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
        <div className="px-4 pb-4 relative">
          <div className="absolute -top-8 left-4">
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

          <div className="mt-7">
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors truncate">
              {member.firstName} {member.lastName}
            </h3>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] font-medium text-primary">
                Gen {gen + 1}
              </span>
              {relationCount > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                  <Users className="w-2.5 h-2.5" />
                  {relationCount}
                </span>
              )}
            </div>

            {member.birthDate && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>
                  {new Date(member.birthDate).getFullYear()}
                  {member.deathDate
                    ? ` – ${new Date(member.deathDate).getFullYear()}`
                    : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
