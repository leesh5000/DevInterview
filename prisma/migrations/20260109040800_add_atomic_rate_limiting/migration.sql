-- 1. minuteBucket 컬럼 추가 (nullable로 먼저)
ALTER TABLE "SuggestionRequest" ADD COLUMN "minuteBucket" BIGINT;

-- 2. 기존 데이터는 createdAt 기준으로 분 단위 타임스탬프 계산
UPDATE "SuggestionRequest"
SET "minuteBucket" = FLOOR(EXTRACT(EPOCH FROM "createdAt") * 1000 / 60000);

-- 3. NOT NULL 제약 추가
ALTER TABLE "SuggestionRequest" ALTER COLUMN "minuteBucket" SET NOT NULL;

-- 4. 기존 인덱스 삭제 (requesterIp, createdAt)
DROP INDEX IF EXISTS "SuggestionRequest_requesterIp_createdAt_idx";

-- 5. 새로운 Unique 제약 추가 (원자적 Rate Limiting)
ALTER TABLE "SuggestionRequest" ADD CONSTRAINT "SuggestionRequest_requesterIp_minuteBucket_key" UNIQUE ("requesterIp", "minuteBucket");
