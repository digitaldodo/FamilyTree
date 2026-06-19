'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { FamilyTimeline } from '@/components/features/timeline/family-timeline';
import { TimelineEventProps } from '@/components/features/timeline/timeline-event';
import { PageLoader } from '@/components/ui/page-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock } from 'lucide-react';

export default function TimelinePage() {
  const { activeTreeId } = useAppStore();
  const [events, setEvents] = useState<TimelineEventProps['event'][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeTreeId) {
      setIsLoading(false);
      return;
    }

    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/trees/${activeTreeId}`);
        const json = await res.json();
        
        if (!json.success) {
          setIsLoading(false);
          return;
        }

        const members = json.data.members || [];
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

          member.relationsTo?.forEach((rel: any) => {
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

          member.relationsFrom?.forEach((rel: any) => {
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

        setEvents(timelineEvents);
      } catch (error) {
        console.error('Failed to load timeline:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [activeTreeId]);

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
    return <PageLoader />;
  }

  if (events.length === 0) {
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
