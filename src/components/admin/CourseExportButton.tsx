"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Course {
  title: string;
  affiliateUrl: string;
  thumbnailUrl: string | null;
}

interface CourseExportButtonProps {
  courses: Course[];
}

export default function CourseExportButton({ courses }: CourseExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    try {
      // 요청한 형식으로 변환
      const exportData = courses.map((course) => ({
        title: course.title,
        affiliateUrl: course.affiliateUrl,
        ...(course.thumbnailUrl && { thumbnailUrl: course.thumbnailUrl }),
      }));

      // JSON 파일 다운로드
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `courses-export-${new Date().toISOString().split("T")[0]}.json`;
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
    <Button variant="outline" onClick={handleExport} disabled={loading || courses.length === 0}>
      <Download className="w-4 h-4 mr-2" />
      {loading ? "내보내는 중..." : "JSON 내보내기"}
    </Button>
  );
}
