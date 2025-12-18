"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { ko } from "date-fns/locale";

interface NewsDatePickerProps {
  selectedDate?: string;
  availableDates: string[];
}

export function NewsDatePicker({
  selectedDate,
  availableDates,
}: NewsDatePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = selectedDate ? new Date(selectedDate) : undefined;

  // 뉴스가 있는 날짜들을 Date 객체로 변환
  const availableDateSet = new Set(availableDates);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      router.push(`/news?date=${dateStr}`);
    }
    setOpen(false);
  };

  const handleClear = () => {
    router.push("/news");
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  // 뉴스가 있는 날짜만 선택 가능하도록
  const isDateDisabled = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return !availableDateSet.has(dateStr);
  };

  if (!mounted) {
    return (
      <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        날짜를 선택하세요
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[280px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? formatDisplayDate(selectedDate) : "날짜를 선택하세요"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleSelect}
            disabled={isDateDisabled}
            locale={ko}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {selectedDate && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
