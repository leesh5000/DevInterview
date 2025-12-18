"use client";

import { ExternalLink, BookOpen, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface RelatedCourse {
  courseId: string;
  title: string;
  affiliateUrl: string;
  matchScore: number;
}

interface DailyNewsItem {
  id: string;
  title: string;
  originalUrl: string;
  aiSummary: string;
  relatedCourses: RelatedCourse[];
  publishedAt: string;
}

interface DailyNewsCardProps {
  news: DailyNewsItem;
}

export function DailyNewsCard({ news }: DailyNewsCardProps) {
  const publishDate = new Date(news.publishedAt);
  const formattedDate = publishDate.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="w-full hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm md:text-base font-medium leading-tight">
            <a
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors inline-flex items-start gap-1"
            >
              {news.title}
              <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
            </a>
          </CardTitle>
          <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs md:text-sm leading-relaxed mb-3">
          {news.aiSummary}
        </CardDescription>

        {news.relatedCourses.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <BookOpen className="h-3 w-3" />
              관련 강의
            </p>
            <div className="flex flex-wrap gap-2">
              {news.relatedCourses.map((course) => (
                <a
                  key={course.courseId}
                  href={course.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {course.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
