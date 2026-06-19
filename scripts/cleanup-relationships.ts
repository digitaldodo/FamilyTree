import prisma from '../src/lib/prisma';

async function cleanup() {
  console.log('Starting relationship cleanup...');
  const relationships = await prisma.relationship.findMany();
  
  console.log(`Found ${relationships.length} total relationships.`);

  // We want to keep track of unique relationships:
  // For PARENT: fromId -> toId is unique
  // For SPOUSE/SIBLING: sort(fromId, toId) is unique
  
  const seen = new Set();
  const toDelete = [];
  const toUpdate = [];

  for (const rel of relationships) {
    let key;
    if (rel.type === 'PARENT') {
      key = `${rel.type}_${rel.fromId}_${rel.toId}`;
    } else {
      const [id1, id2] = [rel.fromId, rel.toId].sort();
      key = `${rel.type}_${id1}_${id2}`;
      
      // If it's out of order, we need to update it unless we're deleting it
      if (rel.fromId !== id1 || rel.toId !== id2) {
        toUpdate.push({ id: rel.id, fromId: id1, toId: id2 });
      }
    }

    if (seen.has(key)) {
      toDelete.push(rel.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${toDelete.length} duplicates to delete.`);
  console.log(`Found ${toUpdate.length} relationships to standard-sort.`);

  // 1. Delete duplicates
  if (toDelete.length > 0) {
    const res = await prisma.relationship.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${res.count} duplicate relationships.`);
  }

  // 2. Update symmetric ones to ensure alphabetical order
  let updatedCount = 0;
  for (const update of toUpdate) {
    // Only update if it hasn't been deleted
    if (!toDelete.includes(update.id)) {
      try {
        await prisma.relationship.update({
          where: { id: update.id },
          data: { fromId: update.fromId, toId: update.toId }
        });
        updatedCount++;
      } catch (e: any) {
        // Might fail if the ordered version already exists due to some strange race condition previously
        console.error(`Failed to update ${update.id}:`, e.message);
      }
    }
  }

  console.log(`Updated ${updatedCount} relationships to use sorted IDs.`);
  console.log('Cleanup complete!');
}

cleanup()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
