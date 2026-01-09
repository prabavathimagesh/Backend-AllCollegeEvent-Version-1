-- CreateTable
CREATE TABLE "ace_event_location" (
    "identity" TEXT NOT NULL,
    "eventIdentity" TEXT NOT NULL,
    "onlineMeetLink" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "mapLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ace_event_location_pkey" PRIMARY KEY ("identity")
);

-- CreateIndex
CREATE UNIQUE INDEX "ace_event_location_eventIdentity_key" ON "ace_event_location"("eventIdentity");

-- AddForeignKey
ALTER TABLE "ace_event_location" ADD CONSTRAINT "ace_event_location_eventIdentity_fkey" FOREIGN KEY ("eventIdentity") REFERENCES "ace_event"("identity") ON DELETE CASCADE ON UPDATE CASCADE;
