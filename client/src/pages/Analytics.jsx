import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Layers, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { getAnalytics } from "../api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899", "#6366f1"];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Macro Trends & Intelligence</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Civic Analytics & Trend Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quantitative telemetry across categories, severity tiers, resolution rates, and temporal escalation patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Bar Chart */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Complaint Volume by Category</h3>
          <p className="text-xs text-slate-500 mb-6">Aggregated from citizen text and image triage</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categories || []} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="issue_category" type="category" tick={{ fontSize: 11, fill: "#64748b" }} width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val} reports`, "Count"]}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                  {(data?.categories || []).map((_, i) => (
                    <Cell key={`cat-${i}`} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Severity Tier Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Proportion of civic issues requiring urgent intervention</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severities || []}
                  dataKey="count"
                  nameKey="severity_level"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {(data?.severities || []).map((entry, idx) => {
                    const colors = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#3b82f6", LOW: "#10b981" };
                    return <Cell key={`pie-${idx}`} fill={colors[entry.severity_level] || "#94a3b8"} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Volume Trend */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Inflow & Resolution Cadence</h3>
        <p className="text-xs text-slate-500 mb-6">30-day temporal complaint submission trajectory</p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.daily_trends || []} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }} />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
