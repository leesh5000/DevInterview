"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarkdownEditor from "@/components/admin/MarkdownEditor";

interface SuggestionFormProps {
  questionId: string;
  originalData: {
    questionTitle: string;
    questionBody: string;
    answerContent: string;
  };
}

export default function SuggestionForm({
  questionId,
  originalData,
}: SuggestionFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    questionBody: originalData.questionBody,
    answerContent: originalData.answerContent,
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      setError("수정 사유는 필수입니다.");
      return;
    }

    // 원본과 동일한지 체크
    if (
      formData.questionBody === originalData.questionBody &&
      formData.answerContent === originalData.answerContent
    ) {
      setError("수정된 내용이 없습니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          questionBody: formData.questionBody,
          answerContent: formData.answerContent,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("수정 제안이 등록되었습니다. 검토 후 반영됩니다.");
        router.push(`/questions/${questionId}`);
      } else {
        setError(data.error || "제출에 실패했습니다.");
      }
    } catch {
      setError("제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 원본 제목 표시 (읽기 전용) */}
      <Card className="border-border bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">원본 질문 제목</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-foreground">{originalData.questionTitle}</p>
        </CardContent>
      </Card>

      {/* 질문 본문 (마크다운) */}
      <div className="space-y-2">
        <Label>질문 본문</Label>
        <MarkdownEditor
          value={formData.questionBody}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, questionBody: value }))
          }
          height={250}
          placeholder="질문의 의도, 평가 포인트 등을 마크다운으로 작성하세요..."
        />
      </div>

      {/* 답변 내용 (마크다운) */}
      <div className="space-y-2">
        <Label>답변 내용</Label>
        <MarkdownEditor
          value={formData.answerContent}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, answerContent: value }))
          }
          height={400}
          placeholder="모범 답안을 마크다운으로 작성하세요..."
        />
      </div>

      {/* 수정 사유 (필수) */}
      <div className="space-y-2">
        <Label>
          수정 사유 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={formData.reason}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reason: e.target.value }))
          }
          placeholder="어떤 부분이 개선되었는지, 왜 수정이 필요한지 설명해주세요."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "제출 중..." : "수정 제안 제출"}
        </Button>
      </div>
    </div>
  );
}
