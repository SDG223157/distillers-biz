import Link from "next/link";
import TypeBadge from "./TypeBadge";
import type { DistillationType, DistillationStatus } from "@/lib/types";

interface Props {
  slug: string;
  title: string;
  type: DistillationType;
  subtitle?: string | null;
  essence?: string | null;
  status: DistillationStatus;
  created_at: string;
}

export default function DistillCard({
  slug,
  title,
  type,
  subtitle,
  essence,
  status,
  created_at,
}: Props) {
  const isReady = status === "complete";
  const date = new Date(created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={isReady ? `/d/${slug}` : "#"}
      className={`group relative flex flex-col rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all ${
        isReady
          ? "hover:border-amber-500/30 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-amber-500/5"
          : "cursor-default opacity-70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <TypeBadge type={type} />
        {status !== "complete" && (
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            {status === "researching" && (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                Researching…
              </>
            )}
            {status === "distilling" && (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                Distilling…
              </>
            )}
            {status === "failed" && (
              <span className="text-red-400">Failed</span>
            )}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
        {title}
      </h3>

      {subtitle && (
        <p className="mb-2 text-sm text-zinc-400">{subtitle}</p>
      )}

      {essence && (
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-zinc-500">
          {essence}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-white/5 text-xs text-zinc-600">
        {date}
      </div>
    </Link>
  );
}
