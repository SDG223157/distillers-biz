import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM chat_messages WHERE distillation_slug = ${slug}`;
    await sql`DELETE FROM distillation_versions WHERE distillation_slug = ${slug}`;
    const result = await sql`DELETE FROM distillations WHERE slug = ${slug} RETURNING title`;

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: result[0].title });
  } catch (e) {
    console.error("Delete API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
