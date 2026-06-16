import { prisma } from '@/lib/prisma';
import { AnalyticsCards } from '@/components/features/dashboard/analytics-cards';
import { GenerationChart } from '@/components/features/dashboard/generation-chart';
import { ActivityFeed } from '@/components/features/dashboard/activity-feed';
import { BirthdayWidget } from '@/components/features/dashboard/birthday-widget';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const activities = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });
  const relationshipsCount = await prisma.relationship.count();
  
  const totalGenerations = members.length > 0 ? Math.max(...members.map(m => m.generation)) : 0;
  const currentMonth = new Date().getMonth();
  const birthdaysThisMonth = members.filter(m => m.birthDate && new Date(m.birthDate).getMonth() === currentMonth).length;

  const metrics = {
    totalMembers: members.length,
    totalGenerations,
    relationshipsCount,
    birthdaysThisMonth
  };

  const generationData = Array.from({ length: totalGenerations + 1 }).map((_, i) => ({
    generation: `Gen ${i}`,
    members: members.filter(m => m.generation === i).length
  }));

  const today = new Date();
  const upcomingBirthdays = members
    .filter(m => m.birthDate)
    .map(m => {
      const birthDate = new Date(m.birthDate!);
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const ageTurning = nextBirthday.getFullYear() - birthDate.getFullYear();

      return {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        date: birthDate,
        ageTurning,
        daysRemaining,
        avatar: m.avatar,
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  // Map activities to standard shape expected by ActivityFeed component
  const mappedActivities = activities.map(act => ({
    id: act.id,
    type: act.type,
    entityType: act.entityType,
    entityName: (act.metadata as any)?.name || (act.metadata as any)?.action || 'Item',
    userName: act.user.name || 'Unknown',
    createdAt: act.createdAt
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your family tree metrics and recent activities.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/timeline">
            <Button variant="outline">View Timeline</Button>
          </Link>
          <Link href="/tree">
            <Button>Go to Tree</Button>
          </Link>
        </div>
      </div>

      <AnalyticsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GenerationChart data={generationData} />
          <ActivityFeed activities={mappedActivities} />
        </div>
        <div className="space-y-6">
          <BirthdayWidget birthdays={upcomingBirthdays} />
        </div>
      </div>
    </div>
  );
}
