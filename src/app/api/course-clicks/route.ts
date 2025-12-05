import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 특정 질문의 강의 클릭 수 조회
export async function GET(request: NextRequest) {
  const questionId = request.nextUrl.searchParams.get("questionId");

  if (!questionId) {
    return NextResponse.json(
      { error: "questionId is required" },
      { status: 400 }
    );
  }

  try {
    const clicks = await prisma.courseClick.findMany({
      where: { questionId },
      select: {
        affiliateUrl: true,
        clickCount: true,
      },
    });

    // affiliateUrl을 key로 하는 객체로 변환
    const clickMap: Record<string, number> = {};
    clicks.forEach((click) => {
      clickMap[click.affiliateUrl] = click.clickCount;
    });

    return NextResponse.json(clickMap);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch click counts" },
      { status: 500 }
    );
  }
}

// POST: 클릭 수 증가
export async function POST(request: NextRequest) {
  try {
    const { questionId, affiliateUrl } = await request.json();

    if (!questionId || !affiliateUrl) {
      return NextResponse.json(
        { error: "questionId and affiliateUrl are required" },
        { status: 400 }
      );
    }

    // upsert: 존재하면 증가, 없으면 생성
    const result = await prisma.courseClick.upsert({
      where: {
        questionId_affiliateUrl: {
          questionId,
          affiliateUrl,
        },
      },
      update: {
        clickCount: { increment: 1 },
      },
      create: {
        questionId,
        affiliateUrl,
        clickCount: 1,
      },
    });

    return NextResponse.json({ clickCount: result.clickCount });
  } catch {
    return NextResponse.json(
      { error: "Failed to record click" },
      { status: 500 }
    );
  }
}
