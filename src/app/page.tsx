"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TYPE_META, type DistillationType } from "@/lib/types";

const SUGGESTIONS: { text: string; type: DistillationType }[] = [
  // Concepts
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
  { text: "Game Theory", type: "concept" },
  { text: "Moral Hazard", type: "concept" },
  { text: "Survivorship Bias", type: "concept" },
  { text: "Tragedy of the Commons", type: "concept" },
  { text: "Creative Destruction", type: "concept" },
  { text: "Antifragility", type: "concept" },
  { text: "Comparative Advantage", type: "concept" },
  { text: "Prisoner's Dilemma", type: "concept" },
  { text: "Principal-Agent Problem", type: "concept" },
  { text: "Occam's Razor", type: "concept" },
  // Formulas
  { text: "Black-Scholes Formula", type: "formula" },
  { text: "E = mc²", type: "formula" },
  { text: "Bayes' Theorem", type: "formula" },
  { text: "Pythagorean Theorem", type: "formula" },
  { text: "Euler's Identity", type: "formula" },
  { text: "Schrödinger Equation", type: "formula" },
  { text: "Drake Equation", type: "formula" },
  { text: "Navier-Stokes Equations", type: "formula" },
  { text: "Shannon Entropy Formula", type: "formula" },
  { text: "Fourier Transform", type: "formula" },
  // Events
  { text: "2008 Financial Crisis", type: "event" },
  { text: "Fall of the Berlin Wall", type: "event" },
  { text: "Moon Landing 1969", type: "event" },
  { text: "Dot-com Bubble", type: "event" },
  { text: "Chernobyl Disaster", type: "event" },
  { text: "Black Monday 1987", type: "event" },
  { text: "Bretton Woods Agreement", type: "event" },
  { text: "French Revolution", type: "event" },
  { text: "Assassination of Julius Caesar", type: "event" },
  { text: "Hiroshima Atomic Bombing", type: "event" },
  // History
  { text: "Rise and Fall of the Roman Empire", type: "history" },
  { text: "Industrial Revolution", type: "history" },
  { text: "Age of Enlightenment", type: "history" },
  { text: "Silk Road Trade", type: "history" },
  { text: "Renaissance", type: "history" },
  { text: "Cold War", type: "history" },
  { text: "Scientific Revolution", type: "history" },
  { text: "Ancient Greek Civilization", type: "history" },
  { text: "History of the Internet", type: "history" },
  { text: "Age of Exploration", type: "history" },
  // Philosophy
  { text: "Stoicism", type: "philosophy" },
  { text: "Existentialism", type: "philosophy" },
  { text: "Utilitarianism", type: "philosophy" },
  { text: "Pragmatism", type: "philosophy" },
  { text: "Nihilism", type: "philosophy" },
  { text: "Empiricism", type: "philosophy" },
  { text: "Absurdism", type: "philosophy" },
  { text: "Effective Altruism", type: "philosophy" },
  { text: "Taoism", type: "philosophy" },
  { text: "Rationalism", type: "philosophy" },
  // Persons — large list for broad coverage
  { text: "Elon Musk", type: "person" },
  { text: "Steve Jobs", type: "person" },
  { text: "Charlie Munger", type: "person" },
  { text: "Warren Buffett", type: "person" },
  { text: "Richard Feynman", type: "person" },
  { text: "Nassim Taleb", type: "person" },
  { text: "Paul Graham", type: "person" },
  { text: "Naval Ravikant", type: "person" },
  { text: "Ray Dalio", type: "person" },
  { text: "Jeff Bezos", type: "person" },
  { text: "Sam Altman", type: "person" },
  { text: "Peter Thiel", type: "person" },
  { text: "Andrej Karpathy", type: "person" },
  { text: "Jensen Huang", type: "person" },
  { text: "Mark Twain", type: "person" },
  { text: "Albert Einstein", type: "person" },
  { text: "Leonardo da Vinci", type: "person" },
  { text: "Nikola Tesla", type: "person" },
  { text: "Isaac Newton", type: "person" },
  { text: "Charles Darwin", type: "person" },
  { text: "Marie Curie", type: "person" },
  { text: "Alan Turing", type: "person" },
  { text: "Ada Lovelace", type: "person" },
  { text: "Aristotle", type: "person" },
  { text: "Plato", type: "person" },
  { text: "Socrates", type: "person" },
  { text: "Confucius", type: "person" },
  { text: "Sun Tzu", type: "person" },
  { text: "Machiavelli", type: "person" },
  { text: "Napoleon Bonaparte", type: "person" },
  { text: "Alexander the Great", type: "person" },
  { text: "Julius Caesar", type: "person" },
  { text: "Mahatma Gandhi", type: "person" },
  { text: "Martin Luther King Jr.", type: "person" },
  { text: "Nelson Mandela", type: "person" },
  { text: "Winston Churchill", type: "person" },
  { text: "Abraham Lincoln", type: "person" },
  { text: "Benjamin Franklin", type: "person" },
  { text: "Thomas Jefferson", type: "person" },
  { text: "Theodore Roosevelt", type: "person" },
  { text: "Karl Marx", type: "person" },
  { text: "Adam Smith", type: "person" },
  { text: "John Maynard Keynes", type: "person" },
  { text: "Friedrich Hayek", type: "person" },
  { text: "Milton Friedman", type: "person" },
  { text: "Nietzsche", type: "person" },
  { text: "Immanuel Kant", type: "person" },
  { text: "Marcus Aurelius", type: "person" },
  { text: "Seneca", type: "person" },
  { text: "Epictetus", type: "person" },
  { text: "Shakespeare", type: "person" },
  { text: "Ernest Hemingway", type: "person" },
  { text: "George Orwell", type: "person" },
  { text: "Fyodor Dostoevsky", type: "person" },
  { text: "Leo Tolstoy", type: "person" },
  { text: "Carl Jung", type: "person" },
  { text: "Sigmund Freud", type: "person" },
  { text: "Bill Gates", type: "person" },
  { text: "Mark Zuckerberg", type: "person" },
  { text: "Satya Nadella", type: "person" },
  { text: "Tim Cook", type: "person" },
  { text: "Larry Page", type: "person" },
  { text: "Sergey Brin", type: "person" },
  { text: "Jack Ma", type: "person" },
  { text: "Ren Zhengfei", type: "person" },
  { text: "Zhang Yiming", type: "person" },
  { text: "Andy Grove", type: "person" },
  { text: "Reed Hastings", type: "person" },
  { text: "Bob Iger", type: "person" },
  { text: "Ilya Sutskever", type: "person" },
  { text: "Geoffrey Hinton", type: "person" },
  { text: "Yann LeCun", type: "person" },
  { text: "Demis Hassabis", type: "person" },
  { text: "Linus Torvalds", type: "person" },
  { text: "Donald Knuth", type: "person" },
  { text: "Claude Shannon", type: "person" },
  { text: "John von Neumann", type: "person" },
  { text: "MrBeast", type: "person" },
  { text: "Joe Rogan", type: "person" },
  { text: "Lex Fridman", type: "person" },
  { text: "Oprah Winfrey", type: "person" },
  { text: "Deng Xiaoping", type: "person" },
  { text: "Lee Kuan Yew", type: "person" },
  { text: "Genghis Khan", type: "person" },
  { text: "Cleopatra", type: "person" },
  { text: "Mozart", type: "person" },
  { text: "Beethoven", type: "person" },
  { text: "Picasso", type: "person" },
  { text: "Michelangelo", type: "person" },
  { text: "Galileo Galilei", type: "person" },
  { text: "Stephen Hawking", type: "person" },
  { text: "Carl Sagan", type: "person" },
  { text: "Nikola Tesla", type: "person" },
  { text: "George Soros", type: "person" },
  { text: "Carl Icahn", type: "person" },
  { text: "Benjamin Graham", type: "person" },
  { text: "Philip Fisher", type: "person" },
  { text: "Howard Marks", type: "person" },
  { text: "Aswath Damodaran", type: "person" },
  // Books
  { text: "Thinking, Fast and Slow", type: "book" },
  { text: "Sapiens by Yuval Noah Harari", type: "book" },
  { text: "Zero to One by Peter Thiel", type: "book" },
  { text: "The Intelligent Investor", type: "book" },
  { text: "Atomic Habits by James Clear", type: "book" },
  { text: "The Art of War by Sun Tzu", type: "book" },
  { text: "Poor Charlie's Almanack", type: "book" },
  { text: "The Black Swan by Nassim Taleb", type: "book" },
  { text: "Principles by Ray Dalio", type: "book" },
  { text: "The Wealth of Nations", type: "book" },
  { text: "Meditations by Marcus Aurelius", type: "book" },
  { text: "The Lean Startup", type: "book" },
  // Companies
  { text: "Apple", type: "company" },
  { text: "Tesla", type: "company" },
  { text: "NVIDIA", type: "company" },
  { text: "Berkshire Hathaway", type: "company" },
  { text: "Google (Alphabet)", type: "company" },
  { text: "Amazon", type: "company" },
  { text: "SpaceX", type: "company" },
  { text: "OpenAI", type: "company" },
  { text: "Netflix", type: "company" },
  { text: "Stripe", type: "company" },
  { text: "Alibaba", type: "company" },
  { text: "ByteDance", type: "company" },
  // Technologies
  { text: "Blockchain", type: "technology" },
  { text: "Quantum Computing", type: "technology" },
  { text: "CRISPR Gene Editing", type: "technology" },
  { text: "Large Language Models", type: "technology" },
  { text: "Nuclear Fusion", type: "technology" },
  { text: "Self-Driving Cars", type: "technology" },
  { text: "mRNA Vaccines", type: "technology" },
  { text: "Cloud Computing", type: "technology" },
  { text: "Brain-Computer Interfaces", type: "technology" },
  // Skills
  { text: "How to Learn Programming", type: "skill" },
  { text: "Public Speaking", type: "skill" },
  { text: "Negotiation", type: "skill" },
  { text: "Speed Reading", type: "skill" },
  { text: "Critical Thinking", type: "skill" },
  { text: "How to Write Well", type: "skill" },
  { text: "Investing for Beginners", type: "skill" },
  { text: "Meditation Practice", type: "skill" },
  // Debates
  { text: "Capitalism vs Socialism", type: "debate" },
  { text: "Nature vs Nurture", type: "debate" },
  { text: "Should AI Be Regulated?", type: "debate" },
  { text: "Universal Basic Income: For or Against", type: "debate" },
  { text: "Nuclear Energy: Pros and Cons", type: "debate" },
  { text: "Free Will vs Determinism", type: "debate" },
  { text: "Privacy vs Security", type: "debate" },
  { text: "Active vs Passive Investing", type: "debate" },
  // Questions
  { text: "Why do we dream?", type: "question" },
  { text: "What is consciousness?", type: "question" },
  { text: "What is the meaning of life?", type: "question" },
  { text: "Why does time move forward?", type: "question" },
  { text: "Are we alone in the universe?", type: "question" },
  { text: "What is intelligence?", type: "question" },
  { text: "Why do we age?", type: "question" },
  { text: "What is money really?", type: "question" },
  { text: "How does memory work?", type: "question" },
  { text: "Why is there something rather than nothing?", type: "question" },
  { text: "Can machines be creative?", type: "question" },
  { text: "What makes a good life?", type: "question" },
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

  const trimmed = topic.trim();
  const staticMatches = trimmed.length > 0
    ? SUGGESTIONS.filter((s) =>
        s.text.toLowerCase().includes(trimmed.toLowerCase())
      ).slice(0, 7)
    : [];

  const hasExactMatch = staticMatches.some(
    (s) => s.text.toLowerCase() === trimmed.toLowerCase()
  );

  const filtered = trimmed.length > 0 && !hasExactMatch
    ? [...staticMatches, { text: trimmed, type: "auto" as const }]
    : staticMatches;

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

  function selectHint(s: { text: string; type: string }) {
    setTopic(s.text);
    if (s.type !== "auto") {
      setSelectedType(s.type as DistillationType);
    }
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
      const item = filtered[activeIdx];
      if (item.type === "auto") {
        setShowHints(false);
        handleDistill();
      } else {
        selectHint(item);
      }
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
                  const isAuto = s.type === ("auto" as string);
                  const matchStart = s.text.toLowerCase().indexOf(trimmed.toLowerCase());
                  const before = matchStart >= 0 ? s.text.slice(0, matchStart) : "";
                  const match = matchStart >= 0 ? s.text.slice(matchStart, matchStart + trimmed.length) : "";
                  const after = matchStart >= 0 ? s.text.slice(matchStart + trimmed.length) : s.text;

                  if (isAuto) {
                    return (
                      <button
                        key="__auto__"
                        type="button"
                        onClick={() => {
                          setTopic(s.text);
                          setShowHints(false);
                          setActiveIdx(-1);
                          handleDistill();
                        }}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`flex w-full items-center gap-3 border-t border-white/5 px-4 py-2.5 text-left text-sm transition-colors ${
                          i === activeIdx
                            ? "bg-amber-500/10 text-white"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-xs text-amber-400">
                          ⚗️
                        </span>
                        <span>
                          Distill &ldquo;<span className="font-semibold text-white">{s.text}</span>&rdquo;
                        </span>
                        <span className="ml-auto text-xs text-amber-500">
                          Enter ↵
                        </span>
                      </button>
                    );
                  }

                  const meta = TYPE_META[s.type as DistillationType];

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
                        {meta.icon}
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
                        {meta.label}
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
