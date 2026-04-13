import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { research } from "@/lib/serpapi";
import { distill, smartClassifyType, smartSlugify } from "@/lib/distiller";
import type { DistillationType } from "@/lib/types";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, type: requestedType, refresh } = body as {
      topic: string;
      type?: DistillationType;
      refresh?: boolean;
    };

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const [type, slug] = await Promise.all([
      requestedType ? Promise.resolve(requestedType) : smartClassifyType(topic),
      smartSlugify(topic),
    ]);
    const sql = getDb();

    const existing = await sql`
      SELECT id, slug, status, type FROM distillations WHERE slug = ${slug}
    `;

    if (existing.length > 0 && !refresh) {
      return NextResponse.json({
        slug: existing[0].slug,
        status: existing[0].status,
        message: "Already exists",
      });
    }

    if (existing.length > 0 && refresh) {
      await sql`
        UPDATE distillations
        SET status = 'researching', type = ${type}, updated_at = NOW()
        WHERE slug = ${slug}
      `;
      processDistillation(slug, topic.trim(), type).catch(console.error);
      return NextResponse.json({ slug, type, status: "researching", message: "Re-distilling" });
    }

    await sql`
      INSERT INTO distillations (slug, title, type, status)
      VALUES (${slug}, ${topic.trim()}, ${type}, 'researching')
    `;

    processDistillation(slug, topic.trim(), type).catch(console.error);

    return NextResponse.json({ slug, type, status: "researching" });
  } catch (e) {
    console.error("Distill API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function processDistillation(
  slug: string,
  topic: string,
  type: DistillationType
) {
  const sql = getDb();

  try {
    const { sources, queries, researchText } = await research(topic, type);

    await sql`
      UPDATE distillations
      SET status = 'distilling',
          sources = ${JSON.stringify(sources)},
          research_queries = ${JSON.stringify(queries)},
          updated_at = NOW()
      WHERE slug = ${slug}
    `;

    const { content, subtitle } = await distill(topic, type, researchText);

    await sql`
      UPDATE distillations
      SET status = 'complete',
          subtitle = ${subtitle},
          essence = ${content.essence},
          content = ${JSON.stringify(content)},
          updated_at = NOW()
      WHERE slug = ${slug}
    `;
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Unknown error";
    console.error(`Distillation failed for ${slug}:`, errMsg);
    await sql`
      UPDATE distillations
      SET status = 'failed',
          error = ${errMsg},
          updated_at = NOW()
      WHERE slug = ${slug}
    `.catch(console.error);
  }
}
