-- CreateTable
CREATE TABLE "ace_countries" (
    "identity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "phoneCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_countries_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_states" (
    "identity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_states_pkey" PRIMARY KEY ("identity")
);

-- CreateTable
CREATE TABLE "ace_cities" (
    "identity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_cities_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_countries_name_key" ON "ace_countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ace_countries_code_key" ON "ace_countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ace_states_name_countryId_key" ON "ace_states"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "ace_cities_name_stateId_key" ON "ace_cities"("name", "stateId");

-- AddForeignKey
ALTER TABLE "ace_states" ADD CONSTRAINT "ace_states_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "ace_countries"("identity") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ace_cities" ADD CONSTRAINT "ace_cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "ace_states"("identity") ON DELETE CASCADE ON UPDATE CASCADE;
