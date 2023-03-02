/*
  Warnings:

  - Added the required column `messageId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "threadId" INTEGER NOT NULL,
    "userType" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("id", "message", "threadId", "tokenCount", "userType") SELECT "id", "message", "threadId", "tokenCount", "userType" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
