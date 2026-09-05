import React from "react";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "emerald", badgeText, badgeColor = "emerald" }) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  const badgeColorMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-soft hover:shadow-md transition-all relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.emerald} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
        {badgeText && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColorMap[badgeColor] || badgeColorMap.emerald}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        <div className="text-xs font-semibold text-slate-500 mt-0.5">{title}</div>
        {subtitle && <p className="text-[11px] text-slate-400 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
