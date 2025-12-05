import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET: 수정 제안 상세 조회 (어드민 전용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const suggestion = await prisma.suggestionRequest.findUnique({
    where: { id },
    include: {
      question: {
        include: { category: true },
      },
    },
  });

  if (!suggestion) {
    return NextResponse.json(
      { error: "수정 제안을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json(suggestion);
}
