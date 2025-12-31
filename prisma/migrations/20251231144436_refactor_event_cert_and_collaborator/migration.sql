/*
  Warnings:

  - You are about to drop the `ace_event_collaborator` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `ace_event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ace_event_collaborator" DROP CONSTRAINT "ace_event_collaborator_eventIdentity_fkey";

-- AlterTable
ALTER TABLE "ace_event" ADD COLUMN     "certIdentity" TEXT;

-- DropTable
DROP TABLE "ace_event_collaborator";

-- CreateTable
CREATE TABLE "collaborator_members" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborator_members_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "collaborator" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "collaboratorMemberId" TEXT NOT NULL,
    "collabOrgIdentity" TEXT,
    "orgIdentity" TEXT NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborator_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "collaborator_members_id_key" ON "collaborator_members"("id");

-- CreateIndex
CREATE UNIQUE INDEX "collaborator_members_email_key" ON "collaborator_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "collaborator_members_mobile_key" ON "collaborator_members"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "collaborator_id_key" ON "collaborator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_slug_key" ON "ace_event"("slug");

-- AddForeignKey
ALTER TABLE "ace_event" ADD CONSTRAINT "ace_event_certIdentity_fkey" FOREIGN KEY ("certIdentity") REFERENCES "ace_certification"("identity") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_collaboratorMemberId_fkey" FOREIGN KEY ("collaboratorMemberId") REFERENCES "collaborator_members"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "ace_org"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
