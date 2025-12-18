import { Newspaper } from "lucide-react";
import { DailyNewsCard } from "./DailyNewsCard";

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

interface DailyNewsSectionProps {
  news: DailyNewsItem[];
}

export function DailyNewsSection({ news }: DailyNewsSectionProps) {
  if (news.length === 0) return null;

  return (
    <section className="py-6 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6 flex items-center justify-center gap-2">
          <Newspaper className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
          오늘의 개발 소식
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {news.map((item) => (
            <DailyNewsCard key={item.id} news={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
