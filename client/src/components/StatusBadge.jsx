import React from "react";

export default function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    in_review: "bg-blue-50 text-blue-700 border-blue-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const labels = {
    pending: "Pending Triage",
    in_review: "In Review",
    resolved: "Resolved",
    closed: "Closed",
  };

  const normalized = (status || "pending").toLowerCase();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[normalized] || map.pending}`}>
      {labels[normalized] || normalized}
    </span>
  );
}
