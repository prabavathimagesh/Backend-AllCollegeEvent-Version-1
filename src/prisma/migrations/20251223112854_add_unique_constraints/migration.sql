/*
  Warnings:

  - A unique constraint covering the columns `[cert_name]` on the table `ace_certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[perk_name]` on the table `ace_perks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ace_role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[category_name]` on the table `ace_type_of_category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ace_certification_cert_name_key" ON "ace_certification"("cert_name");

-- CreateIndex
CREATE UNIQUE INDEX "ace_perks_perk_name_key" ON "ace_perks"("perk_name");

-- CreateIndex
CREATE UNIQUE INDEX "ace_role_name_key" ON "ace_role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ace_type_of_category_category_name_key" ON "ace_type_of_category"("category_name");
