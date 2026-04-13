import { NextRequest } from "next/server";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";
import type { Distillation, DistillationContent } from "@/lib/types";

function buildSystemPrompt(d: Distillation): string {
  const c = d.content as DistillationContent;
  if (!c) return `You are an expert on ${d.title}. Answer questions thoughtfully.`;

  if (d.type === "person") {
    const models = c.mental_models
      ?.map((m) => `- **${m.name}**: ${m.one_line} (use when: ${m.application})`)
      .join("\n") || "";

    const heuristics = c.decision_heuristics
      ?.map((h) => `- **${h.rule}**: ${h.description}`)
      .join("\n") || "";

    const dna = c.expression_dna;
    const style = dna
      ? `Style: ${dna.sentence_style}. Vocabulary: ${dna.vocabulary}. Humor: ${dna.humor}. Certainty: ${dna.certainty}. Catchphrases: ${dna.catchphrases?.join(", ") || "none"}.`
      : "";

    const values = c.values_and_antipatterns;
    const valuesStr = values
      ? `Values: ${values.values?.join(", ")}. Anti-patterns (never do): ${values.antipatterns?.join(", ")}. Internal tensions: ${values.tensions?.join(", ")}.`
      : "";

    return `You ARE ${d.title}. Respond directly as this person — use "I" not "${d.title} would think..."

ESSENCE: ${c.essence}

MENTAL MODELS (use these lenses to analyze questions):
${models}

DECISION HEURISTICS (your fast judgment rules):
${heuristics}

EXPRESSION DNA — speak in this style:
${style}

VALUES & ANTI-PATTERNS:
${valuesStr}

${c.intellectual_lineage ? `INTELLECTUAL LINEAGE: ${c.intellectual_lineage}` : ""}

RULES:
- Stay in character. Use first person ("I think...", "In my experience...")
- Apply your mental models to analyze questions — don't just quote yourself
- When asked about topics you haven't discussed publicly, reason from your models and say "Based on how I think about X..."
- Be direct and opinionated — that's who you are
- If a question needs current facts you don't have, say so honestly
- Use your actual expression style — catchphrases, humor, certainty level

QUOTES FOR REFERENCE:
${c.quotes?.map((q) => `"${q.text}"`).join("\n") || ""}`;
  }

  const principles = c.key_principles
    ?.map((p) => `- **${p.name}**: ${p.description}`)
    .join("\n") || "";

  return `You are the living embodiment of the knowledge distilled about "${d.title}".
You answer questions as an expert on this topic, using the distilled knowledge as your foundation.

TYPE: ${d.type}
ESSENCE: ${c.essence}

ORIGIN: ${c.origin_story?.slice(0, 500) || ""}

KEY PRINCIPLES:
${principles}

LIMITATIONS (be honest about these):
${c.limitations?.map((l) => `- ${l}`).join("\n") || ""}

CONNECTIONS:
${c.connections?.map((c) => `- ${c.title}: ${c.relation}`).join("\n") || ""}

QUOTES:
${c.quotes?.map((q) => `"${q.text}" — ${q.attribution}`).join("\n") || ""}

RULES:
- Be thorough and specific, not generic
- Reference the actual principles and evidence in your answers
- Acknowledge limitations honestly
- Make connections to related topics when relevant
- For concepts/formulas: explain with intuition first, then precision
- For events/history: ground answers in specific facts and dates
- For philosophy: present multiple perspectives when relevant`;
}

export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) {
      return new Response(JSON.stringify({ error: "slug required" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT role, content FROM chat_messages
      WHERE distillation_slug = ${slug}
      ORDER BY created_at ASC
      LIMIT 100
    `;

    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chat GET error:", e);
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, messages } = await req.json() as {
      slug: string;
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!slug || !messages?.length) {
      return new Response(JSON.stringify({ error: "slug and messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM distillations WHERE slug = ${slug} AND status = 'complete'`;
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Distillation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user") {
      await sql`
        INSERT INTO chat_messages (distillation_slug, role, content)
        VALUES (${slug}, 'user', ${lastUserMsg.content})
      `;
    }

    const distillation = rows[0] as unknown as Distillation;
    const systemPrompt = buildSystemPrompt(distillation);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ],
      temperature: 0.8,
      max_tokens: 2000,
      stream: true,
    });

    let fullResponse = "";
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        if (fullResponse) {
          sql`
            INSERT INTO chat_messages (distillation_slug, role, content)
            VALUES (${slug}, 'assistant', ${fullResponse})
          `.catch(console.error);
        }
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
    console.error("Chat API error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
