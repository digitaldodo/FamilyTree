'use client';

import { TimelineEvent, TimelineEventProps } from './timeline-event';
import { Plus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FamilyTimelineProps {
  events: TimelineEventProps['event'][];
  onEventClick?: (event: any) => void;
  onAddMemory?: () => void;
  onAddContextualMemory?: (event: any) => void;
  familyName?: string;
  canEdit?: boolean;
}

export function FamilyTimeline({ events, onEventClick, onAddMemory, onAddContextualMemory, familyName, canEdit = true }: FamilyTimelineProps) {
  // Normalize events to ensure it is always an array
  const safeEvents = Array.isArray(events) ? events : [];

  // Sort events chronologically (oldest first)
  const sortedEvents = [...safeEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-12 px-4 md:px-6">
      {/* TIMELINE HERO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground mb-2 md:mb-3">
            {familyName ? `${familyName} Family History` : 'Family History'}
          </h1>
          <p className="text-[15px] md:text-base text-muted-foreground max-w-xl leading-relaxed">
            A beautiful digital archive of the moments that shaped your family. From the earliest known ancestors to the present day.
          </p>
        </div>
        {canEdit && onAddMemory && (
          <Button 
            onClick={onAddMemory}
            className="rounded-full shadow-sm shrink-0 px-6 h-10 md:h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
        )}
      </div>

      <div className="relative mt-4">
        {/* Main timeline vertical line - keeping strong contrast */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-200/80 dark:bg-zinc-800 -translate-x-[1px] rounded-full" />

        {sortedEvents.length > 0 ? (
          <div className="space-y-2 md:space-y-4">
            {sortedEvents.map((event, index) => {
              const currentYear = new Date(event.date).getFullYear();
              const prevYear = index > 0 ? new Date(sortedEvents[index - 1].date).getFullYear() : null;
              const showYear = currentYear !== prevYear;

              return (
                <div key={event.id} className="relative">
                  {showYear && (
                    <div className="relative flex justify-start md:justify-center my-6 md:my-10 pointer-events-none z-10 pl-6 md:pl-0">
                      <div className="bg-background border border-border/60 text-foreground px-3 py-1 rounded-md shadow-sm flex items-center -translate-x-1/2 md:translate-x-0">
                        <span className="font-serif text-[15px] md:text-lg font-medium tracking-widest text-zinc-600 dark:text-zinc-400">
                          {currentYear}
                        </span>
                      </div>
                    </div>
                  )}
                  <TimelineEvent
                    event={event}
                    index={index}
                    onClick={onEventClick}
                    onAddContextualMemory={onAddContextualMemory}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 bg-card border border-border rounded-3xl shadow-sm relative z-10 max-w-lg mx-auto mt-8 md:mt-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 px-6 md:px-8">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
                <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-3">
                The archive is empty
              </h3>
              <p className="text-[14px] md:text-[15px] text-muted-foreground mb-8">
                Your timeline will automatically build itself as you add family members and memories.
              </p>
              {canEdit && onAddMemory && (
                <Button onClick={onAddMemory} className="rounded-full px-8 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Memory
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
