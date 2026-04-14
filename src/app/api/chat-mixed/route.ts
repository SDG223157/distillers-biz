import { NextRequest } from "next/server";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";
import type { DistillationContent } from "@/lib/types";

const SERPAPI_BASE = "https://serpapi.com/search.json";

async function liveSearch(query: string): Promise<string> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return "";

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: "google",
      num: "5",
      hl: "en",
    });
    const res = await fetch(`${SERPAPI_BASE}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    const data = await res.json();

    const snippets: string[] = [];

    if (data.knowledge_graph?.description) {
      snippets.push(`[Knowledge Graph] ${data.knowledge_graph.title || ""}: ${data.knowledge_graph.description}`);
    }
    if (data.answer_box?.answer) {
      snippets.push(`[Answer Box] ${data.answer_box.answer}`);
    }
    if (data.answer_box?.snippet) {
      snippets.push(`[Answer Box] ${data.answer_box.snippet}`);
    }
    for (const r of (data.organic_results || []).slice(0, 5)) {
      if (r.snippet) snippets.push(`[${r.title}] ${r.snippet}`);
    }

    return snippets.join("\n");
  } catch {
    return "";
  }
}

async function needsLiveData(
  question: string,
  openai: OpenAI
): Promise<string | null> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Does this question need real-time/current data to answer well? (stock prices, valuations, latest news, current events, recent earnings, today's market)

Question: "${question}"

If YES: reply with a concise Google search query to find the data (just the query, nothing else).
If NO: reply with exactly "NO".`,
        },
      ],
      max_tokens: 50,
      temperature: 0,
    });
    const answer = res.choices[0]?.message?.content?.trim() || "NO";
    return answer === "NO" ? null : answer;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT slug, title, type, subtitle, essence
      FROM distillations WHERE status = 'complete'
      ORDER BY created_at DESC
    `;
    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT slug, title, type, essence, content
      FROM distillations WHERE status = 'complete'
      ORDER BY created_at DESC
      LIMIT 50
    `;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "No distillations yet" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const [searchQuery, knowledgeBase] = await Promise.all([
      needsLiveData(lastUserMsg, openai),
      Promise.resolve(
        rows
          .map((r) => {
            const c = r.content as DistillationContent | null;
            let summary = `## ${r.title} [${r.type}]\n${r.essence || ""}\n`;
            if (c?.key_principles?.length) {
              summary += "Key principles: " + c.key_principles.map((p: { name: string }) => p.name).join(", ") + "\n";
            }
            if (c?.mental_models?.length) {
              summary += "Mental models: " + c.mental_models.map((m: { name: string; one_line: string }) => `${m.name} (${m.one_line})`).join("; ") + "\n";
            }
            if (c?.limitations?.length) {
              summary += "Limitations: " + c.limitations.slice(0, 3).join("; ") + "\n";
            }
            if (c?.quotes?.length) {
              summary += 'Quote: "' + c.quotes[0].text + '" — ' + c.quotes[0].attribution + "\n";
            }
            return summary;
          })
          .join("\n---\n")
      ),
    ]);

    let liveDataSection = "";
    if (searchQuery) {
      const searchResults = await liveSearch(searchQuery);
      if (searchResults) {
        liveDataSection = `\n\n=== LIVE DATA (searched: "${searchQuery}") ===\n${searchResults}\n=== END LIVE DATA ===\n\nUse this live data to ground your answer with current facts and numbers. Cite specific data points.`;
      }
    }

    const personEntries = rows.filter((r) => r.type === "person");
    const personList = personEntries.map((r) => r.title).join(", ");

    const systemPrompt = `You are the Distillers AI — a polymath with access to a curated knowledge base of distilled topics AND real-time search capability.

YOUR KNOWLEDGE BASE (${rows.length} distilled topics):
${knowledgeBase}${liveDataSection}

SPECIAL ABILITIES:
- Cross-reference between distillations — find unexpected connections
- When a user mentions a person who's been distilled (${personList || "none yet"}), you can channel their thinking style
- Synthesize insights across multiple topics
- Access LIVE DATA when questions need current information (prices, valuations, news)
- Identify patterns that span different domains

RULES:
- Draw from the distilled knowledge explicitly — reference specific principles, models, quotes
- When live data is provided, USE IT — cite specific numbers, dates, facts
- When connecting topics, explain the link clearly
- If asked about something NOT in your knowledge base and no live data available, say so
- Be specific, not generic — use the actual distilled content + live data
- You can simulate conversations BETWEEN distilled persons
- Format with markdown for readability
- When presenting market data, always note the data is from the search and may have a slight delay`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-12),
      ],
      temperature: 0.8,
      max_tokens: 2000,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Mixed chat error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
