import React, { useState } from "react";
import { FlaskConical, Play, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, Building, HelpCircle } from "lucide-react";
import { testAnalyze } from "../api";
import SeverityBadge from "../components/SeverityBadge";

export default function AnalysisLab() {
  const [text, setText] = useState("Garbage has been accumulating near the hostel for three days and nobody has collected it. There is a foul smell attracting stray animals.");
  const [locationText, setLocationText] = useState("Near Main Gate, Sector 12");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const samples = [
    { label: "Hanamkonda Garbage (4 Days)", text: "Garbage has been accumulating near Hanamkonda Rythu Bazar for four days and nobody has collected it. Waste bins are overflowing and the foul smell is affecting the entire market area.", loc: "Hanamkonda Rythu Bazar, Warangal" },
    { label: "NIT Gate Pothole (Accidents)", text: "Huge dangerous pothole near NIT Warangal Gate 2. Two motorcycles slipped yesterday evening. The pothole is almost a foot deep and completely unmarked creating serious accident risk.", loc: "NIT Warangal Gate 2, Kazipet Road" },
    { label: "Burst Pipeline MGM Road", text: "Mission Bhagiratha drinking water pipeline burst near MGM Hospital road junction. Clean drinking water gushing onto road since yesterday morning. Thousands of litres wasted.", loc: "MGM Hospital Road, Warangal" },
    { label: "Tree Down Balasamudram", text: "Large old tree has fallen across road near Balasamudram Lake due to storm. Completely blocking all traffic to Engineering College and branches are resting dangerously on electricity wires.", loc: "Balasamudram Lake Road, Warangal" },
    { label: "Dark Fort Road (Unsafe)", text: "Street lights on Fort Road near bus depot have been non-functional for 8 days. Road is completely dark at night. Incidents of theft and road accidents are increasing daily.", loc: "Fort Road, near Bus Depot, Warangal" },
    { label: "Kazipet Nala Flooding", text: "The nala near Kazipet Railway Junction is completely blocked with silt and plastic waste. Every monsoon rain floods the entire colony with knee-deep water. This has been happening for 3 years.", loc: "Kazipet Railway Junction Nala, Warangal" }
  ];

  const handleRunAnalysis = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("text", text);
      formData.append("location_text", locationText);
      if (imageFile) formData.append("image", imageFile);

      const res = await testAnalyze(formData);
      setAnalysis(res);
    } catch (err) {
      alert("Error analyzing text: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Interactive AI Sandbox</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Real-Time Model Triage Playground</h1>
        <p className="text-xs text-slate-500 mt-1">
          Test any complaint text or image evidence against our trained multi-class NLP model, regex entity extractor, and 6-factor severity scoring rubric without saving to the database.
        </p>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap gap-2">
        {samples.map((s, i) => (
          <button
            key={i}
            onClick={() => { setText(s.text); setLocationText(s.loc); }}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 rounded-xl shadow-sm transition-all"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Sandbox */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Input Data</h3>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Complaint Narrative
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Location Context
            </label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{loading ? "Running AI Inference..." : "Execute AI Multi-Stage Triage"}</span>
          </button>
        </div>

        {/* Right: Real-Time Inference Output */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Inference Dossier</h3>
            {analysis && <SeverityBadge level={analysis.severity?.level} />}
          </div>

          {analysis ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Category & Confidence */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">Classified Category</div>
                  <div className="text-base font-black text-slate-900">{analysis.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">NLP Confidence</div>
                  <div className="text-base font-mono font-black text-emerald-600">
                    {Math.round(analysis.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Extracted Entities */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Entity & Temporal Extraction
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Duration: </span>
                    <strong className="text-slate-800">{analysis.entities?.duration_text || "Unspecified"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration (Days): </span>
                    <strong className="text-slate-800">{analysis.entities?.duration_days || "—"}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Affected Group: </span>
                    <strong className="text-slate-800">{analysis.entities?.affected_desc || "General public"}</strong>
                  </div>
                </div>
              </div>

              {/* Severity Factors */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  6-Factor Severity Matrix (Score: {analysis.severity?.score}/100)
                </div>
                <div className="space-y-2">
                  {Object.entries(analysis.severity?.factors || {}).map(([k, val]) => (
                    <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 capitalize">{k.replace("_", " ")}</span>
                      <span className="font-mono font-bold text-slate-900">{val} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department & SDG */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Dept</span>
                  <span className="font-bold text-slate-900">{analysis.recommendation?.department}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary SDG</span>
                  <span className="font-bold text-emerald-600">{analysis.sdg?.primary} ({analysis.sdg?.primary_title})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FlaskConical className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">Click "Execute AI Multi-Stage Triage" to run live analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

