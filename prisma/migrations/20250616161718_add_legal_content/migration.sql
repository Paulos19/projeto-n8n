-- CreateTable
CREATE TABLE "LegalContent" (
    "id" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalContent_pageType_key" ON "LegalContent"("pageType");
