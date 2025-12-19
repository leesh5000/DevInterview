import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateSummary(
  question: string,
  answer: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `당신은 개발자 면접 전문가입니다. 질문과 답안을 분석하여 핵심 내용을 간결하게 요약합니다.

다음 개발자 면접 질문과 답안을 한 줄로 요약해주세요.
핵심 키워드와 개념을 포함하고, 간결하게 작성하세요.

질문: ${question}

답안: ${answer}

요약:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export async function generateNewsSummary(
  title: string,
  description: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `당신은 개발자를 위한 뉴스 큐레이터입니다.

다음 개발 뉴스를 아래 형식에 맞춰 한국어로 요약해주세요.

## 형식 (반드시 이 형식을 따라주세요)
**핵심 내용**: (기사의 핵심 내용을 1-2문장으로 설명)

**개발자 관점**: (이 소식이 개발자에게 왜 중요한지, 어떤 시사점이 있는지 1문장으로 설명)

## 뉴스 정보
제목: ${title}
내용: ${description || "(내용 없음)"}

## 요약 (위 형식대로 작성):`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

interface CourseForMatching {
  id: string;
  title: string;
  affiliateUrl: string;
  description?: string | null;
}

interface MatchedCourse {
  courseId: string;
  title: string;
  affiliateUrl: string;
  matchScore: number;
}

export async function matchRelatedCourses(
  newsTitle: string,
  newsSummary: string,
  courses: CourseForMatching[]
): Promise<MatchedCourse[]> {
  if (!process.env.GEMINI_API_KEY || courses.length === 0) {
    return [];
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const courseList = courses
    .map(
      (c, i) =>
        `${i + 1}. [${c.id}] ${c.title}${c.description ? ` - ${c.description}` : ""}`
    )
    .join("\n");

  const prompt = `당신은 개발 교육 전문가입니다. 뉴스 내용과 강의의 관련성을 정확하게 판단합니다.

다음 개발 뉴스와 관련된 강의를 추천해주세요.

뉴스 제목: ${newsTitle}
뉴스 요약: ${newsSummary}

사용 가능한 강의 목록:
${courseList}

위 강의 중에서 이 뉴스와 가장 관련 있는 강의를 최대 2개 선택하고, 관련도 점수(0.0-1.0)를 매겨주세요.
관련성이 0.5 미만이면 추천하지 마세요.

JSON 형식으로만 응답하세요:
{"courses": [{"courseId": "id값", "score": 0.8}, ...]}
관련 강의가 없으면 {"courses": []}을 반환하세요.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) return [];

    const parsed = JSON.parse(content);
    const recommendations = parsed.courses || [];

    return recommendations
      .filter((r: { courseId: string; score: number }) => r.score >= 0.5)
      .map((r: { courseId: string; score: number }) => {
        const course = courses.find((c) => c.id === r.courseId);
        if (!course) return null;
        return {
          courseId: course.id,
          title: course.title,
          affiliateUrl: course.affiliateUrl,
          matchScore: r.score,
        };
      })
      .filter((c: MatchedCourse | null): c is MatchedCourse => c !== null)
      .slice(0, 2);
  } catch (error) {
    console.error("Failed to match courses:", error);
    return [];
  }
}
