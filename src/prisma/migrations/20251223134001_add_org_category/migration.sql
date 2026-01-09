-- CreateTable
CREATE TABLE "org_category" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_category_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "org_category_id_key" ON "org_category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "org_category_category_name_key" ON "org_category"("category_name");
