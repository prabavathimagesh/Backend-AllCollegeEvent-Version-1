/*
  Warnings:

  - A unique constraint covering the columns `[organizerNumber,hostIdentity]` on the table `ace_collaborator_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_members_organizerNumber_hostIdentity_key" ON "ace_collaborator_members"("organizerNumber", "hostIdentity");
