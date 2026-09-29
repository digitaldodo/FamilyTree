'use client';

import React from 'react';
import { TimelineEvent, TimelineEventProps } from './timeline-event';
import { Plus, ImageIcon, Baby, Heart, Bird, Camera, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineEventType } from './timeline-event';

interface FamilyTimelineProps {
  events: TimelineEventProps['event'][];
  onEventClick?: (event: any) => void;
  onAddMemory?: () => void;
  onAddContextualMemory?: (event: any) => void;
  familyName?: string;
  canEdit?: boolean;
}

const getEventIcon = (type: TimelineEventType) => {
  switch (type) {
    case 'BIRTH':
    case 'CHILD_BORN':
      return <Baby className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'MARRIAGE':
      return <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    case 'DEATH':
      return <Bird className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
    case 'MEMORY':
      return <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    default:
      return <Star className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
  }
};

const getEventBg = (type: TimelineEventType) => {
  switch (type) {
    case 'BIRTH':
    case 'CHILD_BORN':
      return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50';
    case 'MARRIAGE':
      return 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50';
    case 'DEATH':
      return 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800';
    case 'MEMORY':
      return 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50';
    default:
      return 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900/50';
  }
};

export function FamilyTimeline({ events, onEventClick, onAddMemory, onAddContextualMemory, familyName, canEdit = true }: FamilyTimelineProps) {
  const safeEvents = Array.isArray(events) ? events : [];

  const sortedEvents = [...safeEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-6">
      {/* TIMELINE HERO */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground mb-2">
            {familyName ? `${familyName} Family History` : 'Family History'}
          </h1>
          <p className="text-[15px] md:text-base text-muted-foreground leading-relaxed">
            A chronological story of your family across generations.
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

      <div className="mt-4">
        {sortedEvents.length > 0 ? (
          <div className="flex flex-col">
            {sortedEvents.map((event, index) => {
              const currentYear = new Date(event.date).getFullYear();
              const prevYear = index > 0 ? new Date(sortedEvents[index - 1].date).getFullYear() : null;
              const showYear = currentYear !== prevYear;
              const isLastEvent = index === sortedEvents.length - 1;

              return (
                <div key={event.id} className="flex flex-col">
                  {/* Year Marker Segment */}
                  {showYear && (
                    <div className="flex relative z-10 group">
                      <div className="w-14 sm:w-20 shrink-0 flex flex-col items-center">
                        {/* Only draw top line if it's not the absolute first year marker */}
                        <div className={`w-px bg-border/60 ${index === 0 ? 'h-6 sm:h-8 opacity-0' : 'flex-1'}`} />
                        <div className="w-2.5 h-2.5 rounded-full bg-border/80 my-3 sm:my-4" />
                        <div className="w-px bg-border/60 flex-1" />
                      </div>
                      <div className="flex-1 py-4 sm:py-6 min-w-0 pr-2">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground/80">
                          {currentYear}
                        </h2>
                      </div>
                    </div>
                  )}

                  {/* Event Segment */}
                  <div className="flex relative group">
                    {/* Spine Column */}
                    <div className="w-14 sm:w-20 shrink-0 flex flex-col items-center">
                      <div className="w-px bg-border/60 h-6 sm:h-8" />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm border ring-4 ring-background ${getEventBg(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      {/* Flex-1 line connects seamlessly to the next row's top line. We hide it on the last element if we don't want it dangling. */}
                      <div className={`w-px bg-border/60 ${isLastEvent ? 'h-6 sm:h-8' : 'flex-1'}`} />
                    </div>
                    
                    {/* Event Content Column */}
                    <div className="flex-1 pb-8 sm:pb-12 min-w-0 pt-2 sm:pt-4">
                      <TimelineEvent
                        event={event}
                        onClick={onEventClick}
                        onAddContextualMemory={onAddContextualMemory}
                      />
                    </div>
                  </div>
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
