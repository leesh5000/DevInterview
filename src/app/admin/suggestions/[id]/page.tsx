import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskIp } from "@/lib/ip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarkdownPreview from "@/components/MarkdownPreview";
import SuggestionActions from "./SuggestionActions";

export default async function SuggestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
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
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">대기 중</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">승인됨</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">반려됨</Badge>;
      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/admin/suggestions"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">수정 제안 상세</h1>
          {getStatusBadge(suggestion.status)}
        </div>
        <p className="text-muted-foreground">
          <span className="font-medium">{suggestion.question.category.name}</span>
          {" / "}
          {suggestion.question.questionTitle}
        </p>
      </div>

      {/* 제안 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">제안 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">요청자 IP:</span> {maskIp(suggestion.requesterIp)}</p>
          <p><span className="text-muted-foreground">요청일:</span> {new Date(suggestion.createdAt).toLocaleString("ko-KR")}</p>
          {suggestion.reviewedAt && (
            <p><span className="text-muted-foreground">처리일:</span> {new Date(suggestion.reviewedAt).toLocaleString("ko-KR")}</p>
          )}
          <div className="pt-2">
            <p className="text-muted-foreground mb-1">수정 사유:</p>
            <p className="bg-muted/50 p-3 rounded-md">{suggestion.reason}</p>
          </div>
          {suggestion.adminComment && (
            <div className="pt-2">
              <p className="text-muted-foreground mb-1">관리자 코멘트:</p>
              <p className="bg-muted/50 p-3 rounded-md">{suggestion.adminComment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 비교 뷰 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* 원본 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">원본</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">질문 본문</h4>
              <div className="bg-muted/30 p-4 rounded-md max-h-80 overflow-y-auto">
                <MarkdownPreview content={suggestion.question.questionBody || "(내용 없음)"} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">답변 내용</h4>
              <div className="bg-muted/30 p-4 rounded-md max-h-80 overflow-y-auto">
                <MarkdownPreview content={suggestion.question.answerContent || "(내용 없음)"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 수정안 */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-600 dark:text-blue-400">수정안</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">질문 본문</h4>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md max-h-80 overflow-y-auto">
                <MarkdownPreview content={suggestion.questionBody || "(내용 없음)"} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">답변 내용</h4>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md max-h-80 overflow-y-auto">
                <MarkdownPreview content={suggestion.answerContent || "(내용 없음)"} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼 (PENDING 상태일 때만) */}
      {suggestion.status === "PENDING" && (
        <SuggestionActions suggestionId={suggestion.id} />
      )}

      {/* 원본 게시글 링크 */}
      <div className="mt-8 text-center">
        <Link
          href={`/questions/${suggestion.questionId}`}
          target="_blank"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          원본 게시글 보기 →
        </Link>
      </div>
    </main>
  );
}
