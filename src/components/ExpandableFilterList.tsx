"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterItem {
  id: string;
  label: string;
  value: string;
  count: number;
}

interface ExpandableFilterListProps {
  items: FilterItem[];
  selectedValue?: string;
  totalCount: number;
  filterType: "category" | "role";
  currentCategorySlug?: string;
  currentRoleFilter?: string;
  initialVisibleCount?: number;
  loadMoreCount?: number;
}

export default function ExpandableFilterList({
  items,
  selectedValue,
  totalCount,
  filterType,
  currentCategorySlug,
  currentRoleFilter,
  initialVisibleCount = 5,
  loadMoreCount = 10,
}: ExpandableFilterListProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const buildFilterUrl = (newCategory?: string, newRole?: string) => {
    const params = new URLSearchParams();
    if (newCategory) params.set("category", newCategory);
    if (newRole) params.set("role", newRole);
    return `/questions${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const getUrl = (value?: string) => {
    if (filterType === "category") {
      return buildFilterUrl(value, currentRoleFilter);
    } else {
      return buildFilterUrl(currentCategorySlug, value);
    }
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const isExpanded = visibleCount > initialVisibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadMoreCount, items.length));
  };

  const handleCollapse = () => {
    setVisibleCount(initialVisibleCount);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* 전체 버튼 */}
      <Link href={getUrl(undefined)}>
        <Badge
          variant={!selectedValue ? "default" : "outline"}
          className="cursor-pointer"
        >
          전체 ({totalCount})
        </Badge>
      </Link>

      {visibleItems.map((item) => (
        <Link key={item.id} href={getUrl(item.value)}>
          <Badge
            variant={selectedValue === item.value ? "default" : "outline"}
            className="cursor-pointer"
          >
            {item.label} ({item.count})
          </Badge>
        </Link>
      ))}

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShowMore}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          더보기 ({items.length - visibleCount}개)
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      )}

      {isExpanded && !hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapse}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          접기
          <ChevronUp className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
