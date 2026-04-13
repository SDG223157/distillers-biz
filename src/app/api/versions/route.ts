import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, version, subtitle, essence, created_at
      FROM distillation_versions
      WHERE distillation_slug = ${slug}
      ORDER BY version DESC
    `;

    return NextResponse.json(rows);
  } catch (e) {
    console.error("Versions API error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
