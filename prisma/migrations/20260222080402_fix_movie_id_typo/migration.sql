/*
  Warnings:

  - You are about to drop the column `moiveId` on the `WatchListItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,movieId]` on the table `WatchListItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `movieId` to the `WatchListItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WatchListItem" DROP CONSTRAINT "WatchListItem_moiveId_fkey";

-- DropIndex
DROP INDEX "WatchListItem_userId_moiveId_key";

-- AlterTable
ALTER TABLE "WatchListItem" DROP COLUMN "moiveId",
ADD COLUMN     "movieId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WatchListItem_userId_movieId_key" ON "WatchListItem"("userId", "movieId");

-- AddForeignKey
ALTER TABLE "WatchListItem" ADD CONSTRAINT "WatchListItem_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
