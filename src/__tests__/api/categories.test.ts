import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/categories/route";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
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

describe("Categories API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/categories", () => {
    it("should return all categories ordered by order field", async () => {
      const mockCategories = [
        {
          id: "1",
          name: "데이터베이스",
          slug: "database",
          description: "DB 관련 질문",
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "네트워크",
          slug: "network",
          description: "네트워크 관련 질문",
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("데이터베이스");
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { order: "asc" },
      });
    });

    it("should return empty array when no categories exist", async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe("POST /api/categories", () => {
    it("should return 401 when not authenticated", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(false);

      const request = new NextRequest("http://localhost:3001/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "새 카테고리",
          slug: "new-category",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should create a new category when authenticated", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true);

      const newCategory = {
        id: "3",
        name: "새 카테고리",
        slug: "new-category",
        description: "설명",
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.category.create).mockResolvedValue(newCategory);

      const request = new NextRequest("http://localhost:3001/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "새 카테고리",
          slug: "new-category",
          description: "설명",
          order: 3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("새 카테고리");
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "새 카테고리",
          slug: "new-category",
          description: "설명",
          order: 3,
        },
      });
    });

    it("should use default order 0 when not provided", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true);

      const newCategory = {
        id: "4",
        name: "테스트",
        slug: "test",
        description: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.category.create).mockResolvedValue(newCategory);

      const request = new NextRequest("http://localhost:3001/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "테스트",
          slug: "test",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          order: 0,
        }),
      });
    });

    it("should return 500 on database error", async () => {
      vi.mocked(isAuthenticated).mockResolvedValue(true);
      vi.mocked(prisma.category.create).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost:3001/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "테스트",
          slug: "test",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create category");
    });
  });
});
