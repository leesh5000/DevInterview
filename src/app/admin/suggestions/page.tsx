import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskIp } from "@/lib/ip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const statusFilter = params.status || "PENDING";

  const suggestions = await prisma.suggestionRequest.findMany({
    where: {
      ...(statusFilter !== "ALL" && { status: statusFilter as "PENDING" | "APPROVED" | "REJECTED" }),
    },
    include: {
      question: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 상태별 카운트
  const counts = await prisma.suggestionRequest.groupBy({
    by: ["status"],
    _count: true,
  });

  const pendingCount = counts.find((c) => c.status === "PENDING")?._count || 0;
  const approvedCount = counts.find((c) => c.status === "APPROVED")?._count || 0;
  const rejectedCount = counts.find((c) => c.status === "REJECTED")?._count || 0;
  const totalCount = pendingCount + approvedCount + rejectedCount;

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">수정 제안 관리</h1>
        <p className="text-muted-foreground">
          사용자들이 제출한 수정 제안을 검토하고 승인/반려할 수 있습니다.
        </p>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-2 mb-6">
        <Link href="/admin/suggestions?status=ALL">
          <Button variant={statusFilter === "ALL" ? "default" : "outline"} size="sm">
            전체 ({totalCount})
          </Button>
        </Link>
        <Link href="/admin/suggestions?status=PENDING">
          <Button variant={statusFilter === "PENDING" ? "default" : "outline"} size="sm">
            대기 중 ({pendingCount})
          </Button>
        </Link>
        <Link href="/admin/suggestions?status=APPROVED">
          <Button variant={statusFilter === "APPROVED" ? "default" : "outline"} size="sm">
            승인됨 ({approvedCount})
          </Button>
        </Link>
        <Link href="/admin/suggestions?status=REJECTED">
          <Button variant={statusFilter === "REJECTED" ? "default" : "outline"} size="sm">
            반려됨 ({rejectedCount})
          </Button>
        </Link>
      </div>

      {/* 제안 목록 */}
      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            해당 상태의 수정 제안이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {suggestion.question.questionTitle.length > 60
                        ? suggestion.question.questionTitle.slice(0, 60) + "..."
                        : suggestion.question.questionTitle}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {suggestion.question.category.name}
                    </CardDescription>
                  </div>
                  {getStatusBadge(suggestion.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground space-x-4">
                    <span>IP: {maskIp(suggestion.requesterIp)}</span>
                    <span>
                      요청일: {new Date(suggestion.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    {suggestion.reviewedAt && (
                      <span>
                        처리일: {new Date(suggestion.reviewedAt).toLocaleDateString("ko-KR")}
                      </span>
                    )}
                  </div>
                  <Link href={`/admin/suggestions/${suggestion.id}`}>
                    <Button variant="outline" size="sm">
                      상세 보기
                    </Button>
                  </Link>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  <span className="font-medium">수정 사유:</span> {suggestion.reason}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
