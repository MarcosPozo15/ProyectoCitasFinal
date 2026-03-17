/*
  Warnings:

  - You are about to drop the column `mainServiceId` on the `service_package_items` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "BlockoutTargetType" AS ENUM ('BUSINESS', 'EMPLOYEE');

-- DropForeignKey
ALTER TABLE "service_package_items" DROP CONSTRAINT "service_package_items_mainServiceId_fkey";

-- DropIndex
DROP INDEX "service_package_items_mainServiceId_idx";

-- AlterTable
ALTER TABLE "service_package_items" DROP COLUMN "mainServiceId";

-- CreateTable
CREATE TABLE "business_opening_hours" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_opening_hours" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockouts" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "employeeId" TEXT,
    "targetType" "BlockoutTargetType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_opening_hours_businessId_idx" ON "business_opening_hours"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "business_opening_hours_businessId_weekday_key" ON "business_opening_hours"("businessId", "weekday");

-- CreateIndex
CREATE INDEX "employee_opening_hours_businessId_idx" ON "employee_opening_hours"("businessId");

-- CreateIndex
CREATE INDEX "employee_opening_hours_employeeId_idx" ON "employee_opening_hours"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_opening_hours_employeeId_weekday_key" ON "employee_opening_hours"("employeeId", "weekday");

-- CreateIndex
CREATE INDEX "blockouts_businessId_idx" ON "blockouts"("businessId");

-- CreateIndex
CREATE INDEX "blockouts_employeeId_idx" ON "blockouts"("employeeId");

-- CreateIndex
CREATE INDEX "blockouts_targetType_idx" ON "blockouts"("targetType");

-- CreateIndex
CREATE INDEX "blockouts_startsAt_endsAt_idx" ON "blockouts"("startsAt", "endsAt");

-- AddForeignKey
ALTER TABLE "business_opening_hours" ADD CONSTRAINT "business_opening_hours_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_opening_hours" ADD CONSTRAINT "employee_opening_hours_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockouts" ADD CONSTRAINT "blockouts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockouts" ADD CONSTRAINT "blockouts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
