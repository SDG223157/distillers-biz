"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TypeBadge from "@/components/TypeBadge";
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const suggestions = search.trim().length > 0
    ? items
        .filter((item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropRef.current && !dropRef.current.contains(e.target as Node) &&
      searchRef.current && !searchRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => (p + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => (p <= 0 ? suggestions.length - 1 : p - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const item = suggestions[activeIdx];
      if (item.status === "complete") router.push(`/d/${item.slug}`);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Browse all distilled knowledge artifacts
          </p>
        </div>

        {/* Search with suggestions */}
        <div className="relative w-full sm:w-80">
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
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
              setActiveIdx(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search distillations..."
            autoComplete="off"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 py-2 pl-9 pr-8 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setShowSuggestions(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={dropRef}
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              {suggestions.map((item, i) => {
                const q = search.toLowerCase();
                const titleLower = item.title.toLowerCase();
                const matchStart = titleLower.indexOf(q);
                const meta = TYPE_META[item.type];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.status === "complete") router.push(`/d/${item.slug}`);
                    }}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      i === activeIdx
                        ? "bg-amber-500/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs">
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm">
                        {matchStart >= 0 ? (
                          <>
                            {item.title.slice(0, matchStart)}
                            <span className="font-semibold text-amber-400">
                              {item.title.slice(matchStart, matchStart + search.length)}
                            </span>
                            {item.title.slice(matchStart + search.length)}
                          </>
                        ) : (
                          item.title
                        )}
                      </span>
                      {item.subtitle && (
                        <span className="ml-2 text-xs text-zinc-600">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-600">
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
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

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-white/5 bg-zinc-900/30 shimmer"
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
        <div className="overflow-hidden rounded-xl border border-white/5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 md:table-cell">Essence</th>
                <th className="px-4 py-3 text-right">Date</th>
                <th className="w-10 px-2 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => {
                const isReady = item.status === "complete";
                const meta = TYPE_META[item.type];
                const date = new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <tr
                    key={item.id}
                    className={`group transition-colors ${
                      isReady
                        ? "cursor-pointer hover:bg-amber-500/[0.03]"
                        : "opacity-60"
                    }`}
                    onClick={() => {
                      if (isReady) window.location.href = `/d/${item.slug}`;
                    }}
                  >
                    <td className="px-4 py-3">
                      <TypeBadge type={item.type} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-xs text-zinc-500">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden max-w-md px-4 py-3 md:table-cell">
                      <span className="line-clamp-1 text-xs text-zinc-500">
                        {item.essence || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== "complete" && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                        )}
                        <span className="text-xs text-zinc-600">{date}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!confirm(`Delete "${item.title}"?`)) return;
                          fetch("/api/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ slug: item.slug }),
                          }).then((r) => {
                            if (r.ok) setItems((prev) => prev.filter((x) => x.id !== item.id));
                          });
                        }}
                        className="rounded p-1 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
