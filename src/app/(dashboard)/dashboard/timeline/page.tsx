'use client';

import { useAppStore } from '@/store/use-app-store';
import { FamilyTimeline } from '@/components/features/timeline/family-timeline';
import { TimelineEventProps } from '@/components/features/timeline/timeline-event';
import { TimelineSkeleton } from '@/components/ui/timeline-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function TimelinePage() {
  const activeTreeId = useAppStore(s => s.activeTreeId);

  const { data: events, isLoading } = useQuery({
    queryKey: ['tree', activeTreeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${activeTreeId}?t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      const members = Array.isArray(json.data?.members) ? json.data.members : [];
      const timelineEvents: TimelineEventProps['event'][] = [];

      members.forEach((member: any) => {
        if (member.birthDate) {
          timelineEvents.push({
            id: `birth-${member.id}`,
            title: `${member.firstName} ${member.lastName} was born`,
            date: member.birthDate,
            type: 'BIRTH',
            description: member.occupation
              ? `${member.generation?.name || 'Unnamed Generation'} · ${member.occupation}`
              : `Added to ${member.generation?.name || 'Unnamed Generation'}`,
            members: [{
              id: member.id,
              name: `${member.firstName} ${member.lastName}`,
              imageUrl: member.imageUrl
            }]
          });
        }

        if (member.deathDate) {
          timelineEvents.push({
            id: `death-${member.id}`,
            title: `${member.firstName} ${member.lastName} passed away`,
            date: member.deathDate,
            type: 'DEATH',
            description: member.generation?.name || 'Unnamed Generation',
            members: [{
              id: member.id,
              name: `${member.firstName} ${member.lastName}`,
              imageUrl: member.imageUrl
            }]
          });
        }

        const relationsTo = Array.isArray(member.relationsTo) ? member.relationsTo : [];
        relationsTo.forEach((rel: any) => {
          if (rel.type === 'PARENT' && rel.from && member.birthDate) {
            timelineEvents.push({
              id: `child-${member.id}-parent-${rel.from.id}`,
              title: `${rel.from.firstName} had a child, ${member.firstName}`,
              date: member.birthDate,
              type: 'CHILD_BORN',
              description: `${member.firstName} was born`,
              members: [
                { id: rel.from.id, name: `${rel.from.firstName} ${rel.from.lastName}` },
                { id: member.id, name: `${member.firstName} ${member.lastName}`, imageUrl: member.imageUrl }
              ]
            });
          }
        });

        const relationsFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
        relationsFrom.forEach((rel: any) => {
           if (rel.type === 'SPOUSE' && rel.to) {
             if (member.id < rel.to.id) {
               timelineEvents.push({
                  id: `marriage-${member.id}-${rel.to.id}`,
                  title: `${member.firstName} and ${rel.to.firstName} were married`,
                  date: rel.createdAt || new Date(),
                  type: 'MARRIAGE',
                  description: `Marriage`,
                  members: [
                    { id: member.id, name: `${member.firstName} ${member.lastName}`, imageUrl: member.imageUrl },
                    { id: rel.to.id, name: `${rel.to.firstName} ${rel.to.lastName}` }
                  ]
               });
             }
           }
        });
      });

      return timelineEvents;
    },
    enabled: !!activeTreeId,
  });

  if (!activeTreeId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={Clock}
          title="Select a Family Tree"
          description="Choose a family tree from the sidebar to view its timeline."
        />
      </div>
    );
  }

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={Clock}
          title="No timeline events yet"
          description="Add birth dates and other milestones to your family members to build the timeline."
        />
      </div>
    );
  }

  return (
    <div>
      <FamilyTimeline events={events} />
    </div>
  );
}
