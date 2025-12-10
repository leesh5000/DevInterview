import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const questions = await prisma.interviewQuestion.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Export용 데이터 형식으로 변환
    const exportData = questions.map((q) => ({
      categorySlug: q.category.slug,
      questionTitle: q.questionTitle,
      questionBody: q.questionBody,
      answerContent: q.answerContent,
      followUpQuestions: q.followUpQuestions,
      targetRoles: q.targetRoles,
      tags: q.tags,
      aiSummary: q.aiSummary,
      relatedCourses: q.relatedCourses,
      isPublished: q.isPublished,
    }));

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      count: exportData.length,
      questions: exportData,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export questions" },
      { status: 500 }
    );
  }
}
