import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsForm from "@/components/admin/NewsForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: PageProps) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const news = await prisma.dailyNews.findUnique({
    where: { id },
  });

  if (!news) {
    notFound();
  }

  const relatedCourses = news.relatedCourses as Array<{
    courseId: string;
    title: string;
    affiliateUrl: string;
    matchScore: number;
  }>;

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        뉴스 목록으로
      </Link>

      <h1 className="text-2xl font-semibold text-foreground mb-8">뉴스 수정</h1>

      <NewsForm
        initialData={{
          id: news.id,
          title: news.title,
          originalUrl: news.originalUrl,
          description: news.description,
          aiSummary: news.aiSummary,
          relatedCourses,
        }}
      />
    </main>
  );
}
