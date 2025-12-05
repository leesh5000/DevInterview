import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const [
    totalQuestions,
    publishedQuestions,
    draftQuestions,
    totalViews,
    popularQuestions,
    pendingSuggestions,
  ] = await Promise.all([
    prisma.interviewQuestion.count(),
    prisma.interviewQuestion.count({ where: { isPublished: true } }),
    prisma.interviewQuestion.count({ where: { isPublished: false } }),
    prisma.interviewQuestion.aggregate({ _sum: { viewCount: true } }),
    prisma.interviewQuestion.findMany({
      take: 5,
      orderBy: { viewCount: "desc" },
      include: { category: true },
    }),
    prisma.suggestionRequest.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        question: { select: { questionTitle: true } },
      },
    }),
  ]);

  const recentQuestions = await prisma.interviewQuestion.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-8">대시보드</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 게시물
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              발행됨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">{publishedQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              임시저장
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{draftQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 조회수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {totalViews._sum.viewCount ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className={pendingSuggestions.length > 0 ? "border-orange-300 dark:border-orange-700" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              대기 중인 수정 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${pendingSuggestions.length > 0 ? "text-orange-600 dark:text-orange-500" : "text-foreground"}`}>
              {pendingSuggestions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Questions */}
        <Card>
          <CardHeader>
            <CardTitle>최근 작성 게시물</CardTitle>
          </CardHeader>
          <CardContent>
            {recentQuestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">아직 작성된 게시물이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {recentQuestions.map((q) => (
                  <li key={q.id} className="flex justify-between items-center">
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="text-sm text-foreground hover:underline truncate flex-1"
                    >
                      {q.questionTitle}
                    </Link>
                    <span
                      className={`text-xs px-2 py-1 rounded-md ${
                        q.isPublished
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {q.isPublished ? "발행됨" : "임시저장"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Popular Questions */}
        <Card>
          <CardHeader>
            <CardTitle>인기 게시물</CardTitle>
          </CardHeader>
          <CardContent>
            {popularQuestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">아직 작성된 게시물이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {popularQuestions.map((q) => (
                  <li key={q.id} className="flex justify-between items-center">
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="text-sm text-foreground hover:underline truncate flex-1"
                    >
                      {q.questionTitle}
                    </Link>
                    <span className="text-muted-foreground text-sm">
                      조회 {q.viewCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pending Suggestions */}
        <Card className={pendingSuggestions.length > 0 ? "border-orange-300 dark:border-orange-700" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              대기 중인 수정 제안
              {pendingSuggestions.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingSuggestions.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">대기 중인 수정 제안이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {pendingSuggestions.map((s) => (
                  <li key={s.id} className="flex justify-between items-center">
                    <Link
                      href={`/admin/suggestions/${s.id}`}
                      className="text-sm text-foreground hover:underline truncate flex-1"
                    >
                      {s.question.questionTitle.length > 30
                        ? s.question.questionTitle.slice(0, 30) + "..."
                        : s.question.questionTitle}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      {new Date(s.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {pendingSuggestions.length > 0 && (
              <Link
                href="/admin/suggestions"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block"
              >
                전체 보기 →
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
