import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export function getSql() {
  return getDb();
}

export async function migrate() {
  const db = getDb();
  await db`
    CREATE TABLE IF NOT EXISTS distillations (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('concept','formula','event','history','philosophy')),
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

  await db`
    CREATE INDEX IF NOT EXISTS idx_distillations_slug ON distillations(slug)
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_distillations_type ON distillations(type)
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_distillations_status ON distillations(status)
  `;
}
