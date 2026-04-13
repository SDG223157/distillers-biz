import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const slug = searchParams.get("slug");

    if (slug) {
      const rows = await sql`
        SELECT * FROM distillations WHERE slug = ${slug}
      `;
      if (rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    }

    let rows;
    if (type && type !== "all") {
      rows = await sql`
        SELECT id, slug, title, type, subtitle, status, essence, created_at
        FROM distillations
        WHERE type = ${type}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    } else {
      rows = await sql`
        SELECT id, slug, title, type, subtitle, status, essence, created_at
        FROM distillations
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }

    return NextResponse.json(rows);
  } catch (e) {
    console.error("Distillations API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
