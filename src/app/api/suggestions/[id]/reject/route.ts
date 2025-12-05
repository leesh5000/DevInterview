import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// POST: 수정 제안 반려
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
    const body = await request.json().catch(() => ({}));
    const { adminComment } = body;

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

    // 제안 상태 업데이트
    const updatedSuggestion = await prisma.suggestionRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminComment: adminComment || null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      suggestion: updatedSuggestion,
    });
  } catch (error) {
    console.error("Error rejecting suggestion:", error);
    return NextResponse.json(
      { error: "반려 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
