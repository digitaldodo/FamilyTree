/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { MemberAvatar } from '../members/member-avatar';

export type TimelineEventType =
  'BIRTH' | 'MARRIAGE' | 'DEATH' | 'CHILD_BORN' | 'CUSTOM' | 'MEMORY';

export interface TimelineEventProps {
  event: {
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string;
    date: Date;
    members: { id: string; name: string; imageUrl?: string | null }[];
    mediaCount?: number;
    hasAlbum?: boolean;
    memoryData?: any;
  };
  index: number;
  onClick?: (event: any) => void;
}

const getEventIcon = (type: TimelineEventType) => {
  switch (type) {
    case 'BIRTH':
      return <span className="text-sm">🎂</span>;
    case 'MARRIAGE':
      return <span className="text-sm">💍</span>;
    case 'DEATH':
      return <span className="text-sm">🕊</span>;
    case 'CHILD_BORN':
      return <span className="text-sm">👶</span>;
    case 'MEMORY':
      return <span className="text-sm">📸</span>;
    case 'CUSTOM':
      return <span className="text-sm">✨</span>;
  }
};

const getEventBg = (type: TimelineEventType) => {
  return 'bg-foreground text-background ring-border';
};

export function TimelineEvent({ event, index, onClick }: TimelineEventProps) {
  const isEven = index % 2 === 0;
  const safeMembers = Array.isArray(event.members) ? event.members : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`relative flex items-center justify-between md:justify-normal w-full mb-12 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Center timeline dot */}
      <div className="absolute left-4 md:left-1/2 w-10 h-10 -translate-x-1/2 rounded-full ring-2 ring-background bg-background flex items-center justify-center z-10 shadow-sm">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventBg(event.type)}`}
        >
          {getEventIcon(event.type)}
        </div>
      </div>

      {/* Content */}
      <div
        className={`w-full md:w-5/12 ml-14 md:ml-0 ${isEven ? 'md:pr-14 md:text-right' : 'md:pl-14'}`}
      >
        <div
          onClick={() => onClick && onClick(event)}
          className={`bg-card border border-border rounded-lg p-4 shadow-sm relative group transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-border' : 'hover:shadow-md'}`}
        >
          {/* Connector line from box to center dot for desktop */}
          <div
            className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-14 border-t border-border/50 border-dashed ${isEven ? '-right-14' : '-left-14'}`}
          />

          <div className="flex flex-col gap-1 mb-3">
            <span className="text-xs font-semibold text-foreground">
              {format(new Date(event.date), 'MMMM d, yyyy')}
            </span>
            <h3 className="text-lg font-medium">{event.title}</h3>
            {event.type === 'MEMORY' && (
              <div className="flex gap-2 mt-2">
                {event.mediaCount ? (
                  <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                    📸 {event.mediaCount} Photos
                  </span>
                ) : null}
                {event.hasAlbum && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                    🔗 Google Photos
                  </span>
                )}
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
              {event.description}
            </p>
          )}

          <div
            className={`flex items-center gap-2 mt-4 ${isEven ? 'md:justify-end' : ''}`}
          >
            <div className="flex -space-x-2">
              {safeMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative w-6 h-6 rounded-full ring-2 ring-card bg-muted flex items-center justify-center overflow-hidden"
                  title={member.name}
                >
                  <MemberAvatar
                    imageUrl={member.imageUrl}
                    firstName={member.name.split(' ')[0]}
                    lastName={member.name.split(' ')[1] || ''}
                    fallbackSize={12}
                  />
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              {safeMembers.length}{' '}
              {safeMembers.length === 1 ? 'member' : 'members'} involved
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
