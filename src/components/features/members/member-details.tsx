import React from 'react';
import { Calendar, MapPin, Briefcase, Mail, Phone } from 'lucide-react';
import { MemberWithRelations } from '@/types/member';

interface MemberDetailsProps {
  member: MemberWithRelations;
}

export function MemberDetails({ member }: MemberDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {member.birthDate && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Born</span>
            <span className="text-sm font-semibold">
              {new Date(member.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      )}
      {member.deathDate && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Date of Death</span>
            <span className="text-sm font-semibold">
              {new Date(member.deathDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      )}
      {member.address && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Location</span>
            <span className="text-sm font-semibold truncate">{member.address}</span>
          </div>
        </div>
      )}
      {member.occupation && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Occupation</span>
            <span className="text-sm font-semibold truncate">{member.occupation}</span>
          </div>
        </div>
      )}
      {member.email && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Email</span>
            <span className="text-sm font-semibold truncate">{member.email}</span>
          </div>
        </div>
      )}
      {member.phone && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Phone</span>
            <span className="text-sm font-semibold truncate">{member.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
