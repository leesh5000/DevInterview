import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RelatedCourse {
  title: string;
  affiliateUrl: string;
  thumbnailUrl?: string;
}

interface ImportQuestion {
  categorySlug: string;
  questionTitle: string;
  questionBody: string;
  answerContent: string;
  followUpQuestions?: string;
  targetRoles?: string[];
  tags?: string[];
  aiSummary?: string | null;
  relatedCourses?: RelatedCourse[];
  isPublished?: boolean;
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { questions } = body as { questions: ImportQuestion[] };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Invalid data: questions array is required" },
        { status: 400 }
      );
    }

    // 카테고리 slug -> id 매핑
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

    // 유효성 검사
    const errors: string[] = [];
    questions.forEach((q, index) => {
      if (!q.categorySlug) {
        errors.push(`질문 ${index + 1}: categorySlug 필수`);
      } else if (!categoryMap.has(q.categorySlug)) {
        errors.push(`질문 ${index + 1}: 존재하지 않는 카테고리 '${q.categorySlug}'`);
      }
      if (!q.questionTitle) {
        errors.push(`질문 ${index + 1}: questionTitle 필수`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // 트랜잭션으로 일괄 생성
    const created = await prisma.$transaction(
      questions.map((q) =>
        prisma.interviewQuestion.create({
          data: {
            categoryId: categoryMap.get(q.categorySlug)!,
            questionTitle: q.questionTitle,
            questionBody: q.questionBody || "",
            answerContent: q.answerContent || "",
            followUpQuestions: q.followUpQuestions || "",
            targetRoles: q.targetRoles || [],
            tags: q.tags || [],
            aiSummary: q.aiSummary || null,
            relatedCourses: (q.relatedCourses || []) as unknown as Prisma.InputJsonValue,
            isPublished: q.isPublished ?? true,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      imported: created.length,
      questions: created.map((q) => ({
        id: q.id,
        questionTitle: q.questionTitle,
      })),
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import questions" },
      { status: 500 }
    );
  }
}
