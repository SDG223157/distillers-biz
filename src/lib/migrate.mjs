import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS distillations (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('concept','formula','event','history','philosophy','person')),
      subtitle TEXT,
      status TEXT NOT NULL DEFAULT 'researching' CHECK (status IN ('researching','distilling','complete','failed')),
      essence TEXT,
      content JSONB,
      sources JSONB DEFAULT '[]'::jsonb,
      research_queries JSONB DEFAULT '[]'::jsonb,
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_distillations_slug ON distillations(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_distillations_type ON distillations(type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_distillations_status ON distillations(status)`;

  console.log("✅ Migration complete");
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
