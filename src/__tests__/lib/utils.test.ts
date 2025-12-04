import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "text-lg");
    expect(result).toBe("px-2 py-1 text-lg");
  });

  it("should handle conflicting Tailwind classes", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should handle falsy conditional classes", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base-class", undefined, null, "another-class");
    expect(result).toBe("base-class another-class");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should merge complex Tailwind classes correctly", () => {
    const result = cn(
      "bg-white dark:bg-gray-900",
      "hover:bg-gray-100",
      "text-sm"
    );
    expect(result).toContain("bg-white");
    expect(result).toContain("dark:bg-gray-900");
    expect(result).toContain("hover:bg-gray-100");
    expect(result).toContain("text-sm");
  });

  it("should handle array of classes", () => {
    const result = cn(["px-2", "py-1"], "text-lg");
    expect(result).toBe("px-2 py-1 text-lg");
  });

  it("should handle object syntax", () => {
    const result = cn({
      "bg-blue-500": true,
      "text-white": true,
      "opacity-50": false,
    });
    expect(result).toBe("bg-blue-500 text-white");
  });
});
