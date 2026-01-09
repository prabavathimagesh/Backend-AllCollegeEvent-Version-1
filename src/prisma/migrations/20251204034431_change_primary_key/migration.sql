-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "idnty" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDel" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
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
    "roleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "Org" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "OTP" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userIdentity" TEXT,
    "orgIdentity" TEXT,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "Event" (
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
    "userIdentity" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_idnty_key" ON "Role"("idnty");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Org_id_key" ON "Org"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Org_domainEmail_key" ON "Org"("domainEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_id_key" ON "OTP"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_id_key" ON "Event"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userIdentity_fkey" FOREIGN KEY ("userIdentity") REFERENCES "User"("identity") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "Org"("identity") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_orgIdentity_fkey" FOREIGN KEY ("orgIdentity") REFERENCES "Org"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userIdentity_fkey" FOREIGN KEY ("userIdentity") REFERENCES "User"("identity") ON DELETE SET NULL ON UPDATE CASCADE;
