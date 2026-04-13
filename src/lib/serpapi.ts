import type { DistillationType, SourceEntry } from "./types";

const SERPAPI_BASE = "https://serpapi.com/search.json";

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
  ],
  formula: (t) => [
    `${t} formula derivation explained`,
    `${t} history who discovered origin`,
    `${t} intuition behind meaning`,
    `${t} assumptions limitations when fails`,
    `${t} applications real world examples`,
    `${t} variables parameters explained`,
  ],
  event: (t) => [
    `${t} what happened complete timeline`,
    `${t} causes factors why`,
    `${t} key figures people involved`,
    `${t} consequences impact aftermath`,
    `${t} lessons learned analysis`,
    `${t} different perspectives interpretations`,
  ],
  history: (t) => [
    `${t} overview timeline major events`,
    `${t} key periods phases`,
    `${t} driving forces causes`,
    `${t} lasting impact legacy today`,
    `${t} important figures leaders`,
    `${t} revisionist perspectives different views`,
  ],
  philosophy: (t) => [
    `${t} core principles tenets beliefs`,
    `${t} key thinkers philosophers founders`,
    `${t} practical applications daily life`,
    `${t} criticism objections counter arguments`,
    `${t} modern relevance today`,
    `${t} history origin evolution`,
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
  ],
};

async function serpSearch(query: string): Promise<SerpResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY not set");

  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    engine: "google",
    num: "8",
    hl: "en",
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);

  const data = await res.json();
  const results: SerpResult[] = [];

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

  if (data.knowledge_graph?.description) {
    results.unshift({
      title: data.knowledge_graph.title || query,
      link: data.knowledge_graph.source?.link || "",
      snippet: data.knowledge_graph.description,
    });
  }

  return results;
}

export async function research(
  topic: string,
  type: DistillationType
): Promise<{ sources: SourceEntry[]; queries: string[]; researchText: string }> {
  const queryTemplates = SEARCH_TEMPLATES[type];
  const queries = queryTemplates(topic);

  const allResults: SerpResult[] = [];
  const allSources: SourceEntry[] = [];
  const seenUrls = new Set<string>();

  const batchResults = await Promise.allSettled(
    queries.map((q) => serpSearch(q))
  );

  for (const result of batchResults) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
    }
  }

  for (const r of allResults) {
    if (r.link && !seenUrls.has(r.link)) {
      seenUrls.add(r.link);
      allSources.push({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      });
    }
  }

  const researchText = allSources
    .slice(0, 30)
    .map(
      (s, i) =>
        `[Source ${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet}\n`
    )
    .join("\n---\n");

  return {
    sources: allSources.slice(0, 30),
    queries,
    researchText,
  };
}
