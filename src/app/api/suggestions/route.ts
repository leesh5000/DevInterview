import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getClientIp } from "@/lib/ip";

// POST: 수정 제안 생성 (인증 불필요, IP 기록)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, questionBody, answerContent, reason } = body;

    // 필수 필드 검증
    if (!questionId) {
      return NextResponse.json(
        { error: "게시글 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "수정 사유는 필수입니다." },
        { status: 400 }
      );
    }

    // IP 추출
    const requesterIp = getClientIp(request);

    // 분 단위 타임스탬프 (Rate Limiting용)
    const minuteBucket = BigInt(Math.floor(Date.now() / 60000));

    // 원본 게시글 존재 확인
    const originalQuestion = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
    });

    if (!originalQuestion) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 수정 제안 생성 (Unique Constraint로 원자적 Rate Limiting 보장)
    const suggestion = await prisma.suggestionRequest.create({
      data: {
        questionId,
        questionBody: questionBody || originalQuestion.questionBody,
        answerContent: answerContent || originalQuestion.answerContent,
        reason: reason.trim(),
        requesterIp,
        minuteBucket,
      },
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    // Prisma P2002: Unique constraint violation (동일 IP + 동일 분에 중복 요청)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "1분 후에 다시 시도해주세요." },
        { status: 429 }
      );
    }

    console.error("Error creating suggestion:", error);
    return NextResponse.json(
      { error: "수정 제안 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET: 수정 제안 목록 조회 (어드민 전용)
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  const suggestions = await prisma.suggestionRequest.findMany({
    where: {
      ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" }),
    },
    include: {
      question: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(suggestions);
}
