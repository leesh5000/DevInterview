"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category, TargetRole } from "@/types";
import CategoryCombobox from "./CategoryCombobox";
import TargetRoleSelector from "./TargetRoleSelector";
import {
  Plus,
  X,
  Trash2,
  FileJson,
  CheckSquare,
  Square,
  AlertTriangle,
  FolderPlus,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  affiliateUrl: string;
  thumbnailUrl: string | null;
}

interface RelatedCourse {
  title: string;
  affiliateUrl: string;
  thumbnailUrl?: string;
}

interface JsonQuestion {
  categorySlug?: string;
  categoryId?: string;
  questionTitle: string;
  questionBody?: string;
  answerContent?: string;
  followUpQuestions?: string;
  targetRoles?: string[];
  tags?: string[];
  relatedCourses?: RelatedCourse[];
  isPublished?: boolean;
}

interface QuestionWithMapping {
  index: number;
  categorySlug: string;
  categoryId: string;
  questionTitle: string;
  questionBody: string;
  answerContent: string;
  followUpQuestions: string;
  targetRoles: string[];
  tags: string[];
  relatedCourses: RelatedCourse[];
  isSelected: boolean;
}

interface JsonBulkQuestionFormProps {
  categories: Category[];
  targetRoles: TargetRole[];
}

export default function JsonBulkQuestionForm({
  categories: initialCategories,
  targetRoles: initialTargetRoles,
}: JsonBulkQuestionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [targetRoles, setTargetRoles] = useState<TargetRole[]>(initialTargetRoles);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionWithMapping[]>([]);
  const [globalTargetRoles, setGlobalTargetRoles] = useState<string[]>([]);
  const [globalCategoryId, setGlobalCategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsonText, setJsonText] = useState("");

  // 카테고리 slug -> id 매핑
  const categorySlugToId = useCallback(
    (slug: string) => {
      const category = categories.find(
        (c) =>
          c.slug === slug ||
          c.name.toLowerCase().includes(slug.toLowerCase()) ||
          slug.toLowerCase().includes(c.name.toLowerCase())
      );
      return category?.id || "";
    },
    [categories]
  );

  // JSON 파싱 공통 함수
  const parseJsonQuestions = useCallback((text: string): boolean => {
    setParseError("");

    try {
      const parsed = JSON.parse(text);
      const questions: JsonQuestion[] = parsed.questions || parsed;

      if (!Array.isArray(questions)) {
        setParseError("questions 배열이 필요합니다.");
        return false;
      }

      if (questions.length === 0) {
        setParseError("등록할 질문이 없습니다.");
        return false;
      }

      // 질문 데이터 매핑
      const questionsWithMapping = questions.map((q, index) => {
        const categoryId = q.categoryId || categorySlugToId(q.categorySlug || "");

        return {
          index,
          categorySlug: q.categorySlug || "",
          categoryId,
          questionTitle: q.questionTitle || "",
          questionBody: q.questionBody || "",
          answerContent: q.answerContent || "",
          followUpQuestions: q.followUpQuestions || "",
          targetRoles: q.targetRoles || [...globalTargetRoles],
          tags: q.tags || [],
          relatedCourses: q.relatedCourses || [],
          isSelected: true,
        };
      });

      setParsedQuestions(questionsWithMapping);
      return true;
    } catch {
      setParseError("유효하지 않은 JSON 형식입니다.");
      return false;
    }
  }, [categorySlugToId, globalTargetRoles]);

  // JSON 파일 업로드 처리
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setJsonText("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseJsonQuestions(text);
    };
    reader.readAsText(file);
  };

  // JSON 텍스트 파싱 처리
  const handleParseJsonText = () => {
    if (!jsonText.trim()) {
      setParseError("JSON 텍스트를 입력해주세요.");
      return;
    }
    setFileName("");
    parseJsonQuestions(jsonText);
  };

  // 전체 대상 일괄 선택 토글
  const toggleGlobalTargetRole = (role: string) => {
    setGlobalTargetRoles((prev) => {
      const newRoles = prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role];

      // 파싱된 질문들의 대상도 업데이트
      setParsedQuestions((questions) =>
        questions.map((q) => ({
          ...q,
          targetRoles: newRoles,
        }))
      );

      return newRoles;
    });
  };

  // 전체 카테고리 일괄 선택
  const handleGlobalCategoryChange = (categoryId: string) => {
    setGlobalCategoryId(categoryId);

    // 파싱된 질문들의 카테고리도 업데이트
    setParsedQuestions((questions) =>
      questions.map((q) => ({
        ...q,
        categoryId,
      }))
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    const allSelected = parsedQuestions.every((q) => q.isSelected);
    setParsedQuestions((prev) =>
      prev.map((q) => ({ ...q, isSelected: !allSelected }))
    );
  };

  // 개별 선택 토글
  const toggleQuestionSelect = (index: number) => {
    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === index ? { ...q, isSelected: !q.isSelected } : q
      )
    );
  };

  // 개별 질문 카테고리 변경
  const updateQuestionCategory = (index: number, categoryId: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => (q.index === index ? { ...q, categoryId } : q))
    );
  };

  // 개별 질문 대상 토글
  const toggleQuestionTargetRole = (index: number, role: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === index
          ? {
              ...q,
              targetRoles: q.targetRoles.includes(role)
                ? q.targetRoles.filter((r) => r !== role)
                : [...q.targetRoles, role],
            }
          : q
      )
    );
  };

  // 태그 추가
  const addTag = (index: number, tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === index && !q.tags.includes(trimmedTag)
          ? { ...q, tags: [...q.tags, trimmedTag] }
          : q
      )
    );
  };

  // 태그 삭제
  const removeTag = (index: number, tag: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === index
          ? { ...q, tags: q.tags.filter((t) => t !== tag) }
          : q
      )
    );
  };

  // 태그 수정
  const updateTag = (index: number, oldTag: string, newTag: string) => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag || trimmedTag === oldTag) return;

    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === index
          ? {
              ...q,
              tags: q.tags.map((t) => (t === oldTag ? trimmedTag : t)),
            }
          : q
      )
    );
  };

  // 질문 제거
  const removeQuestion = (index: number) => {
    setParsedQuestions((prev) => prev.filter((q) => q.index !== index));
  };

  // 연관 강의 추가
  const addRelatedCourse = (index: number, course: RelatedCourse) => {
    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === index
          ? { ...q, relatedCourses: [...q.relatedCourses, course] }
          : q
      )
    );
  };

  // 연관 강의 삭제
  const removeRelatedCourse = (questionIndex: number, courseIndex: number) => {
    setParsedQuestions((prev) =>
      prev.map((q) =>
        q.index === questionIndex
          ? {
              ...q,
              relatedCourses: q.relatedCourses.filter(
                (_, i) => i !== courseIndex
              ),
            }
          : q
      )
    );
  };

  // 초기화
  const handleReset = () => {
    setParsedQuestions([]);
    setFileName("");
    setJsonText("");
    setParseError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 선택된 질문만 일괄 등록
  const handleSubmit = async () => {
    const selectedQuestions = parsedQuestions.filter((q) => q.isSelected);

    if (selectedQuestions.length === 0) {
      alert("등록할 질문을 선택해주세요.");
      return;
    }

    // 유효성 검사
    const invalidQuestions = selectedQuestions.filter((q) => !q.categoryId);
    if (invalidQuestions.length > 0) {
      alert(
        `카테고리가 선택되지 않은 질문이 ${invalidQuestions.length}개 있습니다.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: selectedQuestions.map((q) => ({
            categoryId: q.categoryId,
            questionTitle: q.questionTitle,
            questionBody: q.questionBody,
            answerContent: q.answerContent,
            followUpQuestions: q.followUpQuestions,
            tags: q.tags,
            targetRoles: q.targetRoles,
            relatedCourses: q.relatedCourses,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.created}개의 질문이 등록되었습니다.`);
        router.push("/admin/questions");
        router.refresh();
      } else {
        const error = await response.json();
        alert(`등록 실패: ${error.error}`);
      }
    } catch {
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = parsedQuestions.filter((q) => q.isSelected).length;
  const allSelected = parsedQuestions.length > 0 && parsedQuestions.every((q) => q.isSelected);

  // 존재하지 않는 카테고리 목록 추출
  const missingCategories = Array.from(
    new Set(
      parsedQuestions
        .filter((q) => q.categorySlug && !q.categoryId)
        .map((q) => q.categorySlug)
    )
  );

  // 카테고리 생성 함수
  const createCategory = async (slug: string) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: slug,
          slug: slug.toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        // 카테고리 목록 업데이트
        setCategories((prev) => [...prev, newCategory]);
        // 해당 카테고리를 사용하는 질문들의 categoryId 업데이트
        setParsedQuestions((prev) =>
          prev.map((q) =>
            q.categorySlug === slug ? { ...q, categoryId: newCategory.id } : q
          )
        );
        return true;
      } else {
        const error = await response.json();
        alert(`카테고리 생성 실패: ${error.error}`);
        return false;
      }
    } catch {
      alert("카테고리 생성 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 모든 누락된 카테고리 일괄 생성
  const createAllMissingCategories = async () => {
    for (const slug of missingCategories) {
      await createCategory(slug);
    }
  };

  return (
    <div className="space-y-6">
      {/* JSON 입력 영역 */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            JSON 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 파일 업로드 */}
          <div className="space-y-2">
            <Label>JSON 파일 업로드</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-secondary file:text-secondary-foreground
                  hover:file:bg-secondary/80"
              />
              {(fileName || jsonText) && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  초기화
                </Button>
              )}
            </div>
            {fileName && (
              <p className="text-sm text-muted-foreground">
                선택된 파일: {fileName}
              </p>
            )}
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* 텍스트 붙여넣기 */}
          <div className="space-y-2">
            <Label>JSON 텍스트 붙여넣기</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError("");
              }}
              placeholder={`{
  "questions": [
    {
      "categorySlug": "database",
      "questionTitle": "인덱스란 무엇인가요?",
      ...
    }
  ]
}`}
              rows={8}
              className="font-mono text-sm max-h-[40vh] overflow-y-auto resize-y"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleParseJsonText}
                disabled={!jsonText.trim()}
                size="sm"
              >
                파싱하기
              </Button>
            </div>
          </div>

          {parseError && <p className="text-sm text-red-500">{parseError}</p>}

          {/* JSON 형식 안내 */}
          <div className="bg-secondary/30 p-4 rounded-md">
            <p className="text-sm font-medium mb-2">JSON 형식 예시:</p>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "questions": [
    {
      "categorySlug": "database",
      "questionTitle": "인덱스란 무엇인가요?",
      "questionBody": "### 질문 의도\\n...",
      "answerContent": "## 핵심 답변\\n...",
      "followUpQuestions": "* B-Tree vs Hash 인덱스 차이?",
      "targetRoles": ["백엔드 개발자"],
      "tags": ["database", "index", "mysql"],
      "relatedCourses": [
        {
          "title": "MySQL 완벽 가이드",
          "affiliateUrl": "https://inf.run/xxxxx",
          "thumbnailUrl": "https://..."
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 파싱 결과가 있을 때만 표시 */}
      {parsedQuestions.length > 0 && (
        <>
          {/* 전체 일괄 설정 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">전체 일괄 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 전체 카테고리 일괄 선택 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">전체 카테고리 일괄 선택</Label>
                <div className="max-w-[300px]">
                  <CategoryCombobox
                    categories={categories}
                    value={globalCategoryId}
                    onChange={handleGlobalCategoryChange}
                    onCategoriesChange={setCategories}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  선택하면 모든 질문의 카테고리가 일괄 변경됩니다.
                </p>
              </div>

              {/* 전체 대상 일괄 선택 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">전체 대상 일괄 선택</Label>
                <TargetRoleSelector
                  targetRoles={targetRoles}
                  selectedRoles={globalTargetRoles}
                  onToggle={toggleGlobalTargetRole}
                  onTargetRolesChange={setTargetRoles}
                />
                <p className="text-xs text-muted-foreground">
                  여기서 선택한 대상은 모든 질문에 일괄 적용됩니다. 개별 질문에서 수정할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 존재하지 않는 카테고리 경고 */}
          {missingCategories.length > 0 && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  존재하지 않는 카테고리 ({missingCategories.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  다음 카테고리가 존재하지 않습니다. 생성하거나 다른 카테고리를 선택해주세요.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingCategories.map((slug) => (
                    <div
                      key={slug}
                      className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5"
                    >
                      <span className="text-sm font-medium">{slug}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        onClick={() => createCategory(slug)}
                      >
                        <FolderPlus className="w-3 h-3 mr-1" />
                        생성
                      </Button>
                    </div>
                  ))}
                </div>
                {missingCategories.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createAllMissingCategories}
                    className="mt-2"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    모든 카테고리 일괄 생성
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* 파싱 결과 미리보기 */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  미리보기 ({selectedCount}/{parsedQuestions.length}개 선택됨)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="gap-2"
                >
                  {allSelected ? (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      전체 해제
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      전체 선택
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsedQuestions.map((question) => (
                <JsonQuestionPreviewCard
                  key={question.index}
                  question={question}
                  categories={categories}
                  targetRoles={targetRoles}
                  onSelectToggle={toggleQuestionSelect}
                  onCategoryChange={updateQuestionCategory}
                  onTargetRoleToggle={toggleQuestionTargetRole}
                  onAddTag={addTag}
                  onRemoveTag={removeTag}
                  onUpdateTag={updateTag}
                  onAddCourse={addRelatedCourse}
                  onRemoveCourse={removeRelatedCourse}
                  onCategoriesChange={setCategories}
                  onTargetRolesChange={setTargetRoles}
                  onRemove={removeQuestion}
                  onCreateCategory={createCategory}
                />
              ))}
            </CardContent>
          </Card>

          {/* 등록 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCount === 0}
              size="lg"
            >
              {isSubmitting
                ? "등록 중..."
                : `${selectedCount}개 질문 등록`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// 질문 미리보기 카드 컴포넌트
function JsonQuestionPreviewCard({
  question,
  categories,
  targetRoles,
  onSelectToggle,
  onCategoryChange,
  onTargetRoleToggle,
  onAddTag,
  onRemoveTag,
  onUpdateTag,
  onAddCourse,
  onRemoveCourse,
  onCategoriesChange,
  onTargetRolesChange,
  onRemove,
  onCreateCategory,
}: {
  question: QuestionWithMapping;
  categories: Category[];
  targetRoles: TargetRole[];
  onSelectToggle: (index: number) => void;
  onCategoryChange: (index: number, categoryId: string) => void;
  onTargetRoleToggle: (index: number, role: string) => void;
  onAddTag: (index: number, tag: string) => void;
  onRemoveTag: (index: number, tag: string) => void;
  onUpdateTag: (index: number, oldTag: string, newTag: string) => void;
  onAddCourse: (index: number, course: RelatedCourse) => void;
  onRemoveCourse: (questionIndex: number, courseIndex: number) => void;
  onCategoriesChange: (categories: Category[]) => void;
  onTargetRolesChange: (targetRoles: TargetRole[]) => void;
  onRemove: (index: number) => void;
  onCreateCategory: (slug: string) => Promise<boolean>;
}) {
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");

  // 강의 검색 관련 상태
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);

  // 강의 목록 조회
  const fetchCourses = useCallback(async (searchTerm: string = "") => {
    setLoadingCourses(true);
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const response = await fetch(`/api/courses${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch {
      // 실패 시 빈 배열 유지
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    if (courseSearchOpen) {
      fetchCourses();
    }
  }, [courseSearchOpen, fetchCourses]);

  // 검색어 변경 시 조회
  useEffect(() => {
    if (courseSearchOpen) {
      const timer = setTimeout(() => {
        fetchCourses(courseSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [courseSearch, courseSearchOpen, fetchCourses]);

  // 기존 강의 선택
  const handleSelectCourse = (course: Course) => {
    onAddCourse(question.index, {
      title: course.title,
      affiliateUrl: course.affiliateUrl,
      ...(course.thumbnailUrl && { thumbnailUrl: course.thumbnailUrl }),
    });
    setCourseSearchOpen(false);
    setCourseSearch("");
  };

  return (
    <Card
      className={`border-border ${
        question.isSelected ? "bg-secondary/30" : "bg-secondary/10 opacity-60"
      }`}
    >
        <CardContent className="pt-4 space-y-3">
          {/* 질문 번호, 선택 체크박스, 삭제 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={question.isSelected}
                onCheckedChange={() => onSelectToggle(question.index)}
              />
              <span className="font-semibold text-base">#{question.index + 1}</span>
              {question.categorySlug && (
                <span className="text-sm text-muted-foreground">
                  (원본: {question.categorySlug})
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(question.index)}
              className="text-muted-foreground hover:text-red-500"
              title="이 질문 제거"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* 카테고리 선택 */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm text-muted-foreground whitespace-nowrap w-[60px]">
              카테고리:
            </Label>
            <div className="w-[200px]">
              <CategoryCombobox
                categories={categories}
                value={question.categoryId || ""}
                onChange={(value) => onCategoryChange(question.index, value)}
                onCategoriesChange={onCategoriesChange}
              />
            </div>
            {!question.categoryId && question.categorySlug && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-amber-600 border-amber-500/50 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                onClick={() => onCreateCategory(question.categorySlug)}
              >
                <FolderPlus className="w-3 h-3 mr-1" />
                &apos;{question.categorySlug}&apos; 생성
              </Button>
            )}
            {!question.categoryId && !question.categorySlug && (
              <span className="text-xs text-red-500 whitespace-nowrap">
                (선택 필요)
              </span>
            )}
          </div>

          {/* 개별 대상 선택 */}
          <div className="flex items-start gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap w-[60px] pt-0.5">
              대상:
            </Label>
            <TargetRoleSelector
              targetRoles={targetRoles}
              selectedRoles={question.targetRoles}
              onToggle={(role) => onTargetRoleToggle(question.index, role)}
              onTargetRolesChange={onTargetRolesChange}
            />
          </div>

          {/* 태그 */}
          <div className="flex items-start gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap w-[60px] pt-0.5">
              태그:
            </Label>
            <div className="flex flex-wrap gap-1 items-center">
              {question.tags.map((tag) => (
                editingTag === tag ? (
                  <Input
                    key={tag}
                    value={editingTagValue}
                    onChange={(e) => setEditingTagValue(e.target.value)}
                    className="h-6 w-24 text-xs px-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onUpdateTag(question.index, tag, editingTagValue);
                        setEditingTag(null);
                      } else if (e.key === "Escape") {
                        setEditingTag(null);
                      }
                    }}
                    onBlur={() => {
                      onUpdateTag(question.index, tag, editingTagValue);
                      setEditingTag(null);
                    }}
                  />
                ) : (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      setEditingTag(tag);
                      setEditingTagValue(tag);
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTag(question.index, tag);
                      }}
                      className="ml-0.5 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="태그 추가"
                  className="h-6 w-24 text-xs px-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddTag(question.index, newTag);
                      setNewTag("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    onAddTag(question.index, newTag);
                    setNewTag("");
                  }}
                  disabled={!newTag.trim()}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* 질문 제목 */}
          <div>
            <p className="font-medium">Q. {question.questionTitle}</p>
          </div>

          {/* 연관 강의 (썸네일 포함) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap w-[60px]">
                강의:
              </Label>
              <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    강의 추가
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="강의명으로 검색..."
                      value={courseSearch}
                      onValueChange={setCourseSearch}
                    />
                    <CommandList>
                      {loadingCourses ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          검색 중...
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>등록된 강의가 없습니다.</CommandEmpty>
                          <CommandGroup>
                            {courses.map((course) => (
                              <CommandItem
                                key={course.id}
                                value={course.title}
                                onSelect={() => handleSelectCourse(course)}
                                className="cursor-pointer"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm">{course.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {course.affiliateUrl}
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {question.relatedCourses.length > 0 ? (
              <div className="ml-[68px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.relatedCourses.map((course, courseIndex) => (
                  <div
                    key={courseIndex}
                    className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-md p-2"
                  >
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        width={60}
                        height={40}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-muted rounded flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                        없음
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={course.title}>
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {course.affiliateUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCourse(question.index, courseIndex)}
                      className="text-muted-foreground hover:text-red-500 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ml-[68px] text-xs text-muted-foreground">(없음)</p>
            )}
          </div>

          {/* 질문 본문 */}
          {question.questionBody && (
            <div className="bg-card rounded-md p-3 border border-border">
              <Label className="text-sm font-medium mb-2 block">
                질문 본문
              </Label>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                {question.questionBody}
              </pre>
            </div>
          )}

          {/* 모범 답안 */}
          {question.answerContent && (
            <div className="bg-card rounded-md p-3 border border-border">
              <Label className="text-sm font-medium mb-2 block">
                모범 답안
              </Label>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
                {question.answerContent}
              </pre>
            </div>
          )}

          {/* 꼬리 질문 */}
          {question.followUpQuestions && (
            <div className="bg-card rounded-md p-3 border border-border">
              <Label className="text-sm font-medium mb-2 block">
                꼬리 질문
              </Label>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
                {question.followUpQuestions}
              </pre>
            </div>
          )}
        </CardContent>
    </Card>
  );
}
