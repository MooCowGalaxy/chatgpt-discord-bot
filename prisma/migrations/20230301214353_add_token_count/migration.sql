/*
  Warnings:

  - Added the required column `tokenCount` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Thread" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Thread" ("id", "userId") SELECT "id", "userId" FROM "Thread";
DROP TABLE "Thread";
ALTER TABLE "new_Thread" RENAME TO "Thread";
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "threadId" INTEGER NOT NULL,
    "userType" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("id", "message", "threadId", "userType") SELECT "id", "message", "threadId", "userType" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
