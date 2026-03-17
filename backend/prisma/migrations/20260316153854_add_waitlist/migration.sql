-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('ACTIVE', 'MATCHED', 'CONVERTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "timeFrom" TEXT,
    "timeTo" TEXT,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "notes" TEXT,
    "source" "AppointmentSource" NOT NULL DEFAULT 'WEB',
    "matchedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlist_entries_businessId_idx" ON "waitlist_entries"("businessId");

-- CreateIndex
CREATE INDEX "waitlist_entries_serviceId_idx" ON "waitlist_entries"("serviceId");

-- CreateIndex
CREATE INDEX "waitlist_entries_employeeId_idx" ON "waitlist_entries"("employeeId");

-- CreateIndex
CREATE INDEX "waitlist_entries_status_idx" ON "waitlist_entries"("status");

-- CreateIndex
CREATE INDEX "waitlist_entries_preferredDate_idx" ON "waitlist_entries"("preferredDate");

-- CreateIndex
CREATE INDEX "waitlist_entries_createdAt_idx" ON "waitlist_entries"("createdAt");

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
