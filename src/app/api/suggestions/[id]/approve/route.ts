import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// POST: 수정 제안 승인
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 제안 조회
    const suggestion = await prisma.suggestionRequest.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json(
        { error: "수정 제안을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (suggestion.status !== "PENDING") {
      return NextResponse.json(
        { error: "이미 처리된 제안입니다." },
        { status: 400 }
      );
    }

    // 트랜잭션으로 처리: 게시글 업데이트 + 제안 상태 변경
    const result = await prisma.$transaction([
      // 원본 게시글 업데이트 + 검수 횟수 증가
      prisma.interviewQuestion.update({
        where: { id: suggestion.questionId },
        data: {
          questionBody: suggestion.questionBody,
          answerContent: suggestion.answerContent,
          reviewCount: { increment: 1 },
        },
      }),
      // 제안 상태 업데이트
      prisma.suggestionRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      suggestion: result[1],
    });
  } catch (error) {
    console.error("Error approving suggestion:", error);
    return NextResponse.json(
      { error: "승인 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
