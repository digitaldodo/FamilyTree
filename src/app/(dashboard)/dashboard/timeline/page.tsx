import { prisma } from '@/lib/prisma';
import { FamilyTimeline } from '@/components/features/timeline/family-timeline';
import { TimelineEventProps } from '@/components/features/timeline/timeline-event';

export default async function TimelinePage() {
  const members = await prisma.member.findMany({
    where: {
      OR: [
        { birthDate: { not: null } },
        { deathDate: { not: null } }
      ]
    },
    orderBy: { birthDate: 'asc' }
  });

  const events: TimelineEventProps['event'][] = [];

  members.forEach(member => {
    if (member.birthDate) {
      events.push({
        id: `birth-${member.id}`,
        title: `${member.firstName} ${member.lastName} was born`,
        date: member.birthDate.toISOString(),
        type: 'birth',
        description: member.bio ? `Born in generation ${member.generation}. ${member.bio.substring(0, 50)}...` : `Added to generation ${member.generation}`,
        memberId: member.id,
        memberImage: member.avatar || undefined
      });
    }

    if (member.deathDate) {
      events.push({
        id: `death-${member.id}`,
        title: `${member.firstName} ${member.lastName} passed away`,
        date: member.deathDate.toISOString(),
        type: 'death',
        description: `Generation ${member.generation}`,
        memberId: member.id,
        memberImage: member.avatar || undefined
      });
    }
  });

  return (
    <div>
      <FamilyTimeline events={events} />
    </div>
  );
}
