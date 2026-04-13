import { TYPE_META, type DistillationType } from "@/lib/types";

const colorMap: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  sky: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  teal: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  lime: "bg-lime-500/15 text-lime-400 border-lime-500/20",
  rose: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

export default function TypeBadge({
  type,
  size = "sm",
}: {
  type: DistillationType;
  size?: "sm" | "lg";
}) {
  const meta = TYPE_META[type];
  const colors = colorMap[meta.color] || colorMap.amber;

  if (size === "lg") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${colors}`}
      >
        <span>{meta.icon}</span>
        {meta.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      <span className="text-[10px]">{meta.icon}</span>
      {meta.label}
    </span>
  );
}
