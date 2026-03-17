-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "servicePackageId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "appointments_servicePackageId_idx" ON "appointments"("servicePackageId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "service_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
