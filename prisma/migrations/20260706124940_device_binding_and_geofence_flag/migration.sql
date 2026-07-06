-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "outOfRange" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AttendanceRecord_deviceId_date_idx" ON "AttendanceRecord"("deviceId", "date");
