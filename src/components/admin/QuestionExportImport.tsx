"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Upload, FileJson, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/questions/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const data = await response.json();

      // JSON 파일 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `questions-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("내보내기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="w-4 h-4 mr-2" />
      {loading ? "내보내는 중..." : "JSON 내보내기"}
    </Button>
  );
}

export function ImportButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setError("JSON 데이터를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // JSON 파싱 검증
      const parsed = JSON.parse(jsonText);
      const questions = parsed.questions || parsed;

      if (!Array.isArray(questions)) {
        throw new Error("questions 배열이 필요합니다.");
      }

      const response = await fetch("/api/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.details
            ? result.details.join("\n")
            : result.error || "Import failed"
        );
      }

      alert(`${result.imported}개의 질문이 등록되었습니다.`);
      setOpen(false);
      setJsonText("");
      router.refresh();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("유효하지 않은 JSON 형식입니다.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("가져오기에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          JSON 가져오기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>JSON 데이터 가져오기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4 overflow-y-auto flex-1">
          {/* 일괄 등록 페이지 안내 */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  미리보기 및 카테고리 생성이 필요하신가요?
                </p>
                <p className="text-muted-foreground mt-1">
                  존재하지 않는 카테고리가 있거나, 등록 전 미리보기가 필요하시면{" "}
                  <Link
                    href="/admin/questions/bulk"
                    className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                    onClick={() => setOpen(false)}
                  >
                    <FileJson className="w-3 h-3 inline mr-1" />
                    일괄 등록 페이지
                  </Link>
                  를 이용해주세요.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>JSON 파일 업로드</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-secondary file:text-secondary-foreground
                hover:file:bg-secondary/80"
            />
          </div>

          <div className="space-y-2">
            <Label>또는 JSON 직접 입력</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
              placeholder={`{
  "questions": [
    {
      "categorySlug": "database",
      "questionTitle": "질문 제목",
      "questionBody": "질문 본문",
      "answerContent": "답변 내용",
      "targetRoles": ["백엔드 개발자"],
      "tags": ["태그1", "태그2"],
      "isPublished": true
    }
  ]
}`}
              rows={12}
              className="font-mono text-sm max-h-[40vh] overflow-y-auto resize-y"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleImport} disabled={loading || !jsonText.trim()}>
              {loading ? "가져오는 중..." : "가져오기"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
