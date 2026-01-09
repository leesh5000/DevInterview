"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, ExternalLink, Trash2, Plus } from "lucide-react";

interface RssSource {
  id: string;
  key: string;
  name: string;
  url: string;
  sourceUrl: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RssSourceManager() {
  const [sources, setSources] = useState<RssSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RssSource | null>(null);

  // 새 소스 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newSource, setNewSource] = useState({
    name: "",
    url: "",
    sourceUrl: "",
  });

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rss-sources");
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error("Failed to fetch RSS sources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const toggleSource = async (id: string, currentEnabled: boolean) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/rss-sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
      });

      if (response.ok) {
        const updated = await response.json();
        setSources((prev) =>
          prev.map((s) => (s.id === id ? updated : s))
        );
      }
    } catch (error) {
      console.error("Failed to toggle RSS source:", error);
    } finally {
      setUpdating(null);
    }
  };

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name || !newSource.url || !newSource.sourceUrl) {
      return;
    }

    setAdding(true);
    try {
      // key 생성: 이름을 대문자 스네이크 케이스로 변환
      const key = newSource.name
        .toUpperCase()
        .replace(/[^A-Z0-9가-힣]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

      const response = await fetch("/api/rss-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          name: newSource.name,
          url: newSource.url,
          sourceUrl: newSource.sourceUrl,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setSources((prev) => [...prev, created]);
        setNewSource({ name: "", url: "", sourceUrl: "" });
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "소스 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to add RSS source:", error);
      alert("소스 추가에 실패했습니다.");
    } finally {
      setAdding(false);
    }
  };

  const deleteSource = async () => {
    if (!deleteTarget) return;

    setDeleting(deleteTarget.id);
    try {
      const response = await fetch(`/api/rss-sources/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const error = await response.json();
        alert(error.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete RSS source:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          활성화된 소스에서만 뉴스를 수집합니다. (소스별 최대 10개)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            소스 추가
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSources}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 새 소스 추가 폼 */}
      {showAddForm && (
        <form
          onSubmit={addSource}
          className="bg-card rounded-lg border border-border p-4 space-y-4"
        >
          <h4 className="font-medium">새 RSS 소스 추가</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">소스 이름</label>
              <Input
                placeholder="예: 컬리 기술 블로그"
                value={newSource.name}
                onChange={(e) =>
                  setNewSource({ ...newSource, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">RSS URL</label>
              <Input
                placeholder="예: https://example.com/feed.xml"
                value={newSource.url}
                onChange={(e) =>
                  setNewSource({ ...newSource, url: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">사이트 URL</label>
              <Input
                placeholder="예: https://example.com"
                value={newSource.sourceUrl}
                onChange={(e) =>
                  setNewSource({ ...newSource, sourceUrl: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewSource({ name: "", url: "", sourceUrl: "" });
              }}
            >
              취소
            </Button>
            <Button type="submit" size="sm" disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  추가 중...
                </>
              ) : (
                "추가"
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">활성화</TableHead>
              <TableHead>소스 이름</TableHead>
              <TableHead>피드 URL</TableHead>
              <TableHead>사이트</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>
                  <div className="flex items-center">
                    {updating === source.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Switch
                        checked={source.isEnabled}
                        onCheckedChange={() =>
                          toggleSource(source.id, source.isEnabled)
                        }
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{source.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                  {source.url}
                </TableCell>
                <TableCell>
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                  >
                    {new URL(source.sourceUrl).hostname}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(source)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sources.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>등록된 RSS 소스가 없습니다.</p>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSS 소스 삭제</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot; 소스를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={!!deleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={deleteSource}
              disabled={!!deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
