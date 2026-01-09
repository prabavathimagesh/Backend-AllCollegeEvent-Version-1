/*
  Warnings:

  - A unique constraint covering the columns `[organizerNumber]` on the table `ace_collaborator_members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ace_collaborator_members_organizerNumber_hostIdentity_key";

-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_members_organizerNumber_key" ON "ace_collaborator_members"("organizerNumber");
