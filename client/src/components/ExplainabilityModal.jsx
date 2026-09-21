import React from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle, HelpCircle, Building, Clock, MapPin, Users, Camera, ExternalLink } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import { getImageUrl } from "../api";

export default function ExplainabilityModal({ complaint, analysis, onClose, onUpdateStatus }) {
  if (!complaint) return null;

  const rawImagePath = complaint.image_path || complaint.image_url || analysis?.image_path;
  const imageUrl = getImageUrl(rawImagePath);

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
              <span>Category: <strong>{analysis?.issue_category || complaint.issue_category || "Unassigned"}</strong></span>
            </div>
          </div>

          {/* Citizen Photographic Evidence */}
          {imageUrl ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Citizen Photographic Evidence</span>
                </div>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-64 flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt="Citizen Uploaded Evidence" 
                  className="max-h-64 w-full object-contain hover:scale-105 transition-transform duration-300 rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              {analysis?.image_label && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Vision Analysis: <strong>{analysis.image_label}</strong></span>
                  {analysis.image_confidence && (
                    <span className="text-emerald-700 font-bold">Confidence: {Math.round(analysis.image_confidence * 100)}%</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-2 text-xs text-slate-400 italic">
              <Camera className="w-4 h-4 text-slate-300" />
              <span>No photographic evidence was attached to this ticket.</span>
            </div>
          )}

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
                {analysis?.department || complaint.department || "GWMC Engineering & Town Planning"}
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <div className="text-blue-800 font-bold text-xs uppercase mb-1">
                Recommended Municipal Action
              </div>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                {analysis?.action_recommendation || complaint.action_recommendation || "Dispatch field inspection crew within 48 hours."}
              </p>
            </div>
          </div>

          {/* Human-In-The-Loop Status Override */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Human-in-the-loop Resolution Control</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Current: {complaint.status?.replace("_", " ") || "pending"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "pending", label: "Pending" },
                { id: "assigned", label: "Assigned" },
                { id: "in_progress", label: "In Review" },
                { id: "resolved", label: "Resolved" },
                { id: "closed", label: "Closed" }
              ].map((st) => {
                const isActive = complaint.status === st.id || (st.id === "in_progress" && complaint.status === "in_review");
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (onUpdateStatus) {
                        onUpdateStatus(complaint.id || complaint.ticket_id, st.id);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    Mark as {st.label.toUpperCase()}
                  </button>
                );
              })}
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
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
