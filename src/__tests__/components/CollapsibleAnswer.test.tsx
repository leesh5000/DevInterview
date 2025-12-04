import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CollapsibleAnswer from "@/components/CollapsibleAnswer";

// Mock MarkdownPreview component
vi.mock("@/components/MarkdownPreview", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}));

describe("CollapsibleAnswer", () => {
  const testContent = "# 테스트 답변\n\n이것은 테스트 답변입니다.";

  it("should render with collapsed state by default", () => {
    render(<CollapsibleAnswer content={testContent} />);

    expect(screen.getByText("모범 답안")).toBeInTheDocument();
    expect(screen.getByText("펼치기")).toBeInTheDocument();
    expect(screen.queryByTestId("markdown-preview")).not.toBeInTheDocument();
  });

  it("should expand when clicked", () => {
    render(<CollapsibleAnswer content={testContent} />);

    const header = screen.getByText("모범 답안").closest("div");
    fireEvent.click(header!.parentElement!);

    expect(screen.getByText("접기")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-preview").textContent).toContain(
      "테스트 답변"
    );
  });

  it("should collapse when clicked again", () => {
    render(<CollapsibleAnswer content={testContent} />);

    const clickableArea = screen.getByText("모범 답안").closest("div")!
      .parentElement!;

    // Expand
    fireEvent.click(clickableArea);
    expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();

    // Collapse
    fireEvent.click(clickableArea);
    expect(screen.queryByTestId("markdown-preview")).not.toBeInTheDocument();
    expect(screen.getByText("펼치기")).toBeInTheDocument();
  });

  it("should display chevron down icon when collapsed", () => {
    render(<CollapsibleAnswer content={testContent} />);

    // ChevronDown should be visible when collapsed
    expect(screen.getByText("펼치기")).toBeInTheDocument();
  });

  it("should display chevron up icon when expanded", () => {
    render(<CollapsibleAnswer content={testContent} />);

    const clickableArea = screen.getByText("모범 답안").closest("div")!
      .parentElement!;
    fireEvent.click(clickableArea);

    // ChevronUp should be visible when expanded
    expect(screen.getByText("접기")).toBeInTheDocument();
  });
});
