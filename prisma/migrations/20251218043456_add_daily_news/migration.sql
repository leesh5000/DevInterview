-- CreateTable
CREATE TABLE "DailyNews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "description" TEXT,
    "aiSummary" TEXT NOT NULL,
    "relatedCourses" JSONB NOT NULL DEFAULT '[]',
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "displayDate" DATE NOT NULL,

    CONSTRAINT "DailyNews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyNews_originalUrl_key" ON "DailyNews"("originalUrl");

-- CreateIndex
CREATE INDEX "DailyNews_displayDate_idx" ON "DailyNews"("displayDate");

-- CreateIndex
CREATE INDEX "DailyNews_publishedAt_idx" ON "DailyNews"("publishedAt");
