import React from "react";

export default function SeverityBadge({ level }) {
  const map = {
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
    HIGH: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20",
    MEDIUM: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
  };

  const dotMap = {
    CRITICAL: "bg-rose-500",
    HIGH: "bg-amber-500",
    MEDIUM: "bg-blue-500",
    LOW: "bg-emerald-500",
  };

  const normalized = (level || "MEDIUM").toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${map[normalized] || map.MEDIUM}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[normalized] || dotMap.MEDIUM}`}></span>
      <span>{normalized}</span>
    </span>
  );
}
