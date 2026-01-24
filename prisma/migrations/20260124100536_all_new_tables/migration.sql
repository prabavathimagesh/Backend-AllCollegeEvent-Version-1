/*
  Warnings:

  - The primary key for the `ace_department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdat` on the `ace_department` table. All the data in the column will be lost.
  - You are about to drop the column `updatedat` on the `ace_department` table. All the data in the column will be lost.
  - The primary key for the `ace_eligible_department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdat` on the `ace_eligible_department` table. All the data in the column will be lost.
  - You are about to drop the column `updatedat` on the `ace_eligible_department` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ace_department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ace_eligible_department` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- DropIndex
DROP INDEX "ace_collaborator_members_organizerNumber_key";

-- DropIndex
DROP INDEX "idx_event_cert";

-- DropIndex
DROP INDEX "idx_event_eligible_dept";

-- DropIndex
DROP INDEX "idx_event_mode";

-- DropIndex
DROP INDEX "idx_event_tags";

-- DropIndex
DROP INDEX "idx_event_view";

-- DropIndex
DROP INDEX "idx_calendar_dates";

-- DropIndex
DROP INDEX "idx_location_country";

-- DropIndex
DROP INDEX "idx_ticket_price";

-- AlterTable
ALTER TABLE "ace_department" DROP CONSTRAINT "ace_department_pkey",
DROP COLUMN "createdat",
DROP COLUMN "updatedat",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "identity" DROP DEFAULT,
ALTER COLUMN "identity" SET DATA TYPE TEXT,
ADD CONSTRAINT "ace_department_pkey" PRIMARY KEY ("identity");

-- AlterTable
ALTER TABLE "ace_eligible_department" DROP CONSTRAINT "ace_eligible_department_pkey",
DROP COLUMN "createdat",
DROP COLUMN "updatedat",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "identity" DROP DEFAULT,
ALTER COLUMN "identity" SET DATA TYPE TEXT,
ADD CONSTRAINT "ace_eligible_department_pkey" PRIMARY KEY ("identity");

-- AlterTable
ALTER TABLE "ace_event" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ace_event_save" (
    "identity" TEXT NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "userIdentity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_save_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_event_like" (
    "identity" TEXT NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "userIdentity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_like_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_follow" (
    "identity" TEXT NOT NULL,
    "followerType" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingOrgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_follow_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_admin" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_admin_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_save_eventIdentity_userIdentity_key" ON "ace_event_save"("eventIdentity", "userIdentity");

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_like_eventIdentity_userIdentity_key" ON "ace_event_like"("eventIdentity", "userIdentity");

-- CreateIndex
CREATE UNIQUE INDEX "ace_follow_followerType_followerId_followingOrgId_key" ON "ace_follow"("followerType", "followerId", "followingOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "ace_admin_id_key" ON "ace_admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_admin_email_key" ON "ace_admin"("email");

-- AddForeignKey
ALTER TABLE "ace_follow" ADD CONSTRAINT "ace_follow_followingOrgId_fkey" FOREIGN KEY ("followingOrgId") REFERENCES "ace_org"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
