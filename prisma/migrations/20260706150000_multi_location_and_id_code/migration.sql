-- CreateTable
CREATE TABLE "CompanyLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyLocation_pkey" PRIMARY KEY ("id")
);

-- Preserve any existing single-location geofence data as a company's first location
INSERT INTO "CompanyLocation" ("id", "name", "latitude", "longitude", "radiusMeters", "companyId", "createdAt", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text),
    'მთავარი ლოკაცია',
    "allowedLatitude",
    "allowedLongitude",
    "allowedRadiusMeters",
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Company"
WHERE "allowedLatitude" IS NOT NULL
  AND "allowedLongitude" IS NOT NULL
  AND "allowedRadiusMeters" IS NOT NULL;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "identificationCode" TEXT,
DROP COLUMN "allowedLatitude",
DROP COLUMN "allowedLongitude",
DROP COLUMN "allowedRadiusMeters";

-- CreateIndex
CREATE UNIQUE INDEX "Company_identificationCode_key" ON "Company"("identificationCode");

-- AddForeignKey
ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
