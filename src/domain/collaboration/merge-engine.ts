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
  merge(baseMembers: MemberWithRelations[], events: ChangeEvent[]): MergeResult {
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
          const newId = `merged-${crypto.randomUUID()}`;
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
             // 1. Remove all old reciprocal relationships involving this member from other members
             for (const m of memberMap.values()) {
               if (m.id === targetId) continue;
               if (m.relationsFrom) {
                 m.relationsFrom = m.relationsFrom.filter(r => r.toId !== targetId && r.fromId !== targetId);
               }
               if (m.relationsTo) {
                 m.relationsTo = m.relationsTo.filter(r => r.toId !== targetId && r.fromId !== targetId);
               }
             }

             // 2. Apply the new member state
             Object.assign(member, e.payload.changes);
             (member as any).updatedAt = new Date().toISOString();

             // 3. Inject the new reciprocal relationships into other members
             if (member.relationsFrom) {
               for (const rel of member.relationsFrom) {
                 const other = memberMap.get(rel.toId);
                 if (other) {
                   if (!other.relationsTo) other.relationsTo = [];
                   other.relationsTo.push(rel);
                 }
               }
             }
             if (member.relationsTo) {
               for (const rel of member.relationsTo) {
                 const other = memberMap.get(rel.fromId);
                 if (other) {
                   if (!other.relationsFrom) other.relationsFrom = [];
                   other.relationsFrom.push(rel);
                 }
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

    const finalMembers = Array.from(memberMap.values());

    // Validate using Inference Engine
    const graphPayload = { treeId: 'validation', members: finalMembers };
    const rawGraph = GenealogyEngine.buildFamilyGraph(graphPayload);
    const graph = safeGraph(rawGraph);
    const validation = GenealogyEngine.validateFamilyGraph(graph);

    return {
      success: validation.valid,
      mergedMembers: finalMembers,
      errors: validation.errors
    };
  }
};
