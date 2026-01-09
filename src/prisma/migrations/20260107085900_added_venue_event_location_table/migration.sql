/*
  Warnings:

  - You are about to drop the column `userIdentity` on the `ace_event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ace_event" DROP CONSTRAINT "ace_event_userIdentity_fkey";

-- AlterTable
ALTER TABLE "ace_event" DROP COLUMN "userIdentity";

-- AlterTable
ALTER TABLE "ace_event_location" ADD COLUMN     "venue" TEXT;
