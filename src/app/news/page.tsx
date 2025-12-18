import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { SEO_CONFIG } from "@/lib/seo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "개발 소식",
  description: "개발자를 위한 최신 기술 뉴스와 AI 요약을 확인하세요.",
  alternates: {
    canonical: `${SEO_CONFIG.SITE_URL}/news`,
  },
  openGraph: {
    title: `개발 소식 | ${SEO_CONFIG.SITE_NAME}`,
    description: "개발자를 위한 최신 기술 뉴스와 AI 요약을 확인하세요.",
    url: `${SEO_CONFIG.SITE_URL}/news`,
  },
  twitter: {
    title: `개발 소식 | ${SEO_CONFIG.SITE_NAME}`,
    description: "개발자를 위한 최신 기술 뉴스와 AI 요약을 확인하세요.",
  },
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date;

  // 모든 뉴스 조회
  const allNews = await prisma.dailyNews.findMany({
    orderBy: { publishedAt: "desc" },
    take: 200,
  });

  // 날짜별로 그룹화하여 날짜 목록과 개수 추출
  const dateCountMap: Record<string, number> = {};
  allNews.forEach((item) => {
    const dateKey = item.displayDate.toISOString().split("T")[0];
    dateCountMap[dateKey] = (dateCountMap[dateKey] || 0) + 1;
  });

  const sortedDates = Object.keys(dateCountMap).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // 선택된 날짜에 해당하는 뉴스만 필터링
  const filteredNews = selectedDate
    ? allNews.filter(
        (item) => item.displayDate.toISOString().split("T")[0] === selectedDate
      )
    : allNews;

  const formatDateLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatFullDate = (dateKey: string) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-[#1a1a1a] bg-white dark:bg-[#111111]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            DevInterview
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              href="/questions"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              질문 목록
            </Link>
            <Link
              href="/news"
              className="text-gray-900 dark:text-white font-medium"
            >
              개발 소식
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Newspaper className="h-7 w-7 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            개발 소식
          </h1>
        </div>

        {/* Date Filter */}
        <div className="mb-8 space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2 md:inline md:mb-0 md:mr-3">
              <Calendar className="h-4 w-4 inline mr-1" />
              날짜:
            </span>
            <div className="inline-flex flex-wrap gap-2">
              <Link
                href="/news"
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                  !selectedDate
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                전체
                <span className="ml-1.5 text-xs opacity-70">
                  ({allNews.length})
                </span>
              </Link>
              {sortedDates.slice(0, 14).map((dateKey) => (
                <Link
                  key={dateKey}
                  href={`/news?date=${dateKey}`}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedDate === dateKey
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {formatDateLabel(dateKey)}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({dateCountMap[dateKey]})
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Filter */}
          {selectedDate && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-[#1a1a1a]">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                선택된 날짜:
              </span>
              <Badge
                variant="secondary"
                className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
              >
                {formatFullDate(selectedDate)}
              </Badge>
              <Link
                href="/news"
                className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
              >
                해제
              </Link>
            </div>
          )}
        </div>

        {/* News List */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedDate
                ? "해당 날짜에 등록된 개발 소식이 없습니다."
                : "등록된 개발 소식이 없습니다."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`}>
                <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base md:text-lg font-medium leading-tight">
                        {item.title}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(item.publishedAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed line-clamp-2 mb-3">
                      {item.aiSummary}
                    </CardDescription>
                    <span className="text-xs text-purple-500 inline-flex items-center gap-1">
                      자세히 보기
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
