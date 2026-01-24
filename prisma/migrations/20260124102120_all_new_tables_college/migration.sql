-- CreateTable
CREATE TABLE "ace_college" (
    "id" SERIAL NOT NULL,
    "identity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityIdentity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_college_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_college_id_key" ON "ace_college"("id");
