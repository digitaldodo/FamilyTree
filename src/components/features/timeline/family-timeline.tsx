'use client';

import { motion } from 'framer-motion';
import { TimelineEvent, TimelineEventProps } from './timeline-event';
import { Calendar } from 'lucide-react';

interface FamilyTimelineProps {
  events: TimelineEventProps['event'][];
  onEventClick?: (event: any) => void;
}

export function FamilyTimeline({ events, onEventClick }: FamilyTimelineProps) {
  // Normalize events to ensure it is always an array
  const safeEvents = Array.isArray(events) ? events : [];

  // Sort events chronologically
  const sortedEvents = [...safeEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by decade
  const groupedEvents: Record<string, TimelineEventProps['event'][]> = {};

  sortedEvents.forEach((event) => {
    const year = new Date(event.date).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    if (!groupedEvents[decade]) {
      groupedEvents[decade] = [];
    }
    groupedEvents[decade].push(event);
  });

  const decades = Object.keys(groupedEvents).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Family History
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Explore the chronological journey of your family across generations.
          From births and marriages to major life events.
        </p>
      </div>

      <div className="relative">
        {/* Main timeline vertical line - ensuring strong contrast */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-300 dark:bg-zinc-600 -translate-x-1/2" />

        {events.length > 0 ? (
          decades.map((decade, groupIndex) => (
            <div key={decade} className="mb-24">
              {/* Decade marker */}
              <div className="relative flex justify-center mb-16">
                <div className="absolute left-4 md:left-1/2 w-0.5 h-full bg-zinc-300 dark:bg-zinc-600 -translate-x-1/2" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-zinc-300 dark:border-zinc-600 px-6 py-2 rounded-full shadow-sm z-10 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-serif text-lg font-medium text-foreground tracking-wide">
                    {decade}s
                  </span>
                </motion.div>
              </div>

              {/* Events in decade */}
              <div className="space-y-4">
                {groupedEvents[decade].map((event, index) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    index={groupIndex % 2 === 0 ? index : index + 1}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-card border border-border rounded-2xl relative z-10 max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-xl font-serif font-medium mb-3">
              Your family story begins here.
            </h3>
            <p className="text-[15px] text-muted-foreground mb-8 px-6">
              Start preserving the moments that shaped your family. Add photographs, memories, and milestones to create a digital archive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
