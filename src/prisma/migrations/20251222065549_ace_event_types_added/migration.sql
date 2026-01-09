-- CreateTable
CREATE TABLE "ace_event_types" (
    "identity" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_identity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_types_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_types_id_key" ON "ace_event_types"("id");

-- AddForeignKey
ALTER TABLE "ace_event_types" ADD CONSTRAINT "ace_event_types_category_identity_fkey" FOREIGN KEY ("category_identity") REFERENCES "ace_type_of_category"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;
