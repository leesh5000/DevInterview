import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // 카테고리 및 게시물 수 조회
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await prisma.interviewQuestion.count({
        where: {
          isPublished: true,
          categoryId: cat.id,
        },
      });
      return { ...cat, questionCount: count };
    })
  );

  // 대상 독자 및 게시물 수 조회
  const targetRoles = await prisma.targetRole.findMany({
    orderBy: { order: "asc" },
  });

  const targetRolesWithCount = await Promise.all(
    targetRoles.map(async (role) => {
      const count = await prisma.interviewQuestion.count({
        where: {
          isPublished: true,
          targetRoles: { has: role.name },
        },
      });
      return { ...role, questionCount: count };
    })
  );

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-lg font-semibold text-foreground">
            DevInterview
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              href="/questions"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              질문 목록
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
          개발자 면접, 확실하게 준비하세요
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          실제 면접에서 자주 나오는 질문과 모범 답안을 확인하고,
          AI 요약과 추천 강의로 효율적으로 학습하세요.
        </p>
        <Link href="/questions">
          <Button size="lg" className="gap-2">
            면접 질문 보기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
          카테고리별 면접 질문
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesWithCount.map((category) => (
            <Link key={category.slug} href={`/questions?category=${category.slug}`}>
              <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {category.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {category.questionCount}개
                    </span>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-foreground hover:underline inline-flex items-center gap-1">
                    질문 보기
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Target Roles Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
          대상 독자별 면접 질문
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {targetRolesWithCount.map((role) => (
            <Link key={role.name} href={`/questions?role=${encodeURIComponent(role.name)}`}>
              <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {role.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {role.questionCount}개
                    </span>
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-foreground hover:underline inline-flex items-center gap-1">
                    질문 보기
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
