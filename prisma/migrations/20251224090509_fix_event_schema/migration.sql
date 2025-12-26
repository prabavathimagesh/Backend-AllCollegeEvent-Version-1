/*
  Warnings:

  - You are about to drop the column `bannerImage` on the `ace_event` table. All the data in the column will be lost.
  - You are about to drop the column `eventDate` on the `ace_event` table. All the data in the column will be lost.
  - You are about to drop the column `eventTime` on the `ace_event` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `ace_event` table. All the data in the column will be lost.
  - You are about to drop the column `venueName` on the `ace_event` table. All the data in the column will be lost.
  - Added the required column `mode` to the `ace_event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- AlterTable
ALTER TABLE "ace_event" DROP COLUMN "bannerImage",
DROP COLUMN "eventDate",
DROP COLUMN "eventTime",
DROP COLUMN "venue",
DROP COLUMN "venueName",
ADD COLUMN     "bannerImages" TEXT[],
ADD COLUMN     "categoryIdentity" TEXT,
ADD COLUMN     "eligibleDeptIdentities" TEXT[],
ADD COLUMN     "eventLink" TEXT,
ADD COLUMN     "eventTypeIdentity" TEXT,
ADD COLUMN     "offers" TEXT,
ADD COLUMN     "orgCategoryIdentity" TEXT,
ADD COLUMN     "paymentLink" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "videoLink" TEXT,
DROP COLUMN "mode",
ADD COLUMN     "mode" "EventMode" NOT NULL;

-- CreateTable
CREATE TABLE "event_collaborator" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "hostOrgIdentity" TEXT,
    "orgCategoryIdentity" TEXT,
    "organizationName" TEXT,
    "organizationDeptIdentity" TEXT,
    "organizerName" TEXT,
    "organizerNumber" TEXT,
    "location" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_collaborator_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_event_calendar" (
    "identity" TEXT NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_calendar_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "event_ticket" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sellingFrom" TIMESTAMP(3) NOT NULL,
    "sellingTo" TIMESTAMP(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "totalQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_ticket_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_event_perk" (
    "eventIdentity" TEXT NOT NULL,
    "perkIdentity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_perk_pkey" PRIMARY KEY ("eventIdentity","perkIdentity")
);

-- CreateTable
CREATE TABLE "ace_event_certification" (
    "eventIdentity" TEXT NOT NULL,
    "certIdentity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_certification_pkey" PRIMARY KEY ("eventIdentity","certIdentity")
);

-- CreateTable
CREATE TABLE "ace_event_accommodation" (
    "eventIdentity" TEXT NOT NULL,
    "accommodationIdentity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_accommodation_pkey" PRIMARY KEY ("eventIdentity","accommodationIdentity")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_collaborator_id_key" ON "event_collaborator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "event_ticket_id_key" ON "event_ticket"("id");

-- AddForeignKey
ALTER TABLE "event_collaborator" ADD CONSTRAINT "event_collaborator_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_calendar" ADD CONSTRAINT "ace_event_calendar_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_perk" ADD CONSTRAINT "ace_event_perk_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_perk" ADD CONSTRAINT "ace_event_perk_perkIdentity_fkey" FOREIGN KEY ("perkIdentity") REFERENCES "ace_perks"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_certification" ADD CONSTRAINT "ace_event_certification_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_certification" ADD CONSTRAINT "ace_event_certification_certIdentity_fkey" FOREIGN KEY ("certIdentity") REFERENCES "ace_certification"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_accommodation" ADD CONSTRAINT "ace_event_accommodation_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_accommodation" ADD CONSTRAINT "ace_event_accommodation_accommodationIdentity_fkey" FOREIGN KEY ("accommodationIdentity") REFERENCES "ace_accommodation"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
