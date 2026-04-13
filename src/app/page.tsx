"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TYPE_META, type DistillationType } from "@/lib/types";

const EXAMPLES: { topic: string; type: DistillationType }[] = [
  { topic: "Second Law of Thermodynamics", type: "concept" },
  { topic: "Black-Scholes Formula", type: "formula" },
  { topic: "2008 Financial Crisis", type: "event" },
  { topic: "Rise and Fall of the Roman Empire", type: "history" },
  { topic: "Stoicism", type: "philosophy" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState<DistillationType | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDistill(e?: React.FormEvent) {
    e?.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/distill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), type: selectedType }),
      });
      const data = await res.json();
      if (data.slug) {
        router.push(`/d/${data.slug}`);
      }
    } catch {
      setLoading(false);
    }
  }

  function handleExample(ex: { topic: string; type: DistillationType }) {
    setTopic(ex.topic);
    setSelectedType(ex.type);
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.07] blur-[120px] glow-pulse" />
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pt-24 sm:pt-32">
        {/* Hero */}
        <div className="mb-2 flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-amber-400">
            Knowledge Distillation Engine
          </span>
        </div>

        <h1 className="mt-6 text-center text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Distill{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Anything
          </span>{" "}
          Into Its Essence
        </h1>

        <p className="mt-4 max-w-lg text-center text-base text-zinc-400">
          Concepts, formulas, events, history, philosophy — enter any topic and
          get a structured knowledge artifact distilled from real research.
        </p>

        {/* Search */}
        <form onSubmit={handleDistill} className="mt-10 w-full">
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to distill?"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-4 pr-28 text-base text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              autoFocus
            />
            <button
              type="submit"
              disabled={!topic.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Working…
                </span>
              ) : (
                "Distill"
              )}
            </button>
          </div>
        </form>

        {/* Type pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {(Object.entries(TYPE_META) as [DistillationType, typeof TYPE_META.concept][]).map(
            ([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedType(selectedType === key ? null : key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  selectedType === key
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    : "border-white/5 bg-zinc-900/50 text-zinc-500 hover:border-white/10 hover:text-zinc-300"
                }`}
              >
                {meta.icon} {meta.label}
              </button>
            )
          )}
        </div>

        {/* Examples */}
        <div className="mt-12 w-full">
          <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Try an example
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.topic}
                onClick={() => handleExample(ex)}
                className="rounded-lg border border-white/5 bg-zinc-900/30 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-amber-500/20 hover:text-white"
              >
                {TYPE_META[ex.type].icon} {ex.topic}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pb-8 text-center text-xs text-zinc-700">
          Powered by SerpAPI research + GPT-4o distillation
        </div>
      </div>
    </div>
  );
}
