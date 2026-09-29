'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Camera, ImageIcon, Plus } from 'lucide-react';
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
  onClick?: (event: any) => void;
  onAddContextualMemory?: (event: any) => void;
}

export function TimelineEvent({ event, onClick, onAddContextualMemory }: TimelineEventProps) {
  const safeMembers = Array.isArray(event.members) ? event.members : [];
  const isMemory = event.type === 'MEMORY';
  const memoryMedia = event.memoryData?.media;
  const hasCoverPhoto = isMemory && Array.isArray(memoryMedia) && memoryMedia.length > 0;
  const primaryMember = safeMembers[0];
  const associatedMemoriesCount = event.associatedMemories?.length || 0;

  const isDeath = event.type === 'DEATH';
  const isBirth = event.type === 'BIRTH' || event.type === 'CHILD_BORN';
  const isMarriage = event.type === 'MARRIAGE';

  // Card background styling based on event type
  let cardClass = "bg-card rounded-2xl overflow-hidden shadow-sm border border-border/80 transition-all w-full ";
  if (isMemory) {
    cardClass += "hover:shadow-md hover:border-primary/40 cursor-pointer group ";
  } else if (isDeath) {
    cardClass += "bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 ";
  } else if (isBirth) {
    cardClass += "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/40 ";
  } else if (isMarriage) {
    cardClass += "bg-rose-50/30 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/30 ";
  }

  // MEMORY LAYOUT
  if (isMemory) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
        onClick={() => onClick && onClick(event)}
        className={cardClass}
      >
        {hasCoverPhoto && (
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-muted overflow-hidden border-b border-border/40">
            <Image 
              src={memoryMedia[0].url} 
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
            
            <div className="absolute bottom-3 left-3 flex gap-2">
              {event.mediaCount && event.mediaCount > 1 && (
                <span className="flex items-center gap-1.5 text-xs bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded font-medium border border-white/10">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {event.mediaCount}
                </span>
              )}
              {event.hasAlbum && (
                <span className="flex items-center gap-1.5 text-xs bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded font-medium border border-white/10">
                  <Camera className="w-3.5 h-3.5" />
                  Album
                </span>
              )}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              {format(new Date(event.date), 'MMMM d, yyyy')}
            </span>
            {event.memoryData?.location && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {event.memoryData.location}
                </span>
              </>
            )}
          </div>
          
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2.5 leading-tight font-serif">
            {event.title}
          </h3>
          
          {event.description && (
            <p className="text-[15px] leading-relaxed text-muted-foreground line-clamp-2 mb-4">
              {event.description}
            </p>
          )}

          {safeMembers.length > 0 && (
            <div className="flex items-center -space-x-2 pt-1">
              {safeMembers.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center overflow-hidden"
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
              {safeMembers.length > 5 && (
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10">
                  +{safeMembers.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // MILESTONE / LIFE EVENT LAYOUT
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className={`${cardClass} flex flex-col`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
        
        {/* Left: Avatar (if single primary member) */}
        {primaryMember && !isMarriage && (
          <div className="shrink-0 flex sm:block items-center gap-3 sm:gap-0 border-b sm:border-0 border-border/40 pb-3 sm:pb-0 mb-1 sm:mb-0">
            <MemberAvatar
              imageUrl={primaryMember.imageUrl}
              firstName={primaryMember.name.split(' ')[0]}
              lastName={primaryMember.name.split(' ')[1] || ''}
              fallbackSize={24}
              className={`w-12 h-12 sm:w-16 sm:h-16 shadow-sm border-2 ${isDeath ? 'border-zinc-200 dark:border-zinc-700 grayscale' : 'border-background'}`}
            />
            <div className="sm:hidden flex flex-col">
              <div className={`font-semibold text-[15px] ${isDeath ? 'text-zinc-700 dark:text-zinc-300' : 'text-foreground'}`}>
                {primaryMember.name}
              </div>
              {event.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">{event.description}</div>
              )}
            </div>
          </div>
        )}

        {/* Left: avatars for marriage */}
        {isMarriage && safeMembers.length >= 2 && (
          <div className="shrink-0 flex items-center -space-x-3 sm:space-x-0 sm:flex-col sm:gap-2 border-b sm:border-0 border-border/40 pb-3 sm:pb-0 mb-1 sm:mb-0">
            <MemberAvatar
              imageUrl={safeMembers[0].imageUrl}
              firstName={safeMembers[0].name.split(' ')[0]}
              lastName={safeMembers[0].name.split(' ')[1] || ''}
              fallbackSize={16}
              className="w-10 h-10 sm:w-12 sm:h-12 shadow-sm border-2 border-background z-10"
            />
            <MemberAvatar
              imageUrl={safeMembers[1].imageUrl}
              firstName={safeMembers[1].name.split(' ')[0]}
              lastName={safeMembers[1].name.split(' ')[1] || ''}
              fallbackSize={16}
              className="w-10 h-10 sm:w-12 sm:h-12 shadow-sm border-2 border-background z-0"
            />
          </div>
        )}

        {/* Right: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          
          {/* Desktop Name/Context Header (Hidden on small screens where avatar handles it) */}
          {primaryMember && !isMarriage && (
            <div className="hidden sm:block mb-1">
              <div className={`font-semibold text-[15px] ${isDeath ? 'text-zinc-700 dark:text-zinc-300' : 'text-foreground'}`}>
                {primaryMember.name}
              </div>
              {event.description && (
                <div className="text-sm text-muted-foreground mt-0.5">{event.description}</div>
              )}
            </div>
          )}

          <div className="mt-1 sm:mt-1.5">
            <h4 className={`text-xl sm:text-2xl font-serif font-medium leading-snug ${isDeath ? 'text-zinc-800 dark:text-zinc-200' : 'text-foreground'}`}>
              {event.title}
            </h4>
            <div className={`text-xs sm:text-sm font-medium tracking-wide uppercase mt-1.5 ${isDeath ? 'text-zinc-500' : 'text-muted-foreground'}`}>
              {format(event.date, 'MMMM d, yyyy')}
            </div>
          </div>

          {/* Associated Memory Previews */}
          {associatedMemoriesCount > 0 ? (
            <div className="mt-3.5 flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {event.associatedMemories!.slice(0, 3).map((mem: any, i: number) => {
                  const hasCover = mem.media && mem.media.length > 0;
                  return (
                    <div key={mem.id || i} className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-muted border-2 border-background overflow-hidden relative shadow-sm z-10">
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
          ) : (isBirth || isDeath || isMarriage) ? (
            <div className="mt-3 text-xs text-muted-foreground/60 italic">
              No memories attached yet
            </div>
          ) : null}

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
            {onAddContextualMemory && (
              <Button 
                onClick={(e) => { e.stopPropagation(); onAddContextualMemory(event); }}
                variant="secondary" 
                size="sm" 
                className={`h-8 rounded-full px-3 text-xs shadow-none ${
                  isDeath ? 'bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300' 
                  : isBirth ? 'bg-emerald-100/50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-muted/60 hover:bg-muted'
                }`}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Memory
              </Button>
            )}
            
            {primaryMember && (
              <Link href={`/dashboard/members/${primaryMember.id}`}>
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground">
                  View Profile
                </Button>
              </Link>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
