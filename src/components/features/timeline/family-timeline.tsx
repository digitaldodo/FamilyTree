'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
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

const CHALK = '#efe6d2';

const pathMobile = "M 15 0 C 15 12, 7 28, 15 50 C 23 72, 15 88, 15 100";
const pathDesktopEven = "M 50 0 C 50 12, 38 26, 45 50 C 52 74, 50 88, 50 100";
const pathDesktopOdd = "M 50 0 C 50 12, 62 26, 55 50 C 48 74, 50 88, 50 100";

function ChalkFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <filter id="chalk-stroke" x="-60%" y="-2%" width="220%" height="104%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.35 0.12" numOctaves="2" seed="7" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="0.9" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="1.6 0.45" numOctaves="2" seed="3" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.1 0 0 0 0.3" result="grainAlpha" />
          <feComposite in="rough" in2="grainAlpha" operator="in" />
        </filter>
        <filter id="chalk-dust" x="-80%" y="-2%" width="260%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.3 0.1" numOctaves="2" seed="11" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feGaussianBlur in="rough" stdDeviation="0.35 0.15" />
        </filter>
      </defs>
    </svg>
  );
}

function ChalkLine({ d, lineProgress, activity, drift }: { d: string; lineProgress: MotionValue<number>; activity: MotionValue<number>; drift: MotionValue<number> }) {
  return (
    <motion.g style={{ x: drift }}>
      {/* unrevealed trace: faint chalk ghost */}
      <path d={d} stroke={CHALK} strokeOpacity="0.13" strokeWidth="1.6" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" filter="url(#chalk-stroke)" />
      {/* soft powdery halo */}
      <motion.path d={d} stroke={CHALK} strokeOpacity="0.16" strokeWidth="6" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" filter="url(#chalk-dust)" style={{ pathLength: lineProgress }} />
      {/* dense central stroke */}
      <motion.path d={d} stroke={CHALK} strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" vectorEffect="non-scaling-stroke" filter="url(#chalk-stroke)" style={{ pathLength: lineProgress }} />
      {/* brighter chalk on the active section */}
      <motion.path d={d} stroke="#fbf5e6" strokeWidth="1.5" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" filter="url(#chalk-stroke)" style={{ pathLength: lineProgress, strokeOpacity: activity }} />
    </motion.g>
  );
}

function CinematicEventRow({ event, isEven, index, onEventClick, onAddContextualMemory, showYear, currentYear }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  
  const { scrollYProgress: lineProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });

  const { scrollYProgress: cardProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"]
  });

  const cardOpacity = useTransform(cardProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);
  const cardScale = useTransform(cardProgress, [0, 0.15, 0.85, 1], [0.97, 1, 1, 0.97]);
  const activity = useTransform(cardProgress, [0.1, 0.35, 0.65, 0.9], [0, 0.55, 0.55, 0]);
  // zero at both row edges so neighbouring rows always join seamlessly
  const drift = useTransform(cardProgress, (p) => reduceMotion ? 0 : Math.sin(p * Math.PI) * 0.35);
  const dotScale = useTransform(lineProgress, [0.45, 0.5], [0, 1]);
  const dotOpacity = useTransform(lineProgress, [0.45, 0.5], [0, 1]);
  const yearOpacity = useTransform(cardProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  const isDeath = event.type === 'DEATH';
  const dotColor = isDeath ? 'bg-[#a39d8c] w-3 h-3 md:w-3.5 md:h-3.5' : 'bg-[#efe6d2] w-3.5 h-3.5 md:w-4 md:h-4';

  const dotClass = isEven ? 'md:left-[45%]' : 'md:left-[55%]';
  const cardAlignClass = isEven ? 'md:mr-auto md:pr-16 md:ml-0' : 'md:ml-auto md:pl-16 md:mr-0';

  return (
    <div ref={ref} className="relative w-full py-16 md:py-32 flex flex-col items-center justify-center min-h-[350px]">
       
       <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full md:hidden overflow-visible">
            <ChalkLine d={pathMobile} lineProgress={lineProgress} activity={activity} drift={drift} />
          </svg>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hidden md:block w-full h-full overflow-visible">
            <ChalkLine d={isEven ? pathDesktopEven : pathDesktopOdd} lineProgress={lineProgress} activity={activity} drift={drift} />
          </svg>
       </div>

       {showYear && (
         <motion.div style={{ opacity: yearOpacity }} className="absolute top-0 left-[15%] md:left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#0b100d] px-4 py-2 text-2xl md:text-4xl font-serif font-light text-[#e6dcc4] tracking-widest">
            {currentYear}
         </motion.div>
       )}

       <motion.div 
         className={`absolute top-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#0b100d] flex items-center justify-center z-10 -translate-x-1/2 left-[15%] ${dotClass} ${dotColor}`}
         style={{ scale: dotScale, opacity: dotOpacity }}
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
    <div className="max-w-[1440px] mx-auto py-12 md:py-24 px-4 md:px-8 rounded-2xl text-[#e6dcc4] bg-[#0b100d] bg-[radial-gradient(ellipse_at_top,#142019_0%,#0b100d_60%)]">
      <ChalkFilters />
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-16 md:mb-32">
        <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-[#f3ead3] mb-4">
          {familyName ? `${familyName} Chronicle` : 'Family Chronicle'}
        </h1>
        <p className="text-lg md:text-xl text-[#a8a493] font-light max-w-xl mx-auto leading-relaxed">
          A living journey through generations, captured in moments and memories.
        </p>
        {canEdit && onAddMemory && (
          <Button 
            onClick={onAddMemory}
            variant="outline"
            className="mt-8 rounded-full shadow-sm px-8 h-12 border-[#c9b872]/40 bg-transparent text-[#d8c984] hover:bg-[#c9b872]/10 hover:text-[#ecdc98]"
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
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-[#17211b] rounded-full flex items-center justify-center mb-8 border border-[#efe6d2]/15">
              <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-[#a8a493]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-medium mb-3 text-[#f3ead3]">
              The archive awaits
            </h3>
            <p className="text-base text-[#a8a493] mb-8 font-light">
              This space will grow into a rich family history as you document moments and milestones.
            </p>
            {canEdit && onAddMemory && (
              <Button onClick={onAddMemory} className="rounded-full px-8 shadow-sm h-12 bg-[#d8c984] text-[#0b100d] hover:bg-[#ecdc98]">
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
