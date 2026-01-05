/*
  Warnings:

  - Made the column `organizerNumber` on table `ace_collaborator_members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ace_collaborator_members" ALTER COLUMN "organizerNumber" SET NOT NULL;
