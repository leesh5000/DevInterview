-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "InterviewQuestion" ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SuggestionRequest" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionBody" TEXT NOT NULL,
    "answerContent" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requesterIp" TEXT NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "SuggestionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuggestionRequest_questionId_idx" ON "SuggestionRequest"("questionId");

-- CreateIndex
CREATE INDEX "SuggestionRequest_status_idx" ON "SuggestionRequest"("status");

-- CreateIndex
CREATE INDEX "SuggestionRequest_requesterIp_createdAt_idx" ON "SuggestionRequest"("requesterIp", "createdAt");

-- AddForeignKey
ALTER TABLE "SuggestionRequest" ADD CONSTRAINT "SuggestionRequest_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
