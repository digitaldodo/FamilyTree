-- Safe migration: rename camelCase columns in Relationship table to lowercase
-- This fixes the Prisma v7 TypeScript client bug where INSERT operations
-- don't properly quote camelCase column names in the wire protocol.
-- 
-- The database currently has columns: "fromId", "toId", "treeId", "createdAt", "updatedAt"
-- We rename them to: fromid, toid, treeid, createdat, updatedat
-- 
-- The Relationship table has 0 rows, so no data migration needed.
-- All constraints and indexes are preserved.

-- Step 1: Drop indexes and constraints that reference the columns
DROP INDEX IF EXISTS "Relationship_fromId_idx";
DROP INDEX IF EXISTS "Relationship_toId_idx";
DROP INDEX IF EXISTS "Relationship_treeId_idx";
DROP INDEX IF EXISTS "Relationship_fromId_toId_type_key";

ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_fromId_fkey";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_toId_fkey";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_treeId_fkey";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_fromId_not_null";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_toId_not_null";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_treeId_not_null";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_createdAt_not_null";
ALTER TABLE "Relationship" DROP CONSTRAINT IF EXISTS "Relationship_updatedAt_not_null";

-- Step 2: Rename the camelCase columns to lowercase
ALTER TABLE "Relationship" RENAME COLUMN "fromId" TO "fromid";
ALTER TABLE "Relationship" RENAME COLUMN "toId" TO "toid";
ALTER TABLE "Relationship" RENAME COLUMN "treeId" TO "treeid";
ALTER TABLE "Relationship" RENAME COLUMN "createdAt" TO "createdat";
ALTER TABLE "Relationship" RENAME COLUMN "updatedAt" TO "updatedat";

-- Step 3: Re-add NOT NULL constraints (using CHECK to match Prisma's format)
ALTER TABLE "Relationship" ALTER COLUMN "fromid" SET NOT NULL;
ALTER TABLE "Relationship" ALTER COLUMN "toid" SET NOT NULL;
ALTER TABLE "Relationship" ALTER COLUMN "treeid" SET NOT NULL;
ALTER TABLE "Relationship" ALTER COLUMN "createdat" SET NOT NULL;
ALTER TABLE "Relationship" ALTER COLUMN "updatedat" SET NOT NULL;

-- Step 4: Re-add foreign key constraints
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_fromId_fkey"
  FOREIGN KEY ("fromid") REFERENCES "Member"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_toId_fkey"
  FOREIGN KEY ("toid") REFERENCES "Member"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_treeId_fkey"
  FOREIGN KEY ("treeid") REFERENCES "Tree"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Re-add indexes
CREATE INDEX "Relationship_fromId_idx" ON "Relationship"("fromid");
CREATE INDEX "Relationship_toId_idx" ON "Relationship"("toid");
CREATE INDEX "Relationship_treeId_idx" ON "Relationship"("treeid");
CREATE UNIQUE INDEX "Relationship_fromId_toId_type_key" ON "Relationship"("fromid", "toid", "type");
