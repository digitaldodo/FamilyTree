Γùç injected env (9) from .env // tip: Γîÿ custom filepath { path: '/custom/path/.env' }
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "memoryId" TEXT,
ALTER COLUMN "memberId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MEMORY',
    "googlePhotosAlbumUrl" TEXT,
    "location" TEXT,
    "tags" TEXT[],
    "treeId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryMember" (
    "memoryId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "MemoryMember_pkey" PRIMARY KEY ("memoryId","memberId")
);

-- CreateIndex
CREATE INDEX "Memory_treeId_idx" ON "Memory"("treeId");

-- CreateIndex
CREATE INDEX "Media_memoryId_idx" ON "Media"("memoryId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryMember" ADD CONSTRAINT "MemoryMember_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryMember" ADD CONSTRAINT "MemoryMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

