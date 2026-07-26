import prisma from '../src/lib/prisma'

async function run() {
  console.log('Ensuring Member.revision column exists...')
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "revision" INTEGER NOT NULL DEFAULT 1`);
    console.log('Member.revision column ensured');
  } catch (e) {
    console.error('Failed to ensure revision column', e);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect())
