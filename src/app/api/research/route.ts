import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { migrate } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "migrate") {
      await migrate();
      return NextResponse.json({ success: true, message: "Migration complete" });
    }

    if (action === "health") {
      const sql = neon(process.env.DATABASE_URL!);
      const result = await sql`SELECT NOW() as time, COUNT(*) as count FROM distillations`;
      return NextResponse.json({
        healthy: true,
        time: result[0]?.time,
        distillation_count: result[0]?.count,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Research API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
