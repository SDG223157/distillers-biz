import type { DistillationType, SourceEntry } from "./types";

const SERPAPI_BASE = "https://serpapi.com/search.json";
const TAVILY_BASE = "https://api.tavily.com/search";

interface SerpResult {
  title: string;
  link: string;
  snippet: string;
}

const SEARCH_TEMPLATES: Record<DistillationType, (topic: string) => string[]> = {
  concept: (t) => [
    `${t} definition explained simply`,
    `${t} origin history who invented`,
    `${t} real world applications examples`,
    `${t} criticism limitations problems`,
    `${t} related concepts frameworks`,
    `${t} key principles fundamentals`,
    `${t} academic research overview`,
    `${t} common misconceptions myths`,
    `${t} expert analysis deep dive`,
    `${t} examples case studies`,
  ],
  formula: (t) => [
    `${t} formula derivation explained`,
    `${t} history who discovered origin`,
    `${t} intuition behind meaning`,
    `${t} assumptions limitations when fails`,
    `${t} applications real world examples`,
    `${t} variables parameters explained`,
    `${t} proof mathematical derivation`,
    `${t} common mistakes errors using`,
    `${t} alternative formulations generalizations`,
    `${t} numerical examples worked solutions`,
  ],
  event: (t) => [
    `${t} what happened complete timeline`,
    `${t} causes factors why`,
    `${t} key figures people involved`,
    `${t} consequences impact aftermath`,
    `${t} lessons learned analysis`,
    `${t} different perspectives interpretations`,
    `${t} eyewitness accounts primary sources`,
    `${t} long term effects legacy`,
    `${t} myths misconceptions debunked`,
    `${t} comparable events historical parallels`,
  ],
  history: (t) => [
    `${t} overview timeline major events`,
    `${t} key periods phases`,
    `${t} driving forces causes`,
    `${t} lasting impact legacy today`,
    `${t} important figures leaders`,
    `${t} revisionist perspectives different views`,
    `${t} primary sources documents`,
    `${t} economic social cultural impact`,
    `${t} turning points pivotal moments`,
    `${t} historiography how scholars interpret`,
  ],
  philosophy: (t) => [
    `${t} core principles tenets beliefs`,
    `${t} key thinkers philosophers founders`,
    `${t} practical applications daily life`,
    `${t} criticism objections counter arguments`,
    `${t} modern relevance today`,
    `${t} history origin evolution`,
    `${t} thought experiments examples`,
    `${t} relationship other philosophies comparison`,
    `${t} contemporary practitioners advocates`,
    `${t} books reading list best introductions`,
  ],
  person: (t) => [
    `${t} books writings core ideas philosophy`,
    `${t} interview podcast quotes thinking style`,
    `${t} decision making style principles`,
    `${t} criticism controversy mistakes failures`,
    `${t} biography career timeline major decisions`,
    `${t} mental models frameworks how they think`,
    `${t} leadership style management approach`,
    `${t} influences mentors intellectual heroes`,
    `${t} speeches talks most famous presentations`,
    `${t} personal habits routines daily practices`,
    `${t} key quotes best sayings wisdom`,
    `${t} legacy impact what changed because of them`,
  ],
};

async function serpSearch(query: string): Promise<SerpResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY not set");

  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    engine: "google",
    num: "10",
    hl: "en",
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);

  const data = await res.json();
  const results: SerpResult[] = [];

  if (data.knowledge_graph?.description) {
    results.push({
      title: data.knowledge_graph.title || query,
      link: data.knowledge_graph.source?.link || "",
      snippet: data.knowledge_graph.description,
    });
  }

  if (data.organic_results) {
    for (const r of data.organic_results) {
      if (r.title && r.link) {
        results.push({
          title: r.title,
          link: r.link,
          snippet: r.snippet || "",
        });
      }
    }
  }

  if (data.related_questions) {
    for (const rq of data.related_questions.slice(0, 3)) {
      if (rq.snippet) {
        results.push({
          title: rq.question || query,
          link: rq.link || "",
          snippet: rq.snippet,
        });
      }
    }
  }

  return results;
}

async function tavilySearch(query: string): Promise<SerpResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(TAVILY_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const results: SerpResult[] = [];

    if (data.answer) {
      results.push({
        title: `Tavily Summary: ${query}`,
        link: "",
        snippet: data.answer,
      });
    }

    if (data.results) {
      for (const r of data.results) {
        results.push({
          title: r.title || query,
          link: r.url || "",
          snippet: r.content || "",
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

export async function research(
  topic: string,
  type: DistillationType
): Promise<{ sources: SourceEntry[]; queries: string[]; researchText: string }> {
  const queryTemplates = SEARCH_TEMPLATES[type];
  const serpQueries = queryTemplates(topic);

  const tavilyQueries = [
    `${topic} comprehensive overview analysis`,
    `${topic} expert insights deep analysis`,
    `${topic} latest developments 2024 2025 2026`,
  ];

  const allResults: SerpResult[] = [];
  const seenUrls = new Set<string>();

  const [serpResults, tavilyResults] = await Promise.all([
    Promise.allSettled(serpQueries.map((q) => serpSearch(q))),
    Promise.allSettled(tavilyQueries.map((q) => tavilySearch(q))),
  ]);

  for (const result of serpResults) {
    if (result.status === "fulfilled") allResults.push(...result.value);
  }
  for (const result of tavilyResults) {
    if (result.status === "fulfilled") allResults.push(...result.value);
  }

  const allSources: SourceEntry[] = [];
  for (const r of allResults) {
    const url = r.link || `synthetic-${allSources.length}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      allSources.push({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      });
    }
  }

  const sourceCap = 50;
  const capped = allSources.slice(0, sourceCap);
  const queries = [...serpQueries, ...tavilyQueries];

  const researchText = capped
    .map(
      (s, i) =>
        `[Source ${i + 1}] ${s.title}\n${s.url ? `URL: ${s.url}\n` : ""}${s.snippet}\n`
    )
    .join("\n---\n");

  return {
    sources: capped,
    queries,
    researchText,
  };
}
