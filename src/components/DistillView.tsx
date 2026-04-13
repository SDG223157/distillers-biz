import TypeBadge from "./TypeBadge";
import type { Distillation } from "@/lib/types";

export default function DistillView({ data }: { data: Distillation }) {
  const content = data.content;
  if (!content) return null;

  return (
    <article className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="mb-10 border-b border-white/5 pb-8">
        <TypeBadge type={data.type} size="lg" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="mt-2 text-lg text-zinc-400">{data.subtitle}</p>
        )}
      </header>

      {/* Essence */}
      <section className="mb-10">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-500">
            Essence
          </h2>
          <p className="text-lg leading-relaxed text-zinc-200">
            {content.essence}
          </p>
        </div>
      </section>

      {/* Origin Story */}
      {content.origin_story && (
        <Section title="Origin Story">
          <div className="prose-custom whitespace-pre-line">
            {content.origin_story}
          </div>
        </Section>
      )}

      {/* Key Principles */}
      {content.key_principles?.length > 0 && (
        <Section title="Key Principles">
          <div className="space-y-4">
            {content.key_principles.map((p, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-zinc-900/50 p-4"
              >
                <h4 className="mb-1 font-semibold text-white">{p.name}</h4>
                <p className="mb-2 text-sm text-zinc-400">{p.description}</p>
                {p.example && (
                  <p className="text-sm text-zinc-500 italic">
                    Example: {p.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Timeline */}
      {content.timeline?.length > 0 && (
        <Section title="Timeline">
          <div className="relative space-y-0 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {content.timeline.map((t, i) => (
              <div key={i} className="relative pb-5">
                <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-amber-500 bg-zinc-950" />
                <div className="text-xs font-medium text-amber-500">
                  {t.date}
                </div>
                <div className="mt-0.5 text-sm font-medium text-white">
                  {t.event}
                </div>
                <div className="mt-0.5 text-sm text-zinc-500">
                  {t.significance}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Applications */}
      {content.applications?.length > 0 && (
        <Section title="Applications">
          <div className="grid gap-3 sm:grid-cols-2">
            {content.applications.map((a, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-zinc-900/50 p-4"
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {a.domain}
                </div>
                <p className="text-sm text-zinc-300">{a.description}</p>
                {a.example && (
                  <p className="mt-1 text-xs text-zinc-500 italic">
                    {a.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Limitations */}
      {content.limitations?.length > 0 && (
        <Section title="Limitations">
          <ul className="space-y-2">
            {content.limitations.map((l, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-zinc-400"
              >
                <span className="mt-0.5 shrink-0 text-red-400">⚠</span>
                {l}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Misconceptions */}
      {content.misconceptions?.length > 0 && (
        <Section title="Common Misconceptions">
          <ul className="space-y-2">
            {content.misconceptions.map((m, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-zinc-400"
              >
                <span className="mt-0.5 shrink-0 text-amber-400">✕</span>
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Key Figures */}
      {content.key_figures?.length > 0 && (
        <Section title="Key Figures">
          <div className="space-y-3">
            {content.key_figures.map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                  {f.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {f.name}
                    <span className="ml-2 text-xs text-zinc-500">
                      {f.role}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{f.contribution}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Connections */}
      {content.connections?.length > 0 && (
        <Section title="Connections">
          <div className="flex flex-wrap gap-2">
            {content.connections.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2"
              >
                <div className="text-sm font-medium text-white">
                  {c.title}
                </div>
                <div className="text-xs text-zinc-500">{c.relation}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Quotes */}
      {content.quotes?.length > 0 && (
        <Section title="Notable Quotes">
          <div className="space-y-4">
            {content.quotes.map((q, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-amber-500/50 pl-4"
              >
                <p className="text-sm italic text-zinc-300">
                  &ldquo;{q.text}&rdquo;
                </p>
                <footer className="mt-1 text-xs text-zinc-500">
                  — {q.attribution}
                </footer>
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Sources */}
      {data.sources?.length > 0 && (
        <Section title="Sources">
          <details className="group">
            <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300">
              {data.sources.length} sources referenced
            </summary>
            <div className="mt-3 space-y-2">
              {data.sources.slice(0, 15).map((s, i) => (
                <div key={i} className="text-xs text-zinc-600">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 underline decoration-zinc-700 hover:text-amber-400"
                  >
                    {s.title}
                  </a>
                </div>
              ))}
            </div>
          </details>
        </Section>
      )}
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
