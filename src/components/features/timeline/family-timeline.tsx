'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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

function CinematicEventRow({ event, isEven, index, onEventClick, onAddContextualMemory, showYear, currentYear }: any) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: lineProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });

  const { scrollYProgress: cardProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"]
  });

  const cardOpacity = useTransform(cardProgress, [0, 0.15, 0.85, 1], [0.2, 1, 1, 0.2]);
  const cardScale = useTransform(cardProgress, [0, 0.15, 0.85, 1], [0.95, 1, 1, 0.95]);

  const pathMobile = "M 15 0 C 18 25, 12 75, 15 100";
  const pathDesktopEven = "M 50 0 C 50 25, 45 25, 45 50 C 45 75, 50 75, 50 100";
  const pathDesktopOdd = "M 50 0 C 50 25, 55 25, 55 50 C 55 75, 50 75, 50 100";

  const isDeath = event.type === 'DEATH';
  const dotColor = isDeath ? 'bg-muted-foreground w-3 h-3 md:w-3.5 md:h-3.5' : 'bg-primary w-4 h-4 md:w-5 md:h-5';

  const dotClass = isEven ? 'md:left-[45%]' : 'md:left-[55%]';
  const cardAlignClass = isEven ? 'md:mr-auto md:pr-16 md:ml-0' : 'md:ml-auto md:pl-16 md:mr-0';

  return (
    <div ref={ref} className="relative w-full py-16 md:py-32 flex flex-col items-center justify-center min-h-[350px]">
       
       <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full md:hidden">
            <path d={pathMobile} stroke="currentColor" className="text-border/40" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
            <motion.path 
              d={pathMobile} 
              stroke="currentColor" 
              className="text-primary/70" 
              strokeWidth="2" 
              fill="none" 
              vectorEffect="non-scaling-stroke" 
              style={{ pathLength: lineProgress }} 
            />
          </svg>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hidden md:block w-full h-full">
            <path 
              d={isEven ? pathDesktopEven : pathDesktopOdd} 
              stroke="currentColor" 
              className="text-border/40" 
              strokeWidth="1" 
              fill="none" 
              vectorEffect="non-scaling-stroke" 
            />
            <motion.path 
              d={isEven ? pathDesktopEven : pathDesktopOdd} 
              stroke="currentColor" 
              className="text-primary/70" 
              strokeWidth="2" 
              fill="none" 
              vectorEffect="non-scaling-stroke" 
              style={{ pathLength: lineProgress }} 
            />
          </svg>
       </div>

       {showYear && (
         <div className="absolute top-0 left-[15%] md:left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background px-4 py-2 text-2xl md:text-4xl font-serif font-light text-foreground/80 tracking-widest">
            {currentYear}
         </div>
       )}

       <motion.div 
         className={`absolute top-1/2 -translate-y-1/2 rounded-full border-[3px] border-background flex items-center justify-center z-10 -translate-x-1/2 shadow-sm left-[15%] ${dotClass} ${dotColor}`}
         style={{ 
           scale: useTransform(lineProgress, [0.45, 0.5], [0, 1]),
           opacity: useTransform(lineProgress, [0.45, 0.5], [0, 1])
         }}
       />

       <motion.div 
         className={`relative z-20 w-[75%] md:w-[42%] ml-auto pr-2 md:pr-0 ${cardAlignClass}`}
         style={{ opacity: cardOpacity, scale: cardScale }}
       >
         <TimelineEvent event={event} onClick={onEventClick} onAddContextualMemory={onAddContextualMemory} />
       </motion.div>
    </div>
  );
}

export function FamilyTimeline({ events, onEventClick, onAddMemory, onAddContextualMemory, familyName, canEdit = true }: FamilyTimelineProps) {
  const safeEvents = Array.isArray(events) ? events : [];

  const sortedEvents = [...safeEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-[1440px] mx-auto py-12 md:py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-16 md:mb-32">
        <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground mb-4">
          {familyName ? `${familyName} Chronicle` : 'Family Chronicle'}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
          A living journey through generations, captured in moments and memories.
        </p>
        {canEdit && onAddMemory && (
          <Button 
            onClick={onAddMemory}
            variant="outline"
            className="mt-8 rounded-full shadow-sm px-8 h-12 border-primary/20 text-primary hover:bg-primary/5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Contribute to the Archive
          </Button>
        )}
      </div>

      <div className="relative">
        {sortedEvents.length > 0 ? (
          <div className="flex flex-col">
            {sortedEvents.map((event, index) => {
              const currentYear = new Date(event.date).getFullYear();
              const prevYear = index > 0 ? new Date(sortedEvents[index - 1].date).getFullYear() : null;
              const showYear = currentYear !== prevYear;
              
              const isEven = index % 2 === 0;

              return (
                <CinematicEventRow
                  key={event.id}
                  event={event}
                  isEven={isEven}
                  index={index}
                  onEventClick={onEventClick}
                  onAddContextualMemory={onAddContextualMemory}
                  showYear={showYear}
                  currentYear={currentYear}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 md:py-32 relative z-10 max-w-lg mx-auto overflow-hidden opacity-80">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-8 border border-border/50">
              <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-medium mb-3">
              The archive awaits
            </h3>
            <p className="text-base text-muted-foreground mb-8 font-light">
              This space will grow into a rich family history as you document moments and milestones.
            </p>
            {canEdit && onAddMemory && (
              <Button onClick={onAddMemory} className="rounded-full px-8 shadow-sm h-12 bg-primary/90 hover:bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Begin the Story
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
