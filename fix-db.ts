import prisma from './src/lib/prisma'

async function run() {
  console.log('Deleting invalid relationships...')
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "Relationship" WHERE "treeId" IS NULL`);
  } catch(e) {}
  console.log('Fixing updatedAt...')
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Relationship" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  } catch(e) {}
  console.log('Done.')
}

run().catch(console.error).finally(() => prisma.$disconnect())
