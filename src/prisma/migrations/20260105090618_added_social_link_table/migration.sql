/*
  Warnings:

  - You are about to drop the column `instagram` on the `ace_org` table. All the data in the column will be lost.
  - You are about to drop the column `linkedIn` on the `ace_org` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `ace_org` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ace_org" DROP COLUMN "instagram",
DROP COLUMN "linkedIn",
DROP COLUMN "whatsapp";

-- CreateTable
CREATE TABLE "ace_org_social_link" (
    "identity" TEXT NOT NULL,
    "orgIdentity" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_org_social_link_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_org_social_link_orgIdentity_platform_key" ON "ace_org_social_link"("orgIdentity", "platform");

-- AddForeignKey
ALTER TABLE "ace_org_social_link" ADD CONSTRAINT "ace_org_social_link_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "ace_org"("identity") ON DELETE CASCADE ON UPDATE CASCADE;
