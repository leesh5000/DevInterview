"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

interface SuggestionActionsProps {
  suggestionId: string;
}

export default function SuggestionActions({ suggestionId }: SuggestionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminComment, setAdminComment] = useState("");

  const handleApprove = async () => {
    if (!confirm("이 수정 제안을 승인하시겠습니까? 원본 게시글이 수정됩니다.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/suggestions/${suggestionId}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        alert("승인되었습니다.");
        router.push("/admin/suggestions");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "승인에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/suggestions/${suggestionId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminComment: adminComment.trim() || null }),
      });

      if (response.ok) {
        alert("반려되었습니다.");
        setShowRejectDialog(false);
        router.push("/admin/suggestions");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "반려에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleApprove}
          disabled={loading}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          승인
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
          disabled={loading}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          반려
        </Button>
      </div>

      {/* 반려 다이얼로그 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수정 제안 반려</DialogTitle>
            <DialogDescription>
              반려 사유를 입력할 수 있습니다. (선택)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="반려 사유를 입력해주세요 (선택)"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? "처리 중..." : "반려 확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
