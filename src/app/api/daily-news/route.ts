import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 오늘의 뉴스 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");
  const limit = parseInt(searchParams.get("limit") || "5");

  try {
    // KST 기준 오늘 날짜
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const today = new Date(kstDate.toISOString().split("T")[0]);

    const whereClause = dateParam
      ? { displayDate: new Date(dateParam) }
      : { displayDate: today };

    const news = await prisma.dailyNews.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching daily news:", error);
    return NextResponse.json(
      { error: "뉴스 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
