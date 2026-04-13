import { NextRequest } from "next/server";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";
import type { DistillationContent } from "@/lib/types";

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
    const { messages } = await req.json() as {
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

    const knowledgeBase = rows.map((r) => {
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
        summary += "Quote: \"" + c.quotes[0].text + "\" — " + c.quotes[0].attribution + "\n";
      }
      return summary;
    }).join("\n---\n");

    const personEntries = rows.filter((r) => r.type === "person");
    const personList = personEntries.map((r) => r.title).join(", ");

    const systemPrompt = `You are the Distillers AI — a polymath with access to a curated knowledge base of distilled topics. You can draw from ALL the distilled knowledge below to answer questions, make connections, and provide insights.

YOUR KNOWLEDGE BASE (${rows.length} distilled topics):
${knowledgeBase}

SPECIAL ABILITIES:
- Cross-reference between distillations — find unexpected connections
- When a user mentions a person who's been distilled (${personList || "none yet"}), you can channel their thinking style
- Synthesize insights across multiple topics
- Identify patterns that span different domains

RULES:
- Draw from the distilled knowledge explicitly — reference specific principles, models, quotes
- When connecting topics, explain the link clearly
- If asked about something NOT in your knowledge base, say so and offer to help distill it
- Be specific, not generic — use the actual distilled content
- You can simulate conversations BETWEEN distilled persons (e.g. "What would Munger say to Musk?")
- Format with markdown for readability`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
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
