'use client';

import { useAppStore } from '@/store/use-app-store';
import { AnalyticsCards } from '@/components/features/dashboard/analytics-cards';
import { GenerationChart } from '@/components/features/dashboard/generation-chart';
import { ActivityFeed } from '@/components/features/dashboard/activity-feed';
import { BirthdayWidget } from '@/components/features/dashboard/birthday-widget';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/page-loader';
import { TreePine, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  metrics: {
    totalMembers: number;
    totalGenerations: number;
    relationshipsCount: number;
    birthdaysThisMonth: number;
  };
  generationData: { generation: string; members: number }[];
  upcomingBirthdays: any[];
  activities: any[];
}

import { useQuery } from '@tanstack/react-query';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function DashboardContent() {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const userTrees = useAppStore(s => s.userTrees);

  const { data, isLoading } = useQuery({
    queryKey: ['tree', activeTreeId],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${activeTreeId}?t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      
      const tree = json.data;
      const members = tree.members || [];
      const generations = tree.generations || [];
      const totalGenerations = generations.length;
      
      // Calculate metrics
      const currentMonth = new Date().getMonth();
      const isAlive = (m: any) => m.status !== 'DECEASED' && m.status !== 'Deceased' && !m.deathDate;
      const birthdaysThisMonth = members.filter((m: any) => m.birthDate && isAlive(m) && new Date(m.birthDate).getMonth() === currentMonth).length;
      
      const relationshipsCount = members.reduce((acc: number, m: any) => acc + (m.relationsFrom?.length || 0), 0);
      
      const generationData = generations.map((gen: any) => ({
        generation: gen.name,
        members: members.filter((m: any) => m.generationId === gen.id).length
      }));

      // Birthday calculations
      const today = new Date();
      const upcomingBirthdays = members
        .filter((m: any) => m.birthDate && isAlive(m))
        .map((m: any) => {
          const birthDate = new Date(m.birthDate);
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
            imageUrl: m.imageUrl,
          };
        })
        .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining)
        .slice(0, 5);

      return {
        metrics: {
          totalMembers: members.length,
          totalGenerations,
          relationshipsCount,
          birthdaysThisMonth,
        },
        generationData,
        upcomingBirthdays,
        activities: [], // Activity feed from separate endpoint if needed
      } as DashboardData;
    },
    enabled: !!activeTreeId,
  });

  // No active tree selected
  if (!isLoading && !activeTreeId) {
    if (userTrees.length === 0) {
      return (
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={TreePine}
            title="Welcome to Family Legacy"
            description="Create your first family tree to start preserving your family's history, memories, and connections."
            actionLabel="Create Your First Tree"
            onAction={() => {
              const event = new CustomEvent('open-create-tree-modal');
              window.dispatchEvent(event);
            }}
          />
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={TreePine}
          title="Select a Family Tree"
          description="Choose a family tree from the sidebar to view its dashboard."
        />
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={TreePine}
          title="Unable to load dashboard"
          description="There was a problem loading your dashboard data. Please try again."
        />
      </div>
    );
  }

  const activeTree = userTrees.find(t => t.id === activeTreeId);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTree?.name || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">Overview of your family tree metrics and recent activities.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/timeline">
            <Button variant="outline">View Timeline</Button>
          </Link>
          <Link href="/tree">
            <Button className="gap-2">
              Go to Tree
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <AnalyticsCards metrics={data.metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GenerationChart data={data.generationData} />
          <ActivityFeed activities={data.activities} />
        </div>
        <div className="space-y-6">
          <BirthdayWidget birthdays={data.upcomingBirthdays} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
