"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Users } from "lucide-react";
import { RelatedCourse } from "@/types";

interface CourseCardProps {
  course: RelatedCourse;
  questionId: string;
  initialClickCount?: number;
}

export default function CourseCard({ course, questionId, initialClickCount = 0 }: CourseCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    course.thumbnailUrl || null
  );
  const [isLoading, setIsLoading] = useState(!course.thumbnailUrl);
  const [clickCount, setClickCount] = useState(initialClickCount);

  useEffect(() => {
    // 썸네일 URL이 이미 있으면 OG 이미지를 가져오지 않음
    if (course.thumbnailUrl) {
      return;
    }

    const fetchOgImage = async () => {
      try {
        const response = await fetch(
          `/api/og-image?url=${encodeURIComponent(course.affiliateUrl)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.ogImage) {
            setThumbnailUrl(data.ogImage);
          }
        }
      } catch {
        // OG 이미지를 가져오지 못해도 에러 처리 없이 계속 진행
      } finally {
        setIsLoading(false);
      }
    };

    fetchOgImage();
  }, [course.affiliateUrl, course.thumbnailUrl]);

  const handleClick = async () => {
    // 클릭 수 증가 (비동기, 실패해도 링크 이동에 영향 없음)
    try {
      const response = await fetch("/api/course-clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          affiliateUrl: course.affiliateUrl,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setClickCount(data.clickCount);
      }
    } catch {
      // 클릭 추적 실패해도 무시
    }
  };

  return (
    <a
      href={course.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onClick={handleClick}
    >
      <div className="flex gap-4 p-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-green-400 dark:hover:border-green-600 transition-colors">
        {/* 썸네일 영역 */}
        <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 dark:bg-[#252525] rounded overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-[#333]" />
          ) : thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
            {course.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              자세히 보기
            </span>
            {clickCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {clickCount}명 클릭
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
