import prisma from './src/lib/prisma';
import { MergeEngine } from './src/domain/collaboration/merge-engine';

async function run() {
  const tree = await prisma.tree.findFirst({
    include: {
      members: { include: { relationsFrom: true, relationsTo: true } },
      generations: true
    }
  });

  if (!tree || tree.members.length === 0) {
    console.log("No tree or members found to test with.");
    return;
  }

  const baseMembers = tree.members;
  const memberToUpdate = baseMembers[0];

  const freshMember = await prisma.member.findUnique({
    where: { id: memberToUpdate.id },
    include: {
      relationsFrom: { include: { to: true } },
      relationsTo: { include: { from: true } },
      media: true
    }
  });

  if (!freshMember) return;
  freshMember.bio = "Updated bio";

  const event = {
    id: "test-event",
    treeId: tree.id,
    versionId: "live",
    userId: "local",
    timestamp: new Date().toISOString(),
    type: "UPDATE_MEMBER",
    payload: { memberId: memberToUpdate.id, changes: freshMember }
  };

  const mergeResult = MergeEngine.merge(baseMembers as any, [event as any]);
  
  if (!mergeResult.success) {
    console.log("Merge validation failed!");
    console.log("Errors:", mergeResult.errors);
  } else {
    console.log("Merge succeeded!");
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
