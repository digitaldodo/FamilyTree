'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Camera, Heart, Baby, Star, Bird, ImageIcon, Plus } from 'lucide-react';
import { MemberAvatar } from '../members/member-avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    associatedMemories?: any[];
  };
  index: number;
  onClick?: (event: any) => void;
  onAddContextualMemory?: (event: any) => void;
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
      return 'bg-emerald-100 dark:bg-emerald-950/50 ring-emerald-200 dark:ring-emerald-900/50';
    case 'MARRIAGE':
      return 'bg-rose-100 dark:bg-rose-950/50 ring-rose-200 dark:ring-rose-900/50';
    case 'DEATH':
      return 'bg-zinc-100 dark:bg-zinc-900 ring-zinc-200 dark:ring-zinc-800';
    case 'MEMORY':
      return 'bg-amber-100 dark:bg-amber-950/50 ring-amber-200 dark:ring-amber-900/50';
    default:
      return 'bg-sky-100 dark:bg-sky-950/50 ring-sky-200 dark:ring-sky-900/50';
  }
};

export function TimelineEvent({ event, index, onClick, onAddContextualMemory }: TimelineEventProps) {
  const isEven = index % 2 === 0;
  const safeMembers = Array.isArray(event.members) ? event.members : [];
  
  const isMemory = event.type === 'MEMORY';
  const memoryMedia = event.memoryData?.media;
  const hasCoverPhoto = isMemory && Array.isArray(memoryMedia) && memoryMedia.length > 0;
  const primaryMember = safeMembers[0];
  const associatedMemoriesCount = event.associatedMemories?.length || 0;

  const isDeath = event.type === 'DEATH';
  const isBirth = event.type === 'BIRTH' || event.type === 'CHILD_BORN';

  // Card background styling based on event type
  let cardClass = "bg-card rounded-2xl overflow-hidden shadow-sm border border-border transition-all ";
  if (isMemory) {
    cardClass += "group-hover:shadow-md group-hover:border-primary/30 cursor-pointer ";
  } else if (isDeath) {
    cardClass += "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50 ";
  } else if (isBirth) {
    cardClass += "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/30 ";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className={`relative flex items-start justify-between md:justify-normal w-full mb-8 md:mb-12 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Center timeline dot - Subtle yet visible */}
      <div className="absolute left-6 md:left-1/2 w-10 h-10 -translate-x-1/2 rounded-full bg-background flex items-center justify-center z-10 shadow-sm mt-2 md:mt-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ${getEventBg(event.type)}`}>
          {getEventIcon(event.type)}
        </div>
      </div>

      {/* Content */}
      <div className={`w-full md:w-5/12 ml-14 md:ml-0 ${isEven ? 'md:pr-14 md:text-right' : 'md:pl-14'}`}>
        <div
          onClick={() => isMemory && onClick && onClick(event)}
          className={`relative group ${cardClass} ${isEven ? 'text-right' : 'text-left'}`}
        >
          {/* Milestone Layout (Non-Memory) */}
          {!isMemory && (
            <div className="p-5 md:p-6 flex flex-col gap-3">
              <div className={`flex flex-wrap items-center gap-3 ${isEven ? 'md:justify-end' : ''}`}>
                <span className={`text-xs font-bold tracking-widest uppercase ${isDeath ? 'text-zinc-500' : 'text-primary'}`}>
                  {format(new Date(event.date), 'MMMM d, yyyy')}
                </span>
              </div>
              
              <div className={`flex items-start gap-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                {primaryMember && (
                  <div className="shrink-0 mt-1">
                    <MemberAvatar
                      imageUrl={primaryMember.imageUrl}
                      firstName={primaryMember.name.split(' ')[0]}
                      lastName={primaryMember.name.split(' ')[1] || ''}
                      fallbackSize={24}
                      className={`w-12 h-12 md:w-16 md:h-16 shadow-sm border-2 ${isDeath ? 'border-zinc-200 dark:border-zinc-800 grayscale' : 'border-background'}`}
                    />
                  </div>
                )}
                <div className={`flex flex-col gap-1.5 ${isEven ? 'items-end text-right' : 'items-start text-left'}`}>
                  <h3 className={`text-xl md:text-2xl font-semibold font-serif leading-tight ${isDeath ? 'text-zinc-700 dark:text-zinc-300' : 'text-foreground'}`}>
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className={`text-[15px] ${isDeath ? 'text-zinc-500 dark:text-zinc-400' : 'text-muted-foreground'}`}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Other members if any (e.g. spouse in marriage) */}
              {safeMembers.length > 1 && (
                <div className={`flex flex-wrap items-center gap-2 mt-2 ${isEven ? 'md:justify-end' : ''}`}>
                  {safeMembers.slice(1).map((member) => (
                    <div key={member.id} className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-full border border-border/50">
                      <MemberAvatar
                        imageUrl={member.imageUrl}
                        firstName={member.name.split(' ')[0]}
                        lastName={member.name.split(' ')[1] || ''}
                        fallbackSize={10}
                        className="w-5 h-5"
                      />
                      <span className="text-xs font-medium text-foreground pr-1">{member.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Memory Previews */}
              {associatedMemoriesCount > 0 ? (
                <div className={`mt-2 flex items-center gap-2 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                  <div className="flex -space-x-2">
                    {event.associatedMemories!.slice(0, 3).map((mem: any, i: number) => {
                      const hasCover = mem.media && mem.media.length > 0;
                      return (
                        <div key={mem.id || i} className="w-8 h-8 rounded-md bg-muted border-2 border-background overflow-hidden relative shadow-sm z-10">
                          {hasCover ? (
                            <Image src={mem.media[0].url} alt="Memory" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                              <Camera className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {associatedMemoriesCount} {associatedMemoriesCount === 1 ? 'memory' : 'memories'}
                  </span>
                </div>
              ) : (isBirth || isDeath) ? (
                <div className={`mt-2 flex items-center gap-2 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                   <span className="text-xs font-medium text-muted-foreground/70 italic">
                     No memories yet
                   </span>
                </div>
              ) : null}

              {/* Actions */}
              <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-border/40 ${isEven ? 'md:justify-end' : ''}`}>
                {primaryMember && (
                  <Link href={`/dashboard/members/${primaryMember.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground">
                      View Profile
                    </Button>
                  </Link>
                )}
                {onAddContextualMemory && (
                  <Button 
                    onClick={(e) => { e.stopPropagation(); onAddContextualMemory(event); }}
                    variant="outline" 
                    size="sm" 
                    className={`h-8 px-3 text-xs rounded-full shadow-sm ${isDeath ? 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800' : ''}`}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Memory
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Memory Layout */}
          {isMemory && (
            <>
              {hasCoverPhoto && (
                <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
                  <Image 
                    src={memoryMedia[0].url} 
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  {/* Photo badges overlay */}
                  <div className={`absolute bottom-4 ${isEven ? 'right-4' : 'left-4'} flex gap-2`}>
                    {event.mediaCount && event.mediaCount > 1 && (
                      <span className="flex items-center gap-1.5 text-xs bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-medium border border-white/10">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {event.mediaCount}
                      </span>
                    )}
                    {event.hasAlbum && (
                      <span className="flex items-center gap-1.5 text-xs bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-medium border border-white/10">
                        <Camera className="w-3.5 h-3.5" />
                        Album
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-5 md:p-6">
                <div className={`flex flex-wrap items-center gap-3 mb-2 ${isEven ? 'md:justify-end' : ''}`}>
                  <span className="text-xs font-bold tracking-widest text-primary uppercase">
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </span>
                  {event.memoryData?.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        {event.memoryData.location}
                      </span>
                    </>
                  )}
                </div>
                
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3 leading-tight font-serif">
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className="text-[15px] leading-relaxed text-muted-foreground line-clamp-3 mb-5">
                    {event.description}
                  </p>
                )}

                {safeMembers.length > 0 && (
                  <div className={`flex items-center -space-x-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
                    {safeMembers.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="relative w-8 h-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center overflow-hidden"
                        title={member.name}
                      >
                        <MemberAvatar
                          imageUrl={member.imageUrl}
                          firstName={member.name.split(' ')[0]}
                          lastName={member.name.split(' ')[1] || ''}
                          fallbackSize={14}
                        />
                      </div>
                    ))}
                    {safeMembers.length > 4 && (
                      <div className="relative w-8 h-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10">
                        +{safeMembers.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </motion.div>
  );
}
