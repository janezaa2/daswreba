-- CreateEnum
CREATE TYPE "SiteContentPage" AS ENUM ('about', 'contact');

-- CreateTable
CREATE TABLE "SiteContentBlock" (
    "id" TEXT NOT NULL,
    "page" "SiteContentPage" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteContentBlock_page_order_idx" ON "SiteContentBlock"("page", "order");
