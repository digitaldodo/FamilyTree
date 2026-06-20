import { ChangeEvent, UpdateMemberEvent, AddRelationshipEvent } from './change-events';

export interface ConflictReport {
  hasConflict: boolean;
  conflicts: string[];
  resolutionOptions: string[];
}

export const ConflictEngine = {
  /**
   * Detect conflicts between newly proposed events and events that have already
   * been applied (or are pending from others) since the proposed base version.
   */
  detectConflicts(proposedEvents: ChangeEvent[], existingEvents: ChangeEvent[]): ConflictReport {
    const conflicts: string[] = [];

    // 1. Same node edited
    const proposedUpdates = proposedEvents.filter(
      (e): e is UpdateMemberEvent => e.type === 'UPDATE_MEMBER'
    );
    const existingUpdates = existingEvents.filter(
      (e): e is UpdateMemberEvent => e.type === 'UPDATE_MEMBER'
    );

    for (const p of proposedUpdates) {
      if (existingUpdates.some(e => e.payload.memberId === p.payload.memberId)) {
        conflicts.push(`Conflict: Member ${p.payload.memberId} was edited concurrently.`);
      }
    }

    // 2. Relationship collision (e.g. assigning different parents)
    const proposedRels = proposedEvents.filter(
      (e): e is AddRelationshipEvent => e.type === 'ADD_RELATIONSHIP'
    );
    const existingRels = existingEvents.filter(
      (e): e is AddRelationshipEvent => e.type === 'ADD_RELATIONSHIP'
    );

    for (const p of proposedRels) {
      if (p.payload.type === 'PARENT') {
        // Source is parent, Target is child. Let's count parents for this target.
        const targetId = p.payload.toId;
        const proposedParents = proposedRels.filter(
          r => r.payload.type === 'PARENT' && r.payload.toId === targetId
        );
        const existingParents = existingRels.filter(
          r => r.payload.type === 'PARENT' && r.payload.toId === targetId
        );

        // If the same relationship is being added, it's fine (union merge).
        // But if different parents are being added and the total exceeds 2, it's a conflict.
        const uniqueParents = new Set([
          ...proposedParents.map(r => r.payload.fromId),
          ...existingParents.map(r => r.payload.fromId),
        ]);

        if (uniqueParents.size > 2) {
          conflicts.push(`Conflict: More than 2 parents assigned to member ${targetId}.`);
        }
      }
    }

    // 3. Cycle risk introduced (basic check, full validation done in MergeEngine/Inference Engine)
    // 4. Version divergence is implicitly handled by passing existingEvents since the baseVersion.

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      resolutionOptions: conflicts.length > 0 ? ['REJECT', 'OVERWRITE'] : [],
    };
  },
};
