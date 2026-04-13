"use client";

import { useEffect, useState } from "react";
import DistillCard from "@/components/DistillCard";
import { TYPE_META, type DistillationType } from "@/lib/types";

interface ListItem {
  id: number;
  slug: string;
  title: string;
  type: DistillationType;
  subtitle: string | null;
  essence: string | null;
  status: string;
  created_at: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = filter !== "all" ? `?type=${filter}` : "";
        const res = await fetch(`/api/distillations${params}`);
        if (res.ok) {
          setItems(await res.json());
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    load();
  }, [filter]);

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
          item.essence?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Browse all distilled knowledge artifacts
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search distillations..."
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterPill
          label="All"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {(Object.entries(TYPE_META) as [DistillationType, typeof TYPE_META.concept][]).map(
          ([key, meta]) => (
            <FilterPill
              key={key}
              label={`${meta.icon} ${meta.label}`}
              active={filter === key}
              onClick={() => setFilter(key)}
            />
          )
        )}
        {search && (
          <span className="flex items-center rounded-full border border-white/5 px-3 py-1 text-xs text-zinc-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl border border-white/5 bg-zinc-900/30 shimmer"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          {search ? (
            <>
              <p className="text-lg">No results for &ldquo;{search}&rdquo;</p>
              <p className="mt-1 text-sm">
                Try a different search or{" "}
                <a href="/" className="text-amber-400 underline">
                  distill it
                </a>
              </p>
            </>
          ) : (
            <>
              <p className="text-lg">No distillations yet</p>
              <p className="mt-1 text-sm">
                Go to the{" "}
                <a href="/" className="text-amber-400 underline">
                  home page
                </a>{" "}
                to create your first one.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <DistillCard
              key={item.id}
              slug={item.slug}
              title={item.title}
              type={item.type}
              subtitle={item.subtitle}
              essence={item.essence}
              status={item.status as "complete" | "researching" | "distilling" | "failed"}
              created_at={item.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        active
          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
          : "border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
