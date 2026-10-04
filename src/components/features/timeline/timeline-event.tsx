'use client';

import { format } from 'date-fns';
import { Camera, Plus } from 'lucide-react';
import { MemberAvatar } from '../members/member-avatar';
import Image from 'next/image';

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
  const memoryCoverUrl = (Array.isArray(memoryMedia) && memoryMedia.length > 0) 
    ? memoryMedia[0].url 
    : event.memoryData?.albumCoverUrl;
  const hasCoverPhoto = !!memoryCoverUrl;
  const primaryMember = safeMembers[0];
  const associatedMemoriesCount = event.associatedMemories?.length || 0;

  const isDeath = event.type === 'DEATH';
  const isBirth = event.type === 'BIRTH' || event.type === 'CHILD_BORN';
  const isMarriage = event.type === 'MARRIAGE';
  
  // MICRO EVENT (e.g., custom event without photo/description)
  const isMicro = !isMemory && !isBirth && !isDeath && !isMarriage && !event.description && safeMembers.length === 0;

  if (isMicro) {
    return (
      <div className="flex flex-col gap-1 opacity-90 hover:opacity-100 transition-opacity">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#b5ad98]">
          {format(event.date, 'MMM d, yyyy')}
        </div>
        <h4 className="text-base font-serif text-[#f3ead3]">{event.title}</h4>
      </div>
    );
  }

  // FEATURED MEMORY (Memory with a photo)
  if (isMemory && hasCoverPhoto) {
    return (
      <div 
        onClick={() => onClick && onClick(event)}
        className="flex flex-col gap-4 cursor-pointer group"
      >
        <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden bg-[#17211b] border border-[#efe6d2]/20 shadow-lg shadow-black/40">
          <Image 
            src={memoryCoverUrl} 
            alt={event.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#b5ad98]">
            <span>{format(event.date, 'MMMM d, yyyy')}</span>
            {event.memoryData?.location && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#efe6d2]/40" />
                <span>{event.memoryData.location}</span>
              </>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-medium leading-tight text-[#f3ead3] group-hover:text-[#d8c984] transition-colors">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-[15px] leading-relaxed text-[#b3ae9c] line-clamp-2 mt-2">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-4">
            {safeMembers.length > 0 && (
              <div className="flex items-center -space-x-2">
                {safeMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className="relative w-6 h-6 rounded-full ring-2 ring-[#0b100d] overflow-hidden bg-[#17211b]">
                    <MemberAvatar imageUrl={member.imageUrl} firstName={member.name.split(' ')[0]} lastName={member.name.split(' ')[1] || ''} fallbackSize={10} />
                  </div>
                ))}
              </div>
            )}
            <span className="text-xs font-medium text-[#d8c984] group-hover:text-[#ecdc98] transition-colors flex items-center gap-1">
              View Memory &rarr;
            </span>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD EVENT (Birth, Death, Marriage, or Memory without photo)
  return (
    <div className={`flex flex-col sm:flex-row gap-5 ${isDeath ? 'opacity-90' : ''}`}>
      {/* Editorial Portrait for standard events */}
      {primaryMember?.imageUrl && !isMarriage && !isMemory && (
        <div className={`hidden sm:block relative w-24 h-32 rounded-sm overflow-hidden bg-[#17211b] shrink-0 shadow-lg shadow-black/40 border border-[#efe6d2]/20 ${isDeath ? 'grayscale' : ''}`}>
          <MemberAvatar
            imageUrl={primaryMember.imageUrl}
            firstName={primaryMember.name.split(' ')[0]}
            lastName={primaryMember.name.split(' ')[1] || ''}
            fallbackSize={32}
            className="w-full h-full rounded-none"
          />
        </div>
      )}
      
      {/* Marriage Couples */}
      {isMarriage && safeMembers.length >= 2 && safeMembers[0].imageUrl && safeMembers[1].imageUrl && (
        <div className="hidden sm:flex shrink-0 -space-x-4">
          <div className="relative w-20 h-28 rounded-sm overflow-hidden bg-[#17211b] shadow-lg shadow-black/40 border border-[#efe6d2]/20 z-10">
            <MemberAvatar imageUrl={safeMembers[0].imageUrl} firstName={safeMembers[0].name.split(' ')[0]} lastName={safeMembers[0].name.split(' ')[1] || ''} fallbackSize={24} className="w-full h-full rounded-none" />
          </div>
          <div className="relative w-20 h-28 rounded-sm overflow-hidden bg-[#17211b] shadow-lg shadow-black/40 border border-[#efe6d2]/20 translate-y-4">
            <MemberAvatar imageUrl={safeMembers[1].imageUrl} firstName={safeMembers[1].name.split(' ')[0]} lastName={safeMembers[1].name.split(' ')[1] || ''} fallbackSize={24} className="w-full h-full rounded-none" />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center py-2">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#b5ad98] mb-1.5">
          {format(event.date, 'MMMM d, yyyy')}
          {isDeath && event.description?.match(/Age \d+/) && ` • ${event.description.match(/Age \d+/)?.[0]}`}
        </div>
        
        <h4 className={`text-xl sm:text-2xl font-serif font-medium leading-snug ${isDeath ? 'text-[#b5ad98]' : 'text-[#f3ead3]'}`}>
          {event.title}
        </h4>
        {isMemory && event.memoryData?.location && (
          <p className="mt-1 text-sm text-[#b5ad98]">{event.memoryData.location}</p>
        )}
        
        {event.description && !isDeath && (
          <p className="mt-2.5 text-[15px] leading-relaxed text-[#b3ae9c] line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Associated Memories */}
        {associatedMemoriesCount > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {event.associatedMemories!.slice(0, 3).map((mem: any, i: number) => {
                const hasCover = mem.media && mem.media.length > 0;
                return (
                  <div key={mem.id || i} className="w-6 h-6 rounded-sm bg-[#17211b] border border-[#0b100d] overflow-hidden relative shadow-sm z-10">
                    {hasCover ? (
                      <Image src={mem.media[0].url} alt="Memory" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#c9b872]/10 text-[#d8c984]">
                        <Camera className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-xs font-medium text-[#b5ad98]">
              +{associatedMemoriesCount}
            </span>
          </div>
        )}

        {/* Action Row */}
        {onAddContextualMemory && !isDeath && (
          <div className="mt-5">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddContextualMemory(event); }}
              className="text-xs font-medium text-[#d8c984] hover:text-[#ecdc98] transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              <Plus className="w-3 h-3" /> Add Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
