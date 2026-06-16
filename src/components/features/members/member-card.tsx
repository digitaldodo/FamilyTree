import { MemberWithRelations } from '@/types/member';
import { Card, CardContent } from '@/components/ui/card';
import { User2, Calendar, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

interface MemberCardProps {
  member: MemberWithRelations;
}

export function MemberCard({ member }: MemberCardProps) {
  const { setSelectedMemberId, setIsMemberModalOpen, setIsEditingMember } = useAppStore();

  const handleClick = () => {
    setSelectedMemberId(member.id);
    setIsEditingMember(false);
    setIsMemberModalOpen(true);
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all duration-200 group overflow-hidden hover:shadow-md"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="h-24 bg-gradient-to-r from-primary/10 to-purple-500/10" />
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-12 left-6">
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
              {member.avatar ? (
                <img src={member.avatar} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <User2 className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div className="mt-10">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {member.firstName} {member.lastName}
            </h3>
            
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {member.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    {new Date(member.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    {member.deathDate ? ` - ${new Date(member.deathDate).getFullYear()}` : ' (Present)'}
                  </span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{member.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
