import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting backfill of relationship treeId...');
  await prisma.$executeRawUnsafe(`UPDATE "Relationship" SET "treeId" = "Member"."treeId" FROM "Member" WHERE "Relationship"."fromId" = "Member"."id" AND "Relationship"."treeId" IS NULL`);
  console.log(`Backfilled treeId for relationships.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
