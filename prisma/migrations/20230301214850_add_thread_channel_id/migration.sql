/*
  Warnings:

  - Added the required column `threadChannelId` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Thread" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "threadChannelId" TEXT NOT NULL,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Thread" ("id", "totalTokens", "userId") SELECT "id", "totalTokens", "userId" FROM "Thread";
DROP TABLE "Thread";
ALTER TABLE "new_Thread" RENAME TO "Thread";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
