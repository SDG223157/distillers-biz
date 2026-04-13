"use client";

import { useEffect, useState, useCallback, use } from "react";
import DistillView from "@/components/DistillView";
import type { Distillation } from "@/lib/types";

export default function DistillationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<Distillation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/distillations?slug=${slug}`);
      if (!res.ok) {
        setError("Distillation not found");
        return;
      }
      const d = await res.json();
      setData(d);
      return d.status;
    } catch {
      setError("Failed to load");
      return null;
    }
  }, [slug]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      const status = await load();
      if (status === "researching" || status === "distilling") {
        timer = setTimeout(poll, 2000);
      }
    }

    poll();
    return () => clearTimeout(timer);
  }, [load]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-400">{error}</p>
          <a href="/" className="mt-3 inline-block text-sm text-amber-400 underline">
            Go home
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
      </div>
    );
  }

  if (data.status === "researching" || data.status === "distilling") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-800 border-t-amber-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg">
              {data.status === "researching" ? "🔍" : "⚗️"}
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-lg font-semibold text-white">{data.title}</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {data.status === "researching"
            ? "Gathering research from multiple sources…"
            : "Distilling knowledge into its essence…"}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          <span className="text-xs text-zinc-500">
            This usually takes 30-60 seconds
          </span>
        </div>
      </div>
    );
  }

  if (data.status === "failed") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <p className="text-lg text-red-400">Distillation failed</p>
        <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
          {data.error || "An unknown error occurred"}
        </p>
        <a href="/" className="mt-4 text-sm text-amber-400 underline">
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <DistillView data={data} />
    </div>
  );
}
