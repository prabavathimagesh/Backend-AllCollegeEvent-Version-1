/*
  Warnings:

  - You are about to drop the `AuthProvider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OTP` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Org` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_orgIdentity_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userIdentity_fkey";

-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_orgIdentity_fkey";

-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_userIdentity_fkey";

-- DropForeignKey
ALTER TABLE "Org" DROP CONSTRAINT "Org_roleId_fkey";

-- DropForeignKey
ALTER TABLE "SocialAccount" DROP CONSTRAINT "SocialAccount_providerId_fkey";

-- DropForeignKey
ALTER TABLE "SocialAccount" DROP CONSTRAINT "SocialAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropTable
DROP TABLE "AuthProvider";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "OTP";

-- DropTable
DROP TABLE "Org";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "SocialAccount";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "ace_role" (
    "id" SERIAL NOT NULL,
    "idnty" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDel" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ace_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ace_user" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "profileImage" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "roleId" INTEGER,
    "isAdminCreated" BOOLEAN NOT NULL DEFAULT false,
    "adminCreatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_user_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_org" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "domainEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationCategory" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "profileImage" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "linkedIn" TEXT,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN DEFAULT true,
    "logoUrl" TEXT,
    "website" TEXT,
    "isAdminCreated" BOOLEAN NOT NULL DEFAULT false,
    "adminCreatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ace_org_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_otp" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "updatedAt" TIMESTAMP(3),
    "userIdentity" TEXT,
    "orgIdentity" TEXT,

    CONSTRAINT "ace_otp_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_event" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "orgIdentity" TEXT NOT NULL,
    "createdBy" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "bannerImage" TEXT,
    "venueName" TEXT,
    "mode" TEXT,
    "eventDate" TEXT,
    "eventTime" TEXT,
    "venue" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "userIdentity" TEXT,

    CONSTRAINT "ace_event_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_auth_provider" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "providerName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_auth_provider_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_social_account" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_social_account_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_perks" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "perk_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_perks_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_certification" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "cert_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_certification_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_type_of_category" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_type_of_category_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_role_idnty_key" ON "ace_role"("idnty");

-- CreateIndex
CREATE UNIQUE INDEX "ace_user_id_key" ON "ace_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_user_email_key" ON "ace_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ace_org_id_key" ON "ace_org"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_org_domainEmail_key" ON "ace_org"("domainEmail");

-- CreateIndex
CREATE UNIQUE INDEX "ace_otp_id_key" ON "ace_otp"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_id_key" ON "ace_event"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_auth_provider_id_key" ON "ace_auth_provider"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_social_account_id_key" ON "ace_social_account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_perks_id_key" ON "ace_perks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_certification_id_key" ON "ace_certification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_type_of_category_id_key" ON "ace_type_of_category"("id");

-- AddForeignKey
ALTER TABLE "ace_user" ADD CONSTRAINT "ace_user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ace_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_org" ADD CONSTRAINT "ace_org_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ace_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_otp" ADD CONSTRAINT "ace_otp_userIdentity_fkey" FOREIGN KEY ("userIdentity") REFERENCES "ace_user"("identity") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_otp" ADD CONSTRAINT "ace_otp_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "ace_org"("identity") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event" ADD CONSTRAINT "ace_event_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "ace_org"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_event" ADD CONSTRAINT "ace_event_userIdentity_fkey" FOREIGN KEY ("userIdentity") REFERENCES "ace_user"("identity") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_social_account" ADD CONSTRAINT "ace_social_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ace_user"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_social_account" ADD CONSTRAINT "ace_social_account_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ace_auth_provider"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
