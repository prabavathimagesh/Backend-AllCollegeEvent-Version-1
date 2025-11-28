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
    "id" SERIAL NOT NULL,
    "idnty" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pwd" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pImg" TEXT,
    "isDel" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER,
    "crAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org" (
    "id" SERIAL NOT NULL,
    "idnty" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domEmail" TEXT NOT NULL,
    "pwd" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pImg" TEXT,
    "whatsapp" TEXT,
    "insta" TEXT,
    "linkedIn" TEXT,
    "evCnt" INTEGER NOT NULL DEFAULT 0,
    "isDel" BOOLEAN NOT NULL DEFAULT false,
    "isVerf" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER,
    "crAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "idnty" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expAt" TIMESTAMP(3) NOT NULL,
    "crAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "orgId" INTEGER,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_idnty_key" ON "Role"("idnty");

-- CreateIndex
CREATE UNIQUE INDEX "User_idnty_key" ON "User"("idnty");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Org_idnty_key" ON "Org"("idnty");

-- CreateIndex
CREATE UNIQUE INDEX "Org_domEmail_key" ON "Org"("domEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_idnty_key" ON "OTP"("idnty");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
