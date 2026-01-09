/*
  Warnings:

  - You are about to drop the `ace_event_certification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ace_event_certification" DROP CONSTRAINT "ace_event_certification_certIdentity_fkey";

-- DropForeignKey
ALTER TABLE "ace_event_certification" DROP CONSTRAINT "ace_event_certification_eventIdentity_fkey";

-- DropTable
DROP TABLE "ace_event_certification";
