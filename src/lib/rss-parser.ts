export interface RssItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  guid?: string;
}

export interface RssFeed {
  title: string;
  description: string;
  items: RssItem[];
}

const RSS_FEED_URL = "https://news.hada.io/rss/news";

export async function fetchGeekNewsRss(): Promise<RssFeed> {
  const response = await fetch(RSS_FEED_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DevInterview/1.0)",
      Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml",
    },
    redirect: "follow",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }

  const xml = await response.text();

  // Atom 형식인지 RSS 형식인지 확인
  if (xml.includes("<feed") && xml.includes("<entry>")) {
    return parseAtomXml(xml);
  }
  return parseRssXml(xml);
}

// Atom 형식 파싱 (GeekNews가 사용하는 형식)
function parseAtomXml(xml: string): RssFeed {
  const getTagContent = (tag: string, text: string): string | undefined => {
    const match = text.match(
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
    );
    return match ? match[1].trim() : undefined;
  };

  const feedMatch = xml.match(/<feed[^>]*>([\s\S]*)<\/feed>/);
  if (!feedMatch) throw new Error("Invalid Atom: no feed found");

  const feedContent = feedMatch[1];
  const title = decodeHtmlEntities(getTagContent("title", feedContent)) || "GeekNews";
  const description = decodeHtmlEntities(getTagContent("subtitle", feedContent)) || "";

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const items: RssItem[] = [];
  let entryMatch;

  while ((entryMatch = entryRegex.exec(feedContent)) !== null) {
    const entryContent = entryMatch[1];

    // link 태그에서 href 속성 추출
    const linkMatch = entryContent.match(/<link[^>]*href=['"]([^'"]+)['"]/);
    const link = linkMatch ? linkMatch[1] : "";

    // content 태그에서 내용 추출 (CDATA 처리 포함)
    const contentMatch = entryContent.match(/<content[^>]*>([\s\S]*?)<\/content>/);
    const content = contentMatch ? decodeHtmlEntities(contentMatch[1]) : "";

    items.push({
      title: decodeHtmlEntities(getTagContent("title", entryContent) || ""),
      link,
      description: content,
      pubDate: getTagContent("published", entryContent) || getTagContent("updated", entryContent),
      guid: getTagContent("id", entryContent),
    });
  }

  return { title, description, items };
}

// RSS 형식 파싱 (fallback)
function parseRssXml(xml: string): RssFeed {
  const getTagContent = (tag: string, text: string): string | undefined => {
    const match = text.match(
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
    );
    return match ? match[1].trim() : undefined;
  };

  const channelMatch = xml.match(/<channel>([\s\S]*?)<\/channel>/);
  if (!channelMatch) throw new Error("Invalid RSS: no channel found");

  const channelContent = channelMatch[1];
  const title = getTagContent("title", channelContent) || "GeekNews";
  const description = getTagContent("description", channelContent) || "";

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items: RssItem[] = [];
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemContent = itemMatch[1];
    items.push({
      title: decodeHtmlEntities(getTagContent("title", itemContent) || ""),
      link: getTagContent("link", itemContent) || "",
      description: decodeHtmlEntities(getTagContent("description", itemContent)),
      pubDate: getTagContent("pubDate", itemContent),
      guid: getTagContent("guid", itemContent),
    });
  }

  return { title, description, items };
}

function decodeHtmlEntities(text?: string): string {
  if (!text) return "";
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "") // HTML 태그 제거
    .trim();
}
