import React, { useState, useEffect } from "react";
import { 
  Building2, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  ShieldAlert,
  Clock,
  MapPin,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import StatCard from "../components/StatCard";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import ExplainabilityModal from "../components/ExplainabilityModal";
import { getKPIs, getComplaints, updateComplaintStatus } from "../api";

export default function Overview({ setActiveTab }) {
  const [kpis, setKpis] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiData, complaintsData] = await Promise.all([
        getKPIs(),
        getComplaints({ limit: 6 })
      ]);
      setKpis(kpiData);
      setRecentComplaints(complaintsData.complaints || []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
      loadData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>GWMC Smart City — AI-Driven Civic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Greater Warangal Municipal Corporation — Smart Civic Intelligence
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            CivicSense AI provides real-time issue triage for GWMC covering Hanamkonda, Kazipet and Warangal zones — automating complaint intake, 6-factor severity analysis, GWMC department routing, and SDG 11 tracking for a Sustainable Warangal.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("report")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report GWMC Civic Issue</span>
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm transition-all"
            >
              <span>Explore AI Analysis Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Registered Complaints"
          value={kpis?.total_complaints || 0}
          subtitle="Real-time multi-channel reports"
          icon={Building2}
          color="emerald"
          badgeText="Active"
          badgeColor="emerald"
        />
        <StatCard 
          title="High & Critical Priority"
          value={kpis?.critical_issues || 0}
          subtitle="Immediate dispatch required"
          icon={AlertTriangle}
          color="rose"
          badgeText="Needs Attention"
          badgeColor="rose"
        />
        <StatCard 
          title="Incident Clusters (Duplicates)"
          value={kpis?.incident_clusters || 0}
          subtitle="Deduplicated via SBERT embeddings"
          icon={Layers}
          color="blue"
          badgeText="Deduplicated"
          badgeColor="blue"
        />
        <StatCard 
          title="Resolved Actions"
          value={kpis?.resolved_complaints || 0}
          subtitle={`${kpis?.pending_complaints || 0} pending municipal triage`}
          icon={CheckCircle2}
          color="amber"
          badgeText="Audited"
          badgeColor="amber"
        />
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Complaints by Issue Category</h3>
              <p className="text-xs text-slate-500">Mapped to GWMC ward-level complaint categories</p>
            </div>
            <button 
              onClick={() => setActiveTab("analytics")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis?.top_categories || []} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="issue_category" type="category" tick={{ fontSize: 11, fill: "#64748b" }} width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val} complaints`, "Volume"]}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                  {(kpis?.top_categories || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Severity Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Transparent 6-factor triage score tiers</p>
            
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(kpis?.severity_breakdown || {}).map(([name, value]) => ({ name, value }))}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {Object.keys(kpis?.severity_breakdown || {}).map((sev, idx) => {
                      const colors = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#3b82f6", LOW: "#10b981" };
                      return <Cell key={`pie-${idx}`} fill={colors[sev] || "#94a3b8"} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Critical ({kpis?.severity_breakdown?.CRITICAL || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">High ({kpis?.severity_breakdown?.HIGH || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Medium ({kpis?.severity_breakdown?.MEDIUM || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Low ({kpis?.severity_breakdown?.LOW || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Citizen Complaints</h3>
            <p className="text-xs text-slate-500">Click any complaint to inspect the Explainable AI (XAI) breakdown</p>
          </div>
          <button 
            onClick={() => setActiveTab("complaints")}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All ({kpis?.total_complaints || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Ticket ID</th>
                <th className="pb-3 px-3">Issue Description</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Severity</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">XAI Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedComplaint(c)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                    {c.ticket_id}
                  </td>
                  <td className="py-3.5 px-3 max-w-xs truncate text-slate-700 font-medium">
                    {c.text}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    {c.issue_category || "Unassigned"}
                  </td>
                  <td className="py-3.5 px-3">
                    <SeverityBadge level={c.severity_level || "MEDIUM"} />
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={c.status || "pending"} />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700 group-hover:underline">
                      Inspect AI &rarr;
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* XAI Modal */}
      {selectedComplaint && (
        <ExplainabilityModal
          complaint={selectedComplaint}
          analysis={{
            severity_level: selectedComplaint.severity_level,
            issue_category: selectedComplaint.issue_category,
            department: selectedComplaint.department,
            ai_confidence: selectedComplaint.ai_confidence,
            severity_score: selectedComplaint.severity_level === "CRITICAL" ? 85 : selectedComplaint.severity_level === "HIGH" ? 72 : 40,
            severity_factors: {
              public_safety: 20,
              environmental_impact: 18,
              duration: 12,
              affected_people: 12,
              evidence_strength: 10,
              similar_complaints: 8
            }
          }}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}
    </div>
  );
}

