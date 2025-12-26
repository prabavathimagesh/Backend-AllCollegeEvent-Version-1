/*
  Warnings:

  - You are about to drop the `event_collaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_collaborator" DROP CONSTRAINT "event_collaborator_eventIdentity_fkey";

-- DropForeignKey
ALTER TABLE "event_ticket" DROP CONSTRAINT "event_ticket_eventIdentity_fkey";

-- DropTable
DROP TABLE "event_collaborator";

-- DropTable
DROP TABLE "event_ticket";

-- DropTable
DROP TABLE "org_category";

-- CreateTable
CREATE TABLE "ace_org_category" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_org_category_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_event_collaborator" (
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

    CONSTRAINT "ace_event_collaborator_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_event_ticket" (
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

    CONSTRAINT "ace_event_ticket_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_org_category_id_key" ON "ace_org_category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_org_category_category_name_key" ON "ace_org_category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_collaborator_id_key" ON "ace_event_collaborator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_ticket_id_key" ON "ace_event_ticket"("id");

-- AddForeignKey
ALTER TABLE "ace_event_collaborator" ADD CONSTRAINT "ace_event_collaborator_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event_ticket" ADD CONSTRAINT "ace_event_ticket_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
