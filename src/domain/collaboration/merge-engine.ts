import { ChangeEvent } from './change-events';
import { MemberWithRelations } from '@/types/member';
import { GenealogyEngine } from '../inference/genealogy-engine';
import { safeGraph } from '@/lib/safe-helpers';

export interface MergeResult {
  success: boolean;
  mergedMembers: MemberWithRelations[];
  errors: string[];
}

export const MergeEngine = {
  merge(baseMembers: MemberWithRelations[], events: ChangeEvent[], generations: any[] = []): MergeResult {
    const safeBaseMembers = Array.isArray(baseMembers) ? baseMembers : [];
    const members: MemberWithRelations[] = JSON.parse(JSON.stringify(safeBaseMembers));
    const memberMap = new Map<string, MemberWithRelations>();
    
    for (const m of members) {
      memberMap.set(m.id, m);
    }

    const tempIdMap = new Map<string, string>();

    const getRealId = (id: string) => tempIdMap.get(id) || id;

    const safeEvents = Array.isArray(events) ? events : [];
    for (const e of safeEvents) {
      if (!e || typeof e !== 'object' || !e.type || !e.payload) continue;
      switch (e.type) {
        case 'ADD_MEMBER': {
          const persistedId = (e.payload.member as any).id;
          const newId = persistedId || `merged-${crypto.randomUUID()}`;
          tempIdMap.set(e.payload.temporaryId, newId);
          
          const newMember: any = {
            id: newId,
            firstName: e.payload.member.firstName,
            lastName: e.payload.member.lastName,
            middleName: e.payload.member.middleName || null,
            birthDate: e.payload.member.birthDate ? new Date(e.payload.member.birthDate).toISOString() : null,
            deathDate: e.payload.member.deathDate ? new Date(e.payload.member.deathDate).toISOString() : null,
            gender: e.payload.member.gender || null,
            bio: e.payload.member.bio || null,
            imageUrl: e.payload.member.imageUrl || null,
            coverImage: e.payload.member.coverImage || null,
            phone: e.payload.member.phone || null,
            email: e.payload.member.email || null,
            address: e.payload.member.address || null,
            occupation: e.payload.member.occupation || null,
            generationId: e.payload.member.generationId || 'gen-0', // Default fallback
            treeId: e.treeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relationsFrom: [],
            relationsTo: [],
            media: []
          };
          
          memberMap.set(newId, newMember);
          break;
        }
        case 'UPDATE_MEMBER': {
          const targetId = getRealId(e.payload.memberId);
          const member = memberMap.get(targetId);
          if (member) {
             // Apply changes conservatively: diff old vs new relations and only add/remove reciprocals that changed.
             const oldRelationsFrom = member.relationsFrom ? [...member.relationsFrom] : [];
             const oldRelationsTo = member.relationsTo ? [...member.relationsTo] : [];

             // 1. Apply the new member state
             Object.assign(member, e.payload.changes);
             (member as any).updatedAt = new Date().toISOString();

             const newRelationsFrom = member.relationsFrom ? [...member.relationsFrom] : [];
             const newRelationsTo = member.relationsTo ? [...member.relationsTo] : [];

             const relKey = (r: any) => r.id || `${r.type}:${r.fromId}:${r.toId}`;

             const oldFromKeys = new Set(oldRelationsFrom.map(relKey));
             const newFromKeys = new Set(newRelationsFrom.map(relKey));

             const oldToKeys = new Set(oldRelationsTo.map(relKey));
             const newToKeys = new Set(newRelationsTo.map(relKey));

             // Removed outgoing relations: present in oldFrom but not in newFrom
             const removedOutgoing = oldRelationsFrom.filter(r => !newFromKeys.has(relKey(r)));
             // Added outgoing relations: present in newFrom but not in oldFrom
             const addedOutgoing = newRelationsFrom.filter(r => !oldFromKeys.has(relKey(r)));

             // Removed incoming relations: present in oldTo but not in newTo
             const removedIncoming = oldRelationsTo.filter(r => !newToKeys.has(relKey(r)));
             // Added incoming relations: present in newTo but not in oldTo
             const addedIncoming = newRelationsTo.filter(r => !oldToKeys.has(relKey(r)));

             // Apply removals on other members
             for (const rel of removedOutgoing) {
               const other = memberMap.get(rel.toId);
               if (other && other.relationsTo) {
                 other.relationsTo = other.relationsTo.filter(r => relKey(r) !== relKey(rel));
               }
             }
             for (const rel of removedIncoming) {
               const other = memberMap.get(rel.fromId);
               if (other && other.relationsFrom) {
                 other.relationsFrom = other.relationsFrom.filter(r => relKey(r) !== relKey(rel));
               }
             }

             // Apply additions on other members
             for (const rel of addedOutgoing) {
               const other = memberMap.get(rel.toId);
               if (other) {
                 if (!other.relationsTo) other.relationsTo = [];
                 if (!other.relationsTo.some(r => relKey(r) === relKey(rel))) other.relationsTo.push(rel);
               }
             }
             for (const rel of addedIncoming) {
               const other = memberMap.get(rel.fromId);
               if (other) {
                 if (!other.relationsFrom) other.relationsFrom = [];
                 if (!other.relationsFrom.some(r => relKey(r) === relKey(rel))) other.relationsFrom.push(rel);
               }
             }
          }
          break;
        }
        case 'DELETE_MEMBER': {
          const targetId = getRealId(e.payload.memberId);
          memberMap.delete(targetId);
          
          for (const m of memberMap.values()) {
            if (m.relationsFrom) {
              m.relationsFrom = m.relationsFrom.filter(r => r.toId !== targetId && r.fromId !== targetId);
            }
            if (m.relationsTo) {
              m.relationsTo = m.relationsTo.filter(r => r.toId !== targetId && r.fromId !== targetId);
            }
          }
          break;
        }
        case 'ADD_RELATIONSHIP': {
          const fromId = getRealId(e.payload.fromId);
          const toId = getRealId(e.payload.toId);
          const type = e.payload.type;
          
          const fromMember = memberMap.get(fromId);
          const toMember = memberMap.get(toId);
          
          if (fromMember && toMember) {
            const relId = `rel-${crypto.randomUUID()}`;
            const rel: any = {
              id: relId,
              type,
              fromId,
              toId,
              treeId: e.treeId,
              createdAt: new Date().toISOString()
            };
            if (!fromMember.relationsFrom) fromMember.relationsFrom = [];
            // Union merge: only add if not exists
            if (!fromMember.relationsFrom.some(r => r.toId === toId && r.type === type)) {
              fromMember.relationsFrom.push(rel);
            }
            
            if (!toMember.relationsTo) toMember.relationsTo = [];
            if (!toMember.relationsTo.some(r => r.fromId === fromId && r.type === type)) {
              toMember.relationsTo.push(rel);
            }
          }
          break;
        }
        case 'REMOVE_RELATIONSHIP': {
          const fromId = getRealId(e.payload.fromId);
          const toId = getRealId(e.payload.toId);
          const type = e.payload.type;
          
          const fromMember = memberMap.get(fromId);
          const toMember = memberMap.get(toId);
          
          if (fromMember && fromMember.relationsFrom) {
            fromMember.relationsFrom = fromMember.relationsFrom.filter(r => !(r.toId === toId && r.type === type));
          }
          if (toMember && toMember.relationsTo) {
            toMember.relationsTo = toMember.relationsTo.filter(r => !(r.fromId === fromId && r.type === type));
          }
          break;
        }
        case 'MOVE_NODE': {
           // Ignored for DB merge
           break;
        }
      }
    }

    const finalMembers = Array.from(memberMap.values()).map(member => ({
      ...member,
      relationsFrom: dedupeRelations(member.relationsFrom || []),
      relationsTo: dedupeRelations(member.relationsTo || []),
    }));

    // Validate using Inference Engine (prefer member-level relationships for validation to avoid container grouping side-effects)
    const graphPayload = { treeId: 'validation', members: finalMembers, generations };
    const rawGraph = GenealogyEngine.buildFamilyGraph(graphPayload);
    const graph = safeGraph(rawGraph);

    // Prefer member-level derived relationships when available
    const validationGraph = {
      ...graph,
      derivedRelationships: rawGraph.memberDerivedRelationships || graph.derivedRelationships,
    } as any;

    const validation = GenealogyEngine.validateFamilyGraph(validationGraph);

    return {
      success: validation.valid,
      mergedMembers: finalMembers,
      errors: validation.errors
    };
  }
};

function dedupeRelations(relations: any[]) {
  const seen = new Set<string>();
  return relations.filter(rel => {
    if (!rel) return false;
    const key = rel.id || `${rel.type}:${rel.fromId}:${rel.toId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
