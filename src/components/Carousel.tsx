"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
  children: ReactNode;
  intervalMs?: number;
  initialDelayMs?: number;
}

export function Carousel({ children, intervalMs = 3000, initialDelayMs = 0 }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth;
    const nextScroll = Math.max(0, container.scrollLeft - scrollAmount);
    container.scrollTo({ left: nextScroll, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const nextScroll = Math.min(maxScroll, container.scrollLeft + scrollAmount);
    container.scrollTo({ left: nextScroll, behavior: "smooth" });
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, []);

  useEffect(() => {
    if (!scrollRef.current || isPaused) return;

    const container = scrollRef.current;
    // Don't auto-rotate if content fits in viewport
    if (container.scrollWidth <= container.clientWidth) return;

    let interval: NodeJS.Timeout;

    const startRotation = () => {
      interval = setInterval(() => {
        const scrollAmount = container.clientWidth;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const nextScroll = container.scrollLeft + scrollAmount;

        if (nextScroll >= maxScroll) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollTo({ left: nextScroll, behavior: "smooth" });
        }
      }, intervalMs);
    };

    const delayTimeout = setTimeout(startRotation, initialDelayMs);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(interval);
    };
  }, [intervalMs, initialDelayMs, isPaused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md h-8 w-8 md:h-10 md:w-10"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md h-8 w-8 md:h-10 md:w-10"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide -mx-4"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex gap-3 md:gap-4 px-4 pb-4 min-w-max justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
