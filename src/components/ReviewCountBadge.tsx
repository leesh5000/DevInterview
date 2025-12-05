import { CheckCircle2 } from "lucide-react";

interface ReviewCountBadgeProps {
  count: number;
}

export default function ReviewCountBadge({ count }: ReviewCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <span>커뮤니티 검수 {count}회</span>
    </div>
  );
}
