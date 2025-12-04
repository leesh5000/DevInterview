import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  return (
    <div className="min-h-screen bg-background transition-colors">
      {authenticated && (
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-lg font-semibold text-foreground">
                DevInterview Admin
              </Link>
              <nav className="flex gap-6">
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  대시보드
                </Link>
                <Link
                  href="/admin/categories"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  카테고리 관리
                </Link>
                <Link
                  href="/admin/target-roles"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  대상 독자 관리
                </Link>
                <Link
                  href="/admin/questions"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  게시물 관리
                </Link>
                <Link
                  href="/admin/questions/new"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  새 게시물
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                사이트 보기
              </Link>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
