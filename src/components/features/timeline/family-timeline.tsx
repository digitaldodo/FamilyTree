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
      return <Baby className="w-4 h-4 text-primary" />;
    case 'MARRIAGE':
      return <Heart className="w-4 h-4 text-accent" />;
    case 'DEATH':
      return <Bird className="w-4 h-4 text-muted-foreground" />;
    case 'MEMORY':
      return <Camera className="w-4 h-4 text-accent" />;
    default:
      return <Star className="w-4 h-4 text-primary" />;
  }
};

const getEventBg = (type: TimelineEventType) => {
  switch (type) {
    case 'BIRTH':
    case 'CHILD_BORN':
      return 'bg-primary/10 border-primary/20';
    case 'MARRIAGE':
      return 'bg-accent/10 border-accent/20';
    case 'DEATH':
      return 'bg-muted border-border';
    case 'MEMORY':
      return 'bg-accent/10 border-accent/20';
    default:
      return 'bg-primary/10 border-primary/20';
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
          <div className="flex flex-col relative before:absolute before:inset-0 before:ml-7 sm:before:ml-10 md:before:mx-auto md:before:w-px md:before:bg-border/60 md:before:left-0 md:before:right-0">
            {sortedEvents.map((event, index) => {
              const currentYear = new Date(event.date).getFullYear();
              const prevYear = index > 0 ? new Date(sortedEvents[index - 1].date).getFullYear() : null;
              const showYear = currentYear !== prevYear;
              
              const isEven = index % 2 === 0;

              return (
                <div key={event.id} className="flex flex-col">
                  {/* Year Marker Segment */}
                  {showYear && (
                    <div className="flex md:justify-center relative z-10 group mt-4 mb-8 md:mb-12">
                      <div className="w-14 sm:w-20 md:w-auto shrink-0 flex items-center md:justify-center">
                        <div className="hidden md:flex w-full items-center justify-center">
                          <div className="px-4 py-1.5 rounded-full bg-background border border-border shadow-sm">
                            <h2 className="text-lg md:text-xl font-serif font-bold tracking-tight text-foreground/80">
                              {currentYear}
                            </h2>
                          </div>
                        </div>
                        {/* Mobile Year */}
                        <div className="md:hidden flex flex-col items-center w-full">
                          <div className="w-2.5 h-2.5 rounded-full bg-border/80 my-3 sm:my-4" />
                        </div>
                      </div>
                      <div className="md:hidden flex-1 py-4 sm:py-6 min-w-0 pr-2">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground/80">
                          {currentYear}
                        </h2>
                      </div>
                    </div>
                  )}

                  {/* Event Segment */}
                  <div className="flex md:justify-between items-center w-full relative group mb-8 md:mb-12">
                    
                    {/* Left Side (Desktop Only for Odd indices, Mobile it's nothing) */}
                    <div className={`hidden md:block w-[calc(50%-2rem)] ${!isEven ? 'md:order-1' : 'md:order-3'}`}>
                      {!isEven && (
                        <div className="w-full">
                          <TimelineEvent
                            event={event}
                            onClick={onEventClick}
                            onAddContextualMemory={onAddContextualMemory}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Spine Column */}
                    <div className="w-14 sm:w-20 md:w-16 shrink-0 flex flex-col items-center justify-center relative z-10 md:order-2">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm border ring-4 ring-background ${getEventBg(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                    </div>
                    
                    {/* Right Side (Content for Even indices, and Mobile Content) */}
                    <div className={`flex-1 md:w-[calc(50%-2rem)] md:flex-none min-w-0 md:order-3 ${isEven ? '' : 'md:hidden'}`}>
                      <div className="w-full">
                        <TimelineEvent
                          event={event}
                          onClick={onEventClick}
                          onAddContextualMemory={onAddContextualMemory}
                        />
                      </div>
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
