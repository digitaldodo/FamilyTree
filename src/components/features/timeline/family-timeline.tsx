'use client';

import { TimelineEvent, TimelineEventProps } from './timeline-event';
import { Plus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FamilyTimelineProps {
  events: TimelineEventProps['event'][];
  onEventClick?: (event: any) => void;
  onAddMemory?: () => void;
  familyName?: string;
  canEdit?: boolean;
}

export function FamilyTimeline({ events, onEventClick, onAddMemory, familyName, canEdit = true }: FamilyTimelineProps) {
  // Normalize events to ensure it is always an array
  const safeEvents = Array.isArray(events) ? events : [];

  // Sort events chronologically (oldest first)
  const sortedEvents = [...safeEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-6">
      {/* TIMELINE HERO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-border/50">
        <div>
          <h1 className="text-4xl font-serif font-semibold tracking-tight text-foreground mb-3">
            {familyName ? `${familyName} Family History` : 'Family History'}
          </h1>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            A beautiful digital archive of the moments that shaped your family. From the earliest known ancestors to the present day.
          </p>
        </div>
        {canEdit && onAddMemory && (
          <Button 
            onClick={onAddMemory}
            className="rounded-full shadow-sm shrink-0 px-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
        )}
      </div>

      <div className="relative">
        {/* Main timeline vertical line - keeping strong contrast */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-zinc-300 dark:bg-zinc-700 -translate-x-1/2 rounded-full" />

        {sortedEvents.length > 0 ? (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => {
              const currentYear = new Date(event.date).getFullYear();
              const prevYear = index > 0 ? new Date(sortedEvents[index - 1].date).getFullYear() : null;
              const showYear = currentYear !== prevYear;

              return (
                <div key={event.id} className="relative">
                  {showYear && (
                    <div className="relative flex justify-center my-12 md:my-16 pointer-events-none">
                      <div className="bg-background border-2 border-border/60 text-muted-foreground px-5 py-1.5 rounded-full shadow-sm z-10 flex items-center gap-2">
                        <span className="font-serif text-xl font-medium tracking-wide">
                          {currentYear}
                        </span>
                      </div>
                    </div>
                  )}
                  <TimelineEvent
                    event={event}
                    index={index}
                    onClick={onEventClick}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-border rounded-3xl shadow-sm relative z-10 max-w-lg mx-auto mt-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 px-8">
              <div className="w-20 h-20 mx-auto bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-3">
                The archive is empty
              </h3>
              <p className="text-[15px] text-muted-foreground mb-8">
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
