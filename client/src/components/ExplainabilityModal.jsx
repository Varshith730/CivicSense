import React from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle, HelpCircle, Building, Clock, MapPin, Users } from "lucide-react";
import SeverityBadge from "./SeverityBadge";

export default function ExplainabilityModal({ complaint, analysis, onClose, onUpdateStatus }) {
  if (!complaint) return null;

  const factors = analysis?.severity_factors || {};
  const maxWeights = {
    public_safety: 25,
    environmental_impact: 20,
    duration: 15,
    affected_people: 15,
    evidence_strength: 15,
    similar_complaints: 10,
  };

  const factorLabels = {
    public_safety: { label: "Public Safety Impact", icon: AlertTriangle },
    environmental_impact: { label: "Environmental / Ecological Risk", icon: ShieldCheck },
    duration: { label: "Duration & Persistence", icon: Clock },
    affected_people: { label: "Affected Population Density", icon: Users },
    evidence_strength: { label: "Evidence Quality (Text & CV)", icon: CheckCircle },
    similar_complaints: { label: "Nearby Duplicate Reports", icon: MapPin },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100/70 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Explainable AI (XAI) Triage Dossier</span>
                <SeverityBadge level={analysis?.severity_level || "MEDIUM"} />
              </div>
              <p className="text-xs text-slate-500">Ticket: {complaint.ticket_id} • Score: {analysis?.severity_score || 0}/100</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Complaint Text & Location */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Citizen Narrative</div>
            <p className="text-sm text-slate-800 font-medium italic">"{complaint.text}"</p>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {complaint.location_text || "Location not specified"}
              </span>
              <span>Category: <strong>{analysis?.issue_category || "Unassigned"}</strong></span>
            </div>
          </div>

          {/* Transparent 6-Factor Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Transparent 6-Factor Decision Matrix
              </h4>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                AI Confidence: {Math.round((analysis?.ai_confidence || 0.85) * 100)}%
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(maxWeights).map(([key, maxPts]) => {
                const score = factors[key] !== undefined ? factors[key] : Math.round(maxPts * 0.6);
                const pct = Math.min(100, Math.round((score / maxPts) * 100));
                const meta = factorLabels[key] || { label: key, icon: HelpCircle };
                const Icon = meta.icon;

                return (
                  <div key={key} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{meta.label}</span>
                      </div>
                      <span className="font-mono text-slate-600 font-bold">
                        {score} / {maxPts} pts ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          pct >= 75 ? "bg-rose-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Routing & Action Recommendation */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase mb-1">
                <Building className="w-4 h-4" />
                Recommended Department
              </div>
              <div className="text-sm font-bold text-emerald-950">
                {analysis?.department || "Public Works Department"}
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <div className="text-blue-800 font-bold text-xs uppercase mb-1">
                Recommended Municipal Action
              </div>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                {analysis?.action_recommendation || "Dispatch field inspection crew within 48 hours."}
              </p>
            </div>
          </div>

          {/* Human-In-The-Loop Status Override */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Human-in-the-loop Resolution Control
            </div>
            <div className="flex flex-wrap gap-2">
              {["pending", "in_review", "resolved", "closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(complaint.id, st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    complaint.status === st
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Mark as {st.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span>Responsible AI Certified • Decision Support Only</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-all"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
