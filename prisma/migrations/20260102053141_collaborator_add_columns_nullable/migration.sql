/*
  Warnings:

  - You are about to drop the column `collabOrgIdentity` on the `ace_collaborator` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ace_collaborator_members` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `ace_collaborator_members` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ace_collaborator_members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[collaboratorMemberId,eventIdentity]` on the table `ace_collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ace_collaborator_members_email_key";

-- DropIndex
DROP INDEX "ace_collaborator_members_mobile_key";

-- AlterTable
ALTER TABLE "ace_collaborator" DROP COLUMN "collabOrgIdentity";

-- AlterTable
ALTER TABLE "ace_collaborator_members" DROP COLUMN "email",
DROP COLUMN "mobile",
DROP COLUMN "name",
ADD COLUMN     "hostIdentity" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "orgDept" TEXT,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "organizerName" TEXT,
ADD COLUMN     "organizerNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_collaboratorMemberId_eventIdentity_key" ON "ace_collaborator"("collaboratorMemberId", "eventIdentity");

-- AddForeignKey
ALTER TABLE "ace_collaborator_members" ADD CONSTRAINT "ace_collaborator_members_hostIdentity_fkey" FOREIGN KEY ("hostIdentity") REFERENCES "ace_org_category"("identity") ON DELETE SET NULL ON UPDATE CASCADE;
