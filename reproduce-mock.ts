import { MergeEngine } from './src/domain/collaboration/merge-engine';

const baseMembers: any[] = [
  {
    id: "A",
    generationId: "gen-1",
    relationsFrom: [{ id: "rel1", type: "SPOUSE", fromId: "A", toId: "B" }],
    relationsTo: []
  },
  {
    id: "B",
    generationId: "gen-1",
    relationsFrom: [],
    relationsTo: [{ id: "rel1", type: "SPOUSE", fromId: "A", toId: "B" }]
  },
  {
    id: "C",
    generationId: "gen-1",
    relationsFrom: [],
    relationsTo: []
  }
];

// In PUT /api/members/[id], A's spouse is changed from B to C.
const freshMember = {
  id: "A",
  generationId: "gen-1",
  relationsFrom: [{ id: "rel2", type: "SPOUSE", fromId: "A", toId: "C" }],
  relationsTo: []
};

const events: any[] = [
  {
    id: "test",
    type: "UPDATE_MEMBER",
    payload: {
      memberId: "A",
      changes: freshMember
    }
  }
];

const result = MergeEngine.merge(baseMembers, events);
console.log("Success:", result.success);
if (!result.success) {
  console.log("Errors:", result.errors);
}
