/*
  Warnings:

  - You are about to drop the `collaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collaborator_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "collaborator" DROP CONSTRAINT "collaborator_collaboratorMemberId_fkey";

-- DropForeignKey
ALTER TABLE "collaborator" DROP CONSTRAINT "collaborator_eventIdentity_fkey";

-- DropForeignKey
ALTER TABLE "collaborator" DROP CONSTRAINT "collaborator_orgIdentity_fkey";

-- DropTable
DROP TABLE "collaborator";

-- DropTable
DROP TABLE "collaborator_members";

-- CreateTable
CREATE TABLE "ace_collaborator_members" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_collaborator_members_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_collaborator" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "collaboratorMemberId" TEXT NOT NULL,
    "collabOrgIdentity" TEXT,
    "orgIdentity" TEXT NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_collaborator_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_members_id_key" ON "ace_collaborator_members"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_members_email_key" ON "ace_collaborator_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_members_mobile_key" ON "ace_collaborator_members"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "ace_collaborator_id_key" ON "ace_collaborator"("id");

-- AddForeignKey
ALTER TABLE "ace_collaborator" ADD CONSTRAINT "ace_collaborator_collaboratorMemberId_fkey" FOREIGN KEY ("collaboratorMemberId") REFERENCES "ace_collaborator_members"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_collaborator" ADD CONSTRAINT "ace_collaborator_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_collaborator" ADD CONSTRAINT "ace_collaborator_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "ace_org"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
