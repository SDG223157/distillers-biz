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

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gallery</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse all distilled knowledge artifacts
        </p>
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
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <p className="text-lg">No distillations yet</p>
          <p className="mt-1 text-sm">
            Go to the{" "}
            <a href="/" className="text-amber-400 underline">
              home page
            </a>{" "}
            to create your first one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
