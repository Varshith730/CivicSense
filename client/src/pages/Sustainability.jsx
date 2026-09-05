import React, { useState, useEffect } from "react";
import { Leaf, Globe, CheckCircle2, ShieldCheck, Droplets, Recycle, SunMedium, TreePine } from "lucide-react";
import { getSustainability } from "../api";

export default function Sustainability() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSustainability();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const sdgIcons = {
    "SDG 6": Droplets,
    "SDG 11": Globe,
    "SDG 12": Recycle,
    "SDG 13": SunMedium,
    "SDG 15": TreePine,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Leaf className="w-3.5 h-3.5" />
          <span>UN Sustainable Development Goals</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">SDG 11 Alignment & Environmental Impact</h1>
        <p className="text-xs text-slate-500 mt-1">
          Every citizen issue triaged by CivicSense AI is systematically attributed to primary and secondary UN SDGs with transparent rationale.
        </p>
      </div>

      {/* Primary SDG 11 Hero Banner */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-2">
            <span className="px-2.5 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Primary Project Focus
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              SDG 11: Sustainable Cities and Communities
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              Make cities and human settlements inclusive, safe, resilient and sustainable. CivicSense AI operationalizes Target 11.6 (reduce environmental impact of urban waste & air pollution) and Target 11.2 (safe accessible transport infrastructure).
            </p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shrink-0 font-black">
            11
          </div>
        </div>
      </div>

      {/* Secondary SDGs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.sdg_definitions && Object.entries(data.sdg_definitions).map(([code, info]) => {
          const Icon = sdgIcons[code] || Globe;
          return (
            <div key={code} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: info.color }}>
                  {code}
                </span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{info.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Grounded SDG indicator tracking for urban ecosystems</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category SDG Mapping Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Issue Category to SDG Mapping Matrix</h3>
        <p className="text-xs text-slate-500">Every category maintains a verified deterministic SDG linkage.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Civic Category</th>
                <th className="py-3 px-3">Primary SDG</th>
                <th className="py-3 px-3">Secondary SDGs</th>
                <th className="py-3 px-3">Official Sustainability Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.category_mapping && Object.entries(data.category_mapping).map(([cat, map]) => (
                <tr key={cat} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-bold text-slate-900">{cat}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold">
                      {map.primary}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {map.secondary?.length > 0 ? (
                      map.secondary.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded mr-1 font-bold">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-md">{map.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
