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
    count: members.filter(m => m.generation === i).length
  }));

  // Map activities to standard shape expected by ActivityFeed component
  const mappedActivities = activities.map(act => ({
    id: act.id,
    type: act.type.toLowerCase(),
    description: `Action on ${act.entityType}`,
    user: { name: act.user.name || 'Unknown' },
    timestamp: act.createdAt.toISOString()
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
          <BirthdayWidget members={members as any} />
        </div>
      </div>
    </div>
  );
}
