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

      {/* Mental Models (Person type) */}
      {content.mental_models && content.mental_models.length > 0 && (
        <Section title="Mental Models">
          <p className="mb-4 text-xs text-zinc-500">
            The core lenses this person uses to see the world
          </p>
          <div className="space-y-4">
            {content.mental_models.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white">{m.name}</h4>
                  <span className="shrink-0 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                    Model {i + 1}
                  </span>
                </div>
                <p className="mb-2 text-sm text-zinc-300">{m.one_line}</p>
                {m.evidence?.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {m.evidence.map((e, j) => (
                      <div key={j} className="flex gap-2 text-xs text-zinc-500">
                        <span className="mt-0.5 shrink-0 text-cyan-500">▸</span>
                        {e}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">
                    Apply: {m.application}
                  </span>
                </div>
                {m.limitation && (
                  <div className="mt-1 text-xs text-red-400/70">
                    Limitation: {m.limitation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Decision Heuristics (Person type) */}
      {content.decision_heuristics && content.decision_heuristics.length > 0 && (
        <Section title="Decision Heuristics">
          <p className="mb-4 text-xs text-zinc-500">
            Fast judgment rules — how they decide
          </p>
          <div className="space-y-3">
            {content.decision_heuristics.map((h, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-zinc-900/50 p-4"
              >
                <div className="mb-1 text-sm font-semibold text-amber-400">
                  {i + 1}. {h.rule}
                </div>
                <p className="mb-1 text-sm text-zinc-300">{h.description}</p>
                {h.example && (
                  <p className="text-xs italic text-zinc-500">
                    Case: {h.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Expression DNA (Person type) */}
      {content.expression_dna && (
        <Section title="Expression DNA">
          <p className="mb-4 text-xs text-zinc-500">
            How they communicate — their verbal fingerprint
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Sentence Style", value: content.expression_dna.sentence_style },
              { label: "Vocabulary", value: content.expression_dna.vocabulary },
              { label: "Rhythm", value: content.expression_dna.rhythm },
              { label: "Humor", value: content.expression_dna.humor },
              { label: "Certainty", value: content.expression_dna.certainty },
            ]
              .filter((d) => d.value)
              .map((d, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/5 bg-zinc-900/50 p-3"
                >
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {d.label}
                  </div>
                  <p className="text-sm text-zinc-300">{d.value}</p>
                </div>
              ))}
          </div>
          {content.expression_dna.catchphrases?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {content.expression_dna.catchphrases.map((p, i) => (
                <span
                  key={i}
                  className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-400"
                >
                  &ldquo;{p}&rdquo;
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Values & Anti-patterns (Person type) */}
      {content.values_and_antipatterns && (
        <Section title="Values & Anti-Patterns">
          <div className="grid gap-4 sm:grid-cols-3">
            {content.values_and_antipatterns.values?.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Pursues
                </div>
                <ul className="space-y-1">
                  {content.values_and_antipatterns.values.map((v, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-400">
                      <span className="text-emerald-500">+</span> {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content.values_and_antipatterns.antipatterns?.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400">
                  Refuses
                </div>
                <ul className="space-y-1">
                  {content.values_and_antipatterns.antipatterns.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-400">
                      <span className="text-red-500">✕</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content.values_and_antipatterns.tensions?.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Tensions
                </div>
                <ul className="space-y-1">
                  {content.values_and_antipatterns.tensions.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-400">
                      <span className="text-amber-500">⚡</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Intellectual Lineage (Person type) */}
      {content.intellectual_lineage && (
        <Section title="Intellectual Lineage">
          <p className="text-sm leading-relaxed text-zinc-400">
            {content.intellectual_lineage}
          </p>
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
