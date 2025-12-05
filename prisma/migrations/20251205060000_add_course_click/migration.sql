-- CreateTable
CREATE TABLE "CourseClick" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseClick_questionId_idx" ON "CourseClick"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseClick_questionId_affiliateUrl_key" ON "CourseClick"("questionId", "affiliateUrl");
