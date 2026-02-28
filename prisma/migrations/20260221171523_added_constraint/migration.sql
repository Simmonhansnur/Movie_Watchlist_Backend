/*
  Warnings:

  - A unique constraint covering the columns `[userId,moiveId]` on the table `WatchListItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WatchListItem_userId_moiveId_key" ON "WatchListItem"("userId", "moiveId");
