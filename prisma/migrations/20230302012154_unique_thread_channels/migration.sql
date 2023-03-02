/*
  Warnings:

  - A unique constraint covering the columns `[threadChannelId]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Thread_threadChannelId_key" ON "Thread"("threadChannelId");
