"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

interface RelatedCourse {
  courseId: string;
  title: string;
  affiliateUrl: string;
  matchScore: number;
}

interface Course {
  id: string;
  title: string;
  affiliateUrl: string;
}

interface NewsFormData {
  id: string;
  title: string;
  originalUrl: string;
  description: string | null;
  aiSummary: string;
  relatedCourses: RelatedCourse[];
}

interface NewsFormProps {
  initialData: NewsFormData;
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: initialData.title,
    originalUrl: initialData.originalUrl,
    description: initialData.description || "",
    aiSummary: initialData.aiSummary,
    relatedCourses: initialData.relatedCourses,
  });

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/daily-news/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/news");
        router.refresh();
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const addCourse = (course: Course) => {
    if (formData.relatedCourses.some((c) => c.courseId === course.id)) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      relatedCourses: [
        ...prev.relatedCourses,
        {
          courseId: course.id,
          title: course.title,
          affiliateUrl: course.affiliateUrl,
          matchScore: 0.5,
        },
      ],
    }));
  };

  const removeCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedCourses: prev.relatedCourses.filter((c) => c.courseId !== courseId),
    }));
  };

  const availableCourses = courses.filter(
    (c) => !formData.relatedCourses.some((rc) => rc.courseId === c.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="originalUrl">원본 URL</Label>
            <Input
              id="originalUrl"
              type="url"
              value={formData.originalUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, originalUrl: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="description">원본 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.aiSummary}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, aiSummary: e.target.value }))
            }
            rows={4}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>관련 강의</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.relatedCourses.length > 0 && (
            <div className="space-y-2">
              {formData.relatedCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between p-2 bg-secondary rounded-md"
                >
                  <span className="text-sm">{course.title}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCourse(course.courseId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {availableCourses.length > 0 && (
            <div>
              <Label>강의 추가</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableCourses.slice(0, 10).map((course) => (
                  <Button
                    key={course.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCourse(course)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {course.title.length > 20
                      ? course.title.substring(0, 20) + "..."
                      : course.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "저장 중..." : "저장"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/news")}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
