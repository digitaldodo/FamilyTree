'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { useMembers } from '@/hooks/use-members';
import { useMemories } from '@/hooks/use-memories';
import { useUserTrees } from '@/hooks/use-user-trees';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { DashboardTreePreview } from '@/components/features/dashboard/dashboard-tree-preview';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { TreePine, ArrowRight, Clock, Plus, ImageIcon, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function DashboardContent() {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const { userTrees, isLoading: isUserTreesLoading } = useUserTrees();
  const { members, generations, isLoading: isMembersLoading } = useMembers(activeTreeId || undefined);
  const { memories, isLoading: isMemoriesLoading } = useMemories(activeTreeId || undefined);

  const isLoading = isMembersLoading || isUserTreesLoading || isMemoriesLoading;

  // Move useMemo to the top to respect Rules of Hooks
  const timelinePreviewEvents = useMemo(() => {
    const events: any[] = [];
    if (members) {
      members.forEach((member: any) => {
        if (member.birthDate) {
          events.push({
            id: `birth-${member.id}`,
            title: `${member.firstName} was born`,
            date: new Date(member.birthDate),
            type: 'BIRTH',
          });
        }
      });
    }
    if (memories) {
      memories.forEach((memory: any) => {
        events.push({
          id: `memory-${memory.id}`,
          title: memory.title,
          date: new Date(memory.date),
          type: 'MEMORY',
        });
      });
    }
    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [members, memories]);

  // GLOBAL HYDRATION GUARD
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!activeTreeId) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-6">
        <EmptyState
          icon={TreePine}
          title="Create your family tree"
          description="Begin your journey by creating a tree and adding your first family members."
          actionLabel="Create Family Tree"
          onAction={() => window.dispatchEvent(new Event('open-create-tree-modal'))}
        />
      </div>
    );
  }

  if (!members || !generations) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={TreePine}
          title="Unable to load dashboard"
          description="There was a problem loading your family data. Please try again."
        />
      </div>
    );
  }

  const activeTree = userTrees.find(t => t.id === activeTreeId);
  const familyName = activeTree?.name || 'Your Family';

  // Snapshot Data
  const totalMembers = members.length;
  const totalGenerations = generations.length;
  const relationshipsCount = members.reduce((acc: number, m: any) => acc + (m.relationsFrom?.length || 0), 0);

  // Upcoming Birthdays
  const today = new Date();
  const isAlive = (m: any) => m.status !== 'DECEASED' && m.status !== 'Deceased' && !m.deathDate;
  
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
    .slice(0, 4);

  // Featured Members for Portrait Strip (prioritize those with images, then randomize/take first few)
  const featuredMembers = [...members]
    .sort((a) => (a.imageUrl ? -1 : 1))
    .slice(0, 6);

  // Recent Memories
  const recentMemories = memories ? [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-16">
      
      {/* 1. FAMILY INTRO / HERO */}
      <section className="flex flex-col items-center md:items-start text-center md:text-left pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight text-foreground mb-4">
          {familyName}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          Your family&apos;s story, across {totalGenerations} generation{totalGenerations !== 1 ? 's' : ''}. Preserve the moments that matter and explore the connections that define you.
        </p>
        <Link href="/tree">
          <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-sm group">
            Explore Family Tree
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </section>

      {/* 2. FAMILY SNAPSHOT */}
      <section className="bg-secondary/40 rounded-3xl p-8 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex gap-12 md:gap-24 flex-wrap">
          <div className="flex flex-col gap-1">
             <span className="text-3xl font-semibold text-foreground">{totalMembers}</span>
             <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Members</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-3xl font-semibold text-foreground">{totalGenerations}</span>
             <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Generations</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-3xl font-semibold text-foreground">{relationshipsCount}</span>
             <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Connections</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground max-w-xs md:text-right border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
           Building your heritage with every new memory, person, and relationship added.
        </div>
      </section>

      {/* Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Column (Memories & Tree Preview) */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* MEMORIES HIGHLIGHT */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-semibold tracking-tight">Recent Memories</h2>
              <Link href="/dashboard/timeline">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View timeline
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {recentMemories.length > 0 ? (
              <div className="space-y-6">
                {/* Featured Memory */}
                <Link href={`/memories/${recentMemories[0].id}`}>
                  <div className="group relative rounded-3xl overflow-hidden bg-muted aspect-video border border-border shadow-sm transition-all hover:shadow-md cursor-pointer block">
                    {recentMemories[0].media && recentMemories[0].media.length > 0 ? (
                      <Image
                        src={recentMemories[0].media[0].url}
                        alt={recentMemories[0].title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    ) : recentMemories[0].albumCoverUrl ? (
                      <img
                        src={recentMemories[0].albumCoverUrl}
                        alt={recentMemories[0].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                         <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                       <span className="text-xs font-medium bg-primary/20 text-primary-foreground backdrop-blur-md px-3 py-1 rounded-full mb-3 inline-block">
                       {new Date(recentMemories[0].date).getFullYear()}
                     </span>
                     <h3 className="text-2xl font-semibold text-foreground mb-2">{recentMemories[0].title}</h3>
                     {recentMemories[0].description && (
                       <p className="text-muted-foreground line-clamp-2 max-w-lg">{recentMemories[0].description}</p>
                     )}
                  </div>
                </div>
                </Link>

                {recentMemories.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recentMemories.slice(1).map((memory) => (
                      <Link key={memory.id} href={`/memories/${memory.id}`}>
                        <div className="rounded-2xl p-6 bg-card border border-border flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer h-full">
                           <div>
                              <span className="text-xs font-medium text-muted-foreground mb-2 inline-block">
                                {new Date(memory.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                              </span>
                              <h4 className="text-lg font-medium text-foreground mb-2">{memory.title}</h4>
                              {memory.description && (
                                 <p className="text-sm text-muted-foreground line-clamp-2">{memory.description}</p>
                              )}
                           </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No memories yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Start preserving your family&apos;s history by adding photographs, stories, and historical events.
                </p>
                <Link href="/dashboard/timeline">
                  <Button variant="secondary" className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a Memory
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* FAMILY TREE PREVIEW */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-semibold tracking-tight">The Family Tree</h2>
            </div>
            <div className="relative rounded-3xl bg-secondary/30 border border-border h-80 overflow-hidden flex items-center justify-center group cursor-pointer transition-colors hover:bg-secondary/50 shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background/0 to-background/0 pointer-events-none" />
              
              {/* REAL TREE PREVIEW */}
              <div className="w-full h-full relative z-10 pointer-events-none">
                <DashboardTreePreview treeId={activeTreeId} />
              </div>

              {/* OVERLAY ACTION */}
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/10 backdrop-blur-[1px]">
                <div className="bg-background/90 text-foreground font-medium px-6 py-3 rounded-full shadow-lg border border-border flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  Explore Family Tree <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Side Column (Dates, Timeline, People) */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* PEOPLE / PORTRAIT STRIP */}
          {featuredMembers.length > 0 && (
            <section>
              <h2 className="text-lg font-serif font-semibold tracking-tight mb-4">Your Family</h2>
              <div className="flex flex-wrap gap-2">
                {featuredMembers.map((member) => (
                  <Link key={member.id} href={`/members`}>
                    <div className="w-12 h-12 rounded-full bg-secondary border border-border overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm">
                      {member.imageUrl ? (
                        <Image src={member.imageUrl} alt={member.firstName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground bg-muted">
                           {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                {totalMembers > 6 && (
                  <Link href="/members">
                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-muted transition-colors shadow-sm cursor-pointer">
                      +{totalMembers - 6}
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* UPCOMING DATES */}
          <section className="bg-card rounded-3xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif font-semibold tracking-tight">Upcoming Dates</h2>
            </div>
            
            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-5">
                {upcomingBirthdays.map((bday) => (
                  <div key={bday.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative shrink-0">
                       {bday.imageUrl ? (
                          <Image src={bday.imageUrl} alt={bday.name} fill className="object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground bg-secondary">
                             {bday.name.charAt(0)}
                          </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{bday.name}</p>
                      <p className="text-xs text-muted-foreground">Turning {bday.ageTurning}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{bday.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">
                        {bday.daysRemaining === 0 ? 'Today!' : `in ${bday.daysRemaining}d`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                 <p className="text-sm text-muted-foreground">No upcoming birthdays soon.</p>
              </div>
            )}
          </section>

          {/* TIMELINE PREVIEW */}
          <section className="bg-card rounded-3xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif font-semibold tracking-tight">Recent Activity</h2>
            </div>

            {timelinePreviewEvents.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border before:hidden">
                <div className="space-y-5 relative">
                  {/* Subtle timeline track */}
                  <div className="absolute top-2 bottom-2 left-[5px] w-px bg-border/60" />
                  
                  {timelinePreviewEvents.map((evt) => (
                    <div key={evt.id} className="flex gap-4 relative z-10">
                      <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary mt-1.5 shrink-0 bg-background" />
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">{evt.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {evt.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <Link href="/dashboard/timeline" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    View full timeline <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                 No recent events.
              </div>
            )}
          </section>

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
