-- CreateTable
CREATE TABLE "ace_accommodation" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "accommodation_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_accommodation_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_accommodation_id_key" ON "ace_accommodation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ace_accommodation_accommodation_name_key" ON "ace_accommodation"("accommodation_name");
