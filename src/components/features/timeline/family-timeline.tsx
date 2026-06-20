"use client";

import { motion } from "framer-motion";
import { TimelineEvent, TimelineEventProps } from "./timeline-event";
import { Calendar } from "lucide-react";

interface FamilyTimelineProps {
  events: TimelineEventProps['event'][];
}

export function FamilyTimeline({ events }: FamilyTimelineProps) {
  // Normalize events to ensure it is always an array
  const safeEvents = Array.isArray(events) ? events : [];
  
  // Sort events chronologically
  const sortedEvents = [...safeEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group by decade
  const groupedEvents: Record<string, TimelineEventProps['event'][]> = {};
  
  sortedEvents.forEach(event => {
    const year = new Date(event.date).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    if (!groupedEvents[decade]) {
      groupedEvents[decade] = [];
    }
    groupedEvents[decade].push(event);
  });

  const decades = Object.keys(groupedEvents).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold tracking-tight mb-4">Family History</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the chronological journey of your family across generations. From births and marriages to major life events.
        </p>
      </div>

      <div className="relative">
        {/* Main timeline vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

        {events.length > 0 ? (
          decades.map((decade, groupIndex) => (
            <div key={decade} className="mb-16">
              {/* Decade marker */}
              <div className="relative flex justify-center mb-12">
                <div className="absolute left-4 md:left-1/2 w-0.5 h-full bg-primary/20 -translate-x-1/2" />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold shadow-lg z-10 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {decade}s
                </motion.div>
              </div>

              {/* Events in decade */}
              <div className="space-y-4">
                {groupedEvents[decade].map((event, index) => (
                  <TimelineEvent 
                    key={event.id} 
                    event={event} 
                    index={groupIndex % 2 === 0 ? index : index + 1} 
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-2xl relative z-10">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No historical events yet</h3>
            <p className="text-muted-foreground">Add dates to family members to automatically generate their timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
