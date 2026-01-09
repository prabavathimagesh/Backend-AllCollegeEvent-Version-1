/*
  Warnings:

  - The primary key for the `AuthProvider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SocialAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `AuthProvider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.
  - The required column `identity` was added to the `AuthProvider` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `identity` was added to the `SocialAccount` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "SocialAccount" DROP CONSTRAINT "SocialAccount_providerId_fkey";

-- DropForeignKey
ALTER TABLE "SocialAccount" DROP CONSTRAINT "SocialAccount_userId_fkey";

-- AlterTable
ALTER TABLE "AuthProvider" DROP CONSTRAINT "AuthProvider_pkey",
ADD COLUMN     "identity" TEXT NOT NULL,
ADD CONSTRAINT "AuthProvider_pkey" PRIMARY KEY ("identity");

-- AlterTable
ALTER TABLE "SocialAccount" DROP CONSTRAINT "SocialAccount_pkey",
ADD COLUMN     "identity" TEXT NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "providerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("identity");

-- CreateIndex
CREATE UNIQUE INDEX "AuthProvider_id_key" ON "AuthProvider"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_id_key" ON "SocialAccount"("id");

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AuthProvider"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
