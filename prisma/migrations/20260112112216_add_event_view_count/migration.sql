/*
  Warnings:

  - You are about to drop the column `viewCount` on the `ace_org` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ace_event" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ace_org" DROP COLUMN "viewCount";
