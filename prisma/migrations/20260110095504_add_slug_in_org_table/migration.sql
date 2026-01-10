/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ace_org` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ace_org" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ace_org_slug_key" ON "ace_org"("slug");
