import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, Eye, MapPin, Building, AlertCircle } from "lucide-react";
import { getComplaints, updateComplaintStatus } from "../api";
import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import ExplainabilityModal from "../components/ExplainabilityModal";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const categories = [
    "Garbage / Waste",
    "Pothole / Road Damage",
    "Water Leakage / Sanitation",
    "Broken Streetlight",
    "Drainage / Flooding",
    "Pollution",
    "Fallen Tree / Vegetation",
    "Other Infrastructure"
  ];

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints({
        search: search || undefined,
        status: statusFilter,
        category: categoryFilter,
        severity: severityFilter,
        limit: 200
      });
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter, severityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Complaints Repository</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, audit, and manage civic complaints triaged by the AI Engine.
          </p>
        </div>
        <button
          onClick={loadComplaints}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, narrative, or location..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Narrative & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status & Human Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {c.ticket_id}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-slate-800 font-medium line-clamp-2">{c.text}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.location_text || "Unspecified"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {c.issue_category || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SeverityBadge level={c.severity_level || "MEDIUM"} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={c.status || "pending"}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="text-[11px] font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect XAI</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No complaints found matching current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainability Modal */}
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
