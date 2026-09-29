'use client';

import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { FamilyTimeline } from '@/components/features/timeline/family-timeline';
import { TimelineEventProps } from '@/components/features/timeline/timeline-event';
import { TimelineSkeleton } from '@/components/ui/timeline-skeleton';
import { useMembers } from '@/hooks/use-members';
import { useMemories } from '@/hooks/use-memories';
import { useUserTrees } from '@/hooks/use-user-trees';
import { MemoryFormModal } from '@/components/features/timeline/memory-form-modal';
import { MemoryDetailModal } from '@/components/features/timeline/memory-detail-modal';

export default function TimelinePage() {
  const activeTreeId = useAppStore(s => s.activeTreeId);
  const isReadOnly = useAppStore(s => s.isReadOnly);

  const { members, isLoading: isLoadingMembers } = useMembers(activeTreeId || undefined);
  const { memories, isLoading: isLoadingMemories, createMemory, updateMemory, deleteMemory } = useMemories(activeTreeId || undefined);
  const { userTrees, isLoading: isLoadingTrees } = useUserTrees();
  
  const activeTree = userTrees.find(t => t.id === activeTreeId);
  const familyName = activeTree?.name || '';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);

  const isLoading = isLoadingMembers || isLoadingMemories || isLoadingTrees;
  const canEdit = !isReadOnly;

  const events = useMemo(() => {
    const timelineEvents: TimelineEventProps['event'][] = [];
    
    // Add member life events
    if (members) {
      members.forEach((member: any) => {
        if (member.birthDate) {
          timelineEvents.push({
            id: `birth-${member.id}`,
            title: `${member.firstName} ${member.lastName} was born`,
            date: new Date(member.birthDate),
            type: 'BIRTH',
            description: member.occupation
              ? `${member.generation?.name || 'Unnamed Generation'} • ${member.occupation}`
              : `Added to ${member.generation?.name || 'Unnamed Generation'}`,
            members: [{
              id: member.id,
              name: `${member.firstName} ${member.lastName}`,
              imageUrl: member.imageUrl
            }]
          });
        }

        if (member.deathDate) {
          timelineEvents.push({
            id: `death-${member.id}`,
            title: `${member.firstName} ${member.lastName} passed away`,
            date: new Date(member.deathDate),
            type: 'DEATH',
            description: member.generation?.name || 'Unnamed Generation',
            members: [{
              id: member.id,
              name: `${member.firstName} ${member.lastName}`,
              imageUrl: member.imageUrl
            }]
          });
        }

        const relationsTo = Array.isArray(member.relationsTo) ? member.relationsTo : [];
        relationsTo.forEach((rel: any) => {
          if (rel.type === 'PARENT' && rel.from && member.birthDate) {
            timelineEvents.push({
              id: `child-${member.id}-parent-${rel.from.id}`,
              title: `${rel.from.firstName} had a child, ${member.firstName}`,
              date: new Date(member.birthDate),
              type: 'CHILD_BORN',
              description: `${member.firstName} was born`,
              members: [
                { id: rel.from.id, name: `${rel.from.firstName} ${rel.from.lastName}` },
                { id: member.id, name: `${member.firstName} ${member.lastName}`, imageUrl: member.imageUrl }
              ]
            });
          }
        });

        const relationsFrom = Array.isArray(member.relationsFrom) ? member.relationsFrom : [];
        relationsFrom.forEach((rel: any) => {
          if (rel.type === 'SPOUSE' && rel.to) {
            if (member.id < rel.to.id) {
              timelineEvents.push({
                  id: `marriage-${member.id}-${rel.to.id}`,
                  title: `${member.firstName} and ${rel.to.firstName} were married`,
                  date: new Date(rel.createdAt || new Date()), // Fallback
                  type: 'MARRIAGE',
                  description: `Marriage`,
                  members: [
                    { id: member.id, name: `${member.firstName} ${member.lastName}`, imageUrl: member.imageUrl },
                    { id: rel.to.id, name: `${rel.to.firstName} ${rel.to.lastName}` }
                  ]
              });
            }
          }
        });
      });
    }

    // Add user-created memories
    if (memories) {
      memories.forEach((memory: any) => {
        timelineEvents.push({
          id: `memory-${memory.id}`,
          title: memory.title,
          date: new Date(memory.date),
          type: 'MEMORY',
          description: memory.description || memory.location || 'A family memory',
          members: memory.members?.map((m: any) => ({
            id: m.member.id,
            name: `${m.member.firstName} ${m.member.lastName}`,
            imageUrl: m.member.imageUrl
          })) || [],
          mediaCount: memory.media?.length || 0,
          hasAlbum: !!memory.googlePhotosAlbumUrl,
          memoryData: memory // Pass raw memory data for the detail modal
        });
      });
    }

    // Sort all events chronologically
    return timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [members, memories]);

  const handleEventClick = (event: any) => {
    if (event.type === 'MEMORY' && event.memoryData) {
      setSelectedMemory(event.memoryData);
      setIsDetailOpen(true);
    }
  };

  const handleCreateMemory = async (data: any) => {
    await createMemory(data);
  };

  const handleUpdateMemory = async (data: any) => {
    if (selectedMemory) {
      await updateMemory({ id: selectedMemory.id, data });
      setSelectedMemory(null);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id);
  };

  const handleEditMemory = (memory: any) => {
    setSelectedMemory(memory);
    setIsFormOpen(true);
  };

  // GLOBAL HYDRATION GUARD
  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (!activeTreeId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <FamilyTimeline 
        events={events} 
        onEventClick={handleEventClick}
        onAddMemory={() => { setSelectedMemory(null); setIsFormOpen(true); }}
        familyName={familyName}
        canEdit={canEdit}
      />

      {canEdit && (
        <MemoryFormModal
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setSelectedMemory(null); }}
          onSubmit={selectedMemory ? handleUpdateMemory : handleCreateMemory}
          initialData={selectedMemory}
        />
      )}

      <MemoryDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedMemory(null); }}
        memory={selectedMemory}
        onEdit={handleEditMemory}
        onDelete={handleDeleteMemory}
      />
    </div>
  );
}
