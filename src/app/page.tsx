"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TYPE_META, type DistillationType } from "@/lib/types";

const SUGGESTIONS: { text: string; type: DistillationType }[] = [
  { text: "Second Law of Thermodynamics", type: "concept" },
  { text: "Network Effects", type: "concept" },
  { text: "Compound Interest", type: "concept" },
  { text: "Opportunity Cost", type: "concept" },
  { text: "Nash Equilibrium", type: "concept" },
  { text: "Entropy", type: "concept" },
  { text: "Supply and Demand", type: "concept" },
  { text: "Cognitive Dissonance", type: "concept" },
  { text: "Pareto Principle", type: "concept" },
  { text: "Dunning-Kruger Effect", type: "concept" },
  { text: "Black-Scholes Formula", type: "formula" },
  { text: "E = mc²", type: "formula" },
  { text: "Bayes' Theorem", type: "formula" },
  { text: "Pythagorean Theorem", type: "formula" },
  { text: "Euler's Identity", type: "formula" },
  { text: "Schrödinger Equation", type: "formula" },
  { text: "Drake Equation", type: "formula" },
  { text: "Navier-Stokes Equations", type: "formula" },
  { text: "2008 Financial Crisis", type: "event" },
  { text: "Fall of the Berlin Wall", type: "event" },
  { text: "Moon Landing 1969", type: "event" },
  { text: "Dot-com Bubble", type: "event" },
  { text: "Chernobyl Disaster", type: "event" },
  { text: "Black Monday 1987", type: "event" },
  { text: "Bretton Woods Agreement", type: "event" },
  { text: "Rise and Fall of the Roman Empire", type: "history" },
  { text: "Industrial Revolution", type: "history" },
  { text: "Age of Enlightenment", type: "history" },
  { text: "Silk Road Trade", type: "history" },
  { text: "Renaissance", type: "history" },
  { text: "Cold War", type: "history" },
  { text: "Scientific Revolution", type: "history" },
  { text: "Stoicism", type: "philosophy" },
  { text: "Existentialism", type: "philosophy" },
  { text: "Utilitarianism", type: "philosophy" },
  { text: "Pragmatism", type: "philosophy" },
  { text: "Nihilism", type: "philosophy" },
  { text: "Empiricism", type: "philosophy" },
  { text: "Absurdism", type: "philosophy" },
  { text: "Effective Altruism", type: "philosophy" },
];

const EXAMPLES = SUGGESTIONS.slice(0, 5);

export default function Home() {
  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState<DistillationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = topic.trim().length > 0
    ? SUGGESTIONS.filter((s) =>
        s.text.toLowerCase().includes(topic.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      hintRef.current &&
      !hintRef.current.contains(e.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(e.target as Node)
    ) {
      setShowHints(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  async function handleDistill(e?: React.FormEvent) {
    e?.preventDefault();
    if (!topic.trim() || loading) return;

    setShowHints(false);
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

  function selectHint(s: { text: string; type: DistillationType }) {
    setTopic(s.text);
    setSelectedType(s.type);
    setShowHints(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showHints || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectHint(filtered[activeIdx]);
    } else if (e.key === "Escape") {
      setShowHints(false);
      setActiveIdx(-1);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.07] blur-[120px] glow-pulse" />
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pt-24 sm:pt-32">
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

        {/* Search with autocomplete */}
        <form onSubmit={handleDistill} className="mt-10 w-full">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setShowHints(true);
                setActiveIdx(-1);
              }}
              onFocus={() => setShowHints(true)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to distill?"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-4 pr-28 text-base text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              autoFocus
              autoComplete="off"
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

            {/* Autocomplete dropdown */}
            {showHints && filtered.length > 0 && (
              <div
                ref={hintRef}
                className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                {filtered.map((s, i) => {
                  const matchStart = s.text.toLowerCase().indexOf(topic.toLowerCase());
                  const before = s.text.slice(0, matchStart);
                  const match = s.text.slice(matchStart, matchStart + topic.length);
                  const after = s.text.slice(matchStart + topic.length);

                  return (
                    <button
                      key={s.text}
                      type="button"
                      onClick={() => selectHint(s)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === activeIdx
                          ? "bg-amber-500/10 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-xs">
                        {TYPE_META[s.type].icon}
                      </span>
                      <span>
                        {matchStart >= 0 ? (
                          <>
                            {before}
                            <span className="font-semibold text-amber-400">
                              {match}
                            </span>
                            {after}
                          </>
                        ) : (
                          s.text
                        )}
                      </span>
                      <span className="ml-auto text-xs text-zinc-600">
                        {TYPE_META[s.type].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
                key={ex.text}
                onClick={() => selectHint(ex)}
                className="rounded-lg border border-white/5 bg-zinc-900/30 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-amber-500/20 hover:text-white"
              >
                {TYPE_META[ex.type].icon} {ex.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-20 pb-8 text-center text-xs text-zinc-700">
          Powered by SerpAPI research + GPT-4o distillation
        </div>
      </div>
    </div>
  );
}
