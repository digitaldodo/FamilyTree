import prisma from '../src/lib/prisma';

async function main() {
  console.log('Running Genealogy Engine V2 Auto Cleanup Script...');

  const members = await prisma.member.findMany({
    include: {
      generation: true,
      relationsFrom: true,
      relationsTo: true,
    }
  });

  const relationships = await prisma.relationship.findMany({
    include: {
      from: { include: { generation: true } },
      to: { include: { generation: true } },
    }
  });

  let duplicateCount = 0;
  let moreThan2ParentsCount = 0;
  let moreThan1SpouseCount = 0;
  let invalidGapCount = 0;

  // 1. Check for duplicates
  // Since we have fromId, toId, type, duplicates might exist if direction is ignored or exactly same.
  // We'll collect unique keys and remove extras.
  const seenRelations = new Set<string>();
  const toDelete = new Set<string>();

  for (const rel of relationships) {
    // Generate an order-independent key for SPOUSE and SIBLING
    let key = '';
    if (rel.type === 'SPOUSE' || rel.type === 'SIBLING') {
      const ids = [rel.fromId, rel.toId].sort();
      key = `${rel.type}-${ids[0]}-${ids[1]}`;
    } else {
      key = `${rel.type}-${rel.fromId}-${rel.toId}`;
    }

    if (seenRelations.has(key)) {
      toDelete.add(rel.id);
      duplicateCount++;
    } else {
      seenRelations.add(key);
    }
  }

  // 2. Scan each member for limit violations
  for (const member of members) {
    const parents = member.relationsTo.filter(r => r.type === 'PARENT');
    const spouses = [
      ...member.relationsFrom.filter(r => r.type === 'SPOUSE'),
      ...member.relationsTo.filter(r => r.type === 'SPOUSE')
    ];

    if (parents.length > 2) {
      moreThan2ParentsCount++;
      console.warn(`Member ${member.firstName} ${member.lastName} (${member.id}) has ${parents.length} parents (Max 2).`);
    }

    if (spouses.length > 1) {
      moreThan1SpouseCount++;
      console.warn(`Member ${member.firstName} ${member.lastName} (${member.id}) has ${spouses.length} spouses (Max 1).`);
    }
  }

  // 3. Scan for Invalid Generation Gaps
  for (const rel of relationships) {
    if (toDelete.has(rel.id)) continue; // skip duplicates

    const fromGen = rel.from.generation.orderIndex;
    const toGen = rel.to.generation.orderIndex;

    if (rel.type === 'PARENT') {
      if (fromGen !== toGen - 1) {
        invalidGapCount++;
        console.warn(`Invalid PARENT relationship gap: ${rel.from.firstName} (Gen ${fromGen}) -> ${rel.to.firstName} (Gen ${toGen}). Must be exactly 1 generation apart.`);
      }
    } else if (rel.type === 'SPOUSE' || rel.type === 'SIBLING') {
      if (fromGen !== toGen) {
        invalidGapCount++;
        console.warn(`Invalid ${rel.type} relationship gap: ${rel.from.firstName} (Gen ${fromGen}) & ${rel.to.firstName} (Gen ${toGen}). Must be same generation.`);
      }
    }
  }

  // Auto-fix duplicates
  if (toDelete.size > 0) {
    console.log(`\nAuto-fixing ${toDelete.size} duplicate relationships...`);
    const deleteResult = await prisma.relationship.deleteMany({
      where: {
        id: {
          in: Array.from(toDelete)
        }
      }
    });
    console.log(`Deleted ${deleteResult.count} duplicate relationships.`);
  }

  console.log('\n--- Audit Report ---');
  console.log(`Duplicate Relationships Found: ${duplicateCount} (Auto-fixed)`);
  console.log(`Members with > 2 Parents: ${moreThan2ParentsCount}`);
  console.log(`Members with > 1 Spouse: ${moreThan1SpouseCount}`);
  console.log(`Relationships with Invalid Generation Gaps: ${invalidGapCount}`);
  console.log('--------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
