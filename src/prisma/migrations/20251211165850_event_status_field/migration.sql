-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PRIVATE');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "adminCreatedBy" TEXT,
ADD COLUMN     "isAdminCreated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminCreatedBy" TEXT,
ADD COLUMN     "isAdminCreated" BOOLEAN NOT NULL DEFAULT false;
