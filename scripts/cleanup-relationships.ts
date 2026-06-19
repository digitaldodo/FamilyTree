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
  let conflictingCategoryCount = 0;

  const toDelete = new Set<string>();

  // 1. Check for duplicates and conflicting categories
  const pairMap = new Map<string, string>(); // pairKey -> relationship type
  const seenRelations = new Set<string>();

  for (const rel of relationships) {
    // Unique key for deduplication
    let key = '';
    const [id1, id2] = [rel.fromId, rel.toId].sort();
    if (rel.type === 'SPOUSE' || rel.type === 'SIBLING') {
      key = `${rel.type}-${id1}-${id2}`;
    } else {
      key = `${rel.type}-${rel.fromId}-${rel.toId}`;
    }

    if (seenRelations.has(key)) {
      toDelete.add(rel.id);
      duplicateCount++;
      continue;
    } else {
      seenRelations.add(key);
    }

    // Conflicting categories (A can only have ONE relation type with B)
    const pairKey = `${id1}-${id2}`;
    if (pairMap.has(pairKey)) {
      const existingType = pairMap.get(pairKey);
      if (existingType !== rel.type) {
        console.warn(`Conflict: ${id1} and ${id2} are ${existingType} and ${rel.type}. Removing ${rel.type}.`);
        toDelete.add(rel.id);
        conflictingCategoryCount++;
      }
    } else {
      pairMap.set(pairKey, rel.type);
    }
  }

  // 2. Scan each member for limit violations
  const deletedParentsForMember = new Map<string, number>();
  const deletedSpousesForMember = new Map<string, number>();

  for (const rel of relationships) {
    if (toDelete.has(rel.id)) continue;

    if (rel.type === 'PARENT') {
      const currentParents = (deletedParentsForMember.get(rel.toId) || 0) + 1;
      if (currentParents > 2) {
        console.warn(`Member ${rel.toId} already has 2 parents. Removing extra parent rel ${rel.id}`);
        toDelete.add(rel.id);
        moreThan2ParentsCount++;
      } else {
        deletedParentsForMember.set(rel.toId, currentParents);
      }
    } else if (rel.type === 'SPOUSE') {
      const currentSpouseFrom = (deletedSpousesForMember.get(rel.fromId) || 0) + 1;
      const currentSpouseTo = (deletedSpousesForMember.get(rel.toId) || 0) + 1;
      
      if (currentSpouseFrom > 1 || currentSpouseTo > 1) {
        console.warn(`Member ${rel.fromId} or ${rel.toId} already has a spouse. Removing extra spouse rel ${rel.id}`);
        toDelete.add(rel.id);
        moreThan1SpouseCount++;
      } else {
        deletedSpousesForMember.set(rel.fromId, currentSpouseFrom);
        deletedSpousesForMember.set(rel.toId, currentSpouseTo);
      }
    }
  }

  // 3. Scan for Invalid Generation Gaps
  for (const rel of relationships) {
    if (toDelete.has(rel.id)) continue; 

    const fromGen = rel.from.generation.orderIndex;
    const toGen = rel.to.generation.orderIndex;

    if (rel.type === 'PARENT') {
      if (fromGen !== toGen - 1) {
        invalidGapCount++;
        console.warn(`Invalid PARENT gap: ${rel.from.firstName} (Gen ${fromGen}) -> ${rel.to.firstName} (Gen ${toGen}). Removing.`);
        toDelete.add(rel.id);
      }
    } else if (rel.type === 'SPOUSE' || rel.type === 'SIBLING') {
      if (fromGen !== toGen) {
        invalidGapCount++;
        console.warn(`Invalid ${rel.type} gap: ${rel.from.firstName} (Gen ${fromGen}) & ${rel.to.firstName} (Gen ${toGen}). Removing.`);
        toDelete.add(rel.id);
      }
    }
  }

  // Auto-fix duplicates
  if (toDelete.size > 0) {
    console.log(`\nAuto-fixing ${toDelete.size} invalid relationships...`);
    const deleteResult = await prisma.relationship.deleteMany({
      where: {
        id: {
          in: Array.from(toDelete)
        }
      }
    });
    console.log(`Deleted ${deleteResult.count} relationships.`);
  }

  console.log('\n--- Audit Report ---');
  console.log(`Duplicate Relationships Auto-fixed: ${duplicateCount}`);
  console.log(`Conflicting Relationships Auto-fixed: ${conflictingCategoryCount}`);
  console.log(`Excess Parents Auto-fixed: ${moreThan2ParentsCount}`);
  console.log(`Excess Spouses Auto-fixed: ${moreThan1SpouseCount}`);
  console.log(`Relationships with Invalid Gaps Auto-fixed: ${invalidGapCount}`);
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
