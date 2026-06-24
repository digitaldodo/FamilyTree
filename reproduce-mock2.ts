import { MergeEngine } from './src/domain/collaboration/merge-engine';

const baseMembers: any[] = [
  {
    id: "A",
    generationId: "gen-2", // Gen 2 (child)
    relationsFrom: [],
    relationsTo: [{ id: "rel1", type: "PARENT", fromId: "B", toId: "A" }]
  },
  {
    id: "B",
    generationId: "gen-1", // Gen 1 (parent)
    relationsFrom: [{ id: "rel1", type: "PARENT", fromId: "B", toId: "A" }],
    relationsTo: []
  },
  {
    id: "C",
    generationId: "gen-1", // Gen 1 (new parent)
    relationsFrom: [],
    relationsTo: []
  }
];

// In PUT /api/members/[id], A's parent is changed from B to C.
// And let's say A's generation changed to gen-1 (same as B and C), which makes A being B's child invalid!
const freshMember = {
  id: "A",
  generationId: "gen-1", // Changed generation!
  relationsFrom: [],
  relationsTo: [{ id: "rel2", type: "PARENT", fromId: "C", toId: "A" }] // New parent C
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
