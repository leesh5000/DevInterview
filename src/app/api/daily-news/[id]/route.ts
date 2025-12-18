import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 단일 뉴스 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const news = await prisma.dailyNews.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        { error: "뉴스를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "뉴스 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 뉴스 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, aiSummary, relatedCourses, originalUrl, description } = body;

    const news = await prisma.dailyNews.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(aiSummary && { aiSummary }),
        ...(relatedCourses && {
          relatedCourses: relatedCourses as unknown as Prisma.InputJsonValue,
        }),
        ...(originalUrl && { originalUrl }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { error: "뉴스 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 뉴스 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.dailyNews.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "뉴스 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
