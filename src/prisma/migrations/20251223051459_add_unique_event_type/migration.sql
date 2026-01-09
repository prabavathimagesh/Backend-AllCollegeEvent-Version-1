/*
  Warnings:

  - A unique constraint covering the columns `[name,category_identity]` on the table `ace_event_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ace_event_types_name_category_identity_key" ON "ace_event_types"("name", "category_identity");
