import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Deleting SIBLING relationships...');
  await prisma.$executeRaw`DELETE FROM "Relationship" WHERE type = 'SIBLING'`;
  console.log('Deleted SIBLING relationships.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
