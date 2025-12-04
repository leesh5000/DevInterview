import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/questions/route";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    interviewQuestion: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const mockCategory = {
  id: "cat-1",
  name: "데이터베이스",
  slug: "database",
  description: null,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQuestion = {
  id: "q-1",
  categoryId: "cat-1",
  category: mockCategory,
  questionTitle: "인덱스란 무엇인가요?",
  questionBody: "인덱스의 정의와 사용 목적을 설명해주세요.",
  answerContent: "인덱스는 데이터베이스 검색 속도를 향상시키는 자료구조입니다.",
  targetRoles: ["백엔드 개발자"],
  tags: ["인덱스", "성능"],
  aiSummary: null,
  relatedCourses: [],
  viewCount: 0,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Questions API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/questions", () => {
    it("should return all questions", async () => {
      vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([
        mockQuestion,
      ]);

      const request = new NextRequest("http://localhost:3001/api/questions");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].questionTitle).toBe("인덱스란 무엇인가요?");
    });

    it("should filter by category slug", async () => {
      vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([
        mockQuestion,
      ]);

      const request = new NextRequest(
        "http://localhost:3001/api/questions?category=database"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.interviewQuestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: "database" },
          }),
        })
      );
    });

    it("should filter by published status", async () => {
      vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([
        mockQuestion,
      ]);

      const request = new NextRequest(
        "http://localhost:3001/api/questions?published=true"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.interviewQuestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublished: true,
          }),
        })
      );
    });

    it("should filter by both category and published status", async () => {
      vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([
        mockQuestion,
      ]);

      const request = new NextRequest(
        "http://localhost:3001/api/questions?category=database&published=true"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.interviewQuestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: { slug: "database" },
            isPublished: true,
          },
        })
      );
    });

    it("should return empty array when no questions exist", async () => {
      vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3001/api/questions");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe("POST /api/questions", () => {
    it("should return 401 when not authenticated", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false);

      const request = new NextRequest("http://localhost:3001/api/questions", {
        method: "POST",
        body: JSON.stringify({
          categoryId: "cat-1",
          questionTitle: "새 질문",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should create a new question when authenticated", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true);
      vi.mocked(prisma.interviewQuestion.create).mockResolvedValue(mockQuestion);

      const request = new NextRequest("http://localhost:3001/api/questions", {
        method: "POST",
        body: JSON.stringify({
          categoryId: "cat-1",
          questionTitle: "인덱스란 무엇인가요?",
          questionBody: "인덱스의 정의와 사용 목적을 설명해주세요.",
          answerContent:
            "인덱스는 데이터베이스 검색 속도를 향상시키는 자료구조입니다.",
          targetRoles: ["백엔드 개발자"],
          tags: ["인덱스", "성능"],
          isPublished: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.questionTitle).toBe("인덱스란 무엇인가요?");
    });

    it("should use default empty values for optional fields", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true);
      vi.mocked(prisma.interviewQuestion.create).mockResolvedValue(mockQuestion);

      const request = new NextRequest("http://localhost:3001/api/questions", {
        method: "POST",
        body: JSON.stringify({
          categoryId: "cat-1",
          questionTitle: "테스트 질문",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.interviewQuestion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            questionBody: "",
            answerContent: "",
            targetRoles: [],
            tags: [],
            relatedCourses: [],
            isPublished: false,
          }),
        })
      );
    });

    it("should return 500 on database error", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true);
      vi.mocked(prisma.interviewQuestion.create).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost:3001/api/questions", {
        method: "POST",
        body: JSON.stringify({
          categoryId: "cat-1",
          questionTitle: "테스트",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create question");
    });
  });
});
