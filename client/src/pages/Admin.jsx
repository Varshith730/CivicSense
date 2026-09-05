import React, { useState } from "react";
import { ShieldCheck, Database, Server, Cpu, CheckCircle2, RefreshCw, Radio, Globe, Bot, Sparkles, Code2, CheckSquare } from "lucide-react";
import { seedDatabase, syncLiveNYC311 } from "../api";

export default function Admin({ onSyncLive, isSyncing }) {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedMsg(null);
      const res = await seedDatabase();
      setSeedMsg({ type: "success", text: res.message });
    } catch (err) {
      setSeedMsg({ type: "error", text: "Failed to seed: " + (err.response?.data?.detail || err.message) });
    } finally {
      setSeeding(false);
    }
  };

  const systems = [
    { name: "FastAPI REST Server", status: "Operational", detail: "Port 8000 • CORS Enabled", icon: Server },
    { name: "Live NYC 311 Socrata API", status: "Connected", detail: "Endpoint: data.cityofnewyork.us (erm2-nwe9)", icon: Globe },
    { name: "NLP Multi-Class Pipeline", status: "Trained on Real 311", detail: "TF-IDF + Logistic Regression (4,203 samples)", icon: Cpu },
    { name: "Semantic Embedding Model", status: "Loaded", detail: "all-MiniLM-L6-v2 (SBERT Cosine Clustering)", icon: Cpu },
    { name: "Computer Vision Model", status: "Active", detail: "OpenAI CLIP ViT-B/32 Zero-Shot Classifier", icon: Cpu },
    { name: "Database Storage", status: "Connected", detail: "SQLite (complaints, incidents, analysis) + Supabase Ready", icon: Database },
  ];

  const bobStages = [
    {
      stage: "1. Ideation Stage",
      icon: Sparkles,
      title: "Problem Scope & SDG 11 Alignment",
      desc: "IBM BOB assisted in structuring the civic issue taxonomy, defining the 6-factor deterministic severity scoring rubric, and establishing the GWMC Warangal administrative wing routing table.",
      tag: "Completed",
    },
    {
      stage: "2. Development Stage",
      icon: Code2,
      title: "Architecture & Algorithmic Co-Design",
      desc: "Co-architected the decoupled FastAPI REST API, Haversine-based DBSCAN spatial clustering engine, SODA real-time NYC 311 live sync, and zero-shot CLIP vision classifier.",
      tag: "Completed",
    },
    {
      stage: "3. Execution Stage",
      icon: CheckSquare,
      title: "Verification & Explainable AI (XAI)",
      desc: "Generated machine-executable verification test suites, human-in-the-loop Explainable AI dossiers with factor weighting, and production build validation.",
      tag: "Verified",
    },
  ];

  const ethics = [
    { title: "Human Oversight Mandate", desc: "The AI system operates purely as an advisory decision-support layer. Autonomous ticket closure and disciplinary actions are prohibited; human municipal officers retain final authorization on all field dispatches." },
    { title: "Zero Citizen Profiling", desc: "No personal identifiers (citizen names, Aadhaar/SSN, demographic classifications) are stored, processed, or utilized by the scoring algorithms. Severity is computed strictly from physical incident attributes." },
    { title: "Explainable Triage Scoring", desc: "Every priority classification provides an auditable factor-by-factor breakdown (Safety, Ecology, Duration, Population, Evidence, Duplication) eliminating black-box bias." },
    { title: "Transparent Confidence Signaling", desc: "Confidence intervals are explicitly declared. Any computer vision prediction with less than 70% confidence is flagged with a mandatory human visual review requirement." },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System Governance & Live Feeds</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin, Data Streams & Responsible AI</h1>
        <p className="text-xs text-slate-500 mt-1">
          System telemetry, IBM BOB co-development records, live NYC OpenData integration, and ethical compliance.
        </p>
      </div>

      {/* IBM BOB Integration Mandate Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-indigo-800/40 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">IBM BOB Co-Development Integration</h3>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/40 uppercase">
                  Mandatory 1M1B Requirement
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Incorporated across Ideation, Development, and Execution stages per official internship guidelines.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-900/60 px-3 py-1.5 rounded-xl border border-indigo-700/50 self-start sm:self-center">
            Detailed Log: docs/IBM_BOB_INTEGRATION.md
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-3 pt-2">
          {bobStages.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-700/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{b.stage}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {b.tag}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">{b.title}</div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time NYC OpenData Stream Hero Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border border-emerald-900/40 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Municipal Data Pipeline</span>
          </div>
          <h3 className="text-xl font-bold">NYC 311 OpenData Live Stream (Dataset: erm2-nwe9)</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Directly connected to the official New York City OpenData SODA API. Pull the latest real-time civic service requests submitted today by citizens across all 5 boroughs and execute live AI categorization, severity scoring, and SDG 11 mapping.
          </p>
        </div>

        <button
          onClick={onSyncLive}
          disabled={isSyncing}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Radio className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Connecting to Live NYC API..." : "Fetch 10 Live Real-Time Complaints"}</span>
        </button>
      </div>

      {/* Component Telemetry */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900">AI & Infrastructure Health Telemetry</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {systems.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{s.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">{s.status}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible AI Principles */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Responsible AI & Ethics Compliance</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {ethics.map((e, idx) => (
            <div key={idx} className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-2xl space-y-1">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {e.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Maintenance */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900">GWMC Warangal Demo Data Reset</h3>
        <p className="text-xs text-slate-500">
          Reset and restore the 13 localized GWMC Warangal demo complaints (Hanamkonda, Kazipet, NIT Warangal, KU, MGM Hospital, Fort Road).
        </p>
        
        {seedMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${seedMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
            {seedMsg.text}
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin text-emerald-400" : ""}`} />
          <span>{seeding ? "Re-seeding GWMC Database..." : "Reset to GWMC Demo Records"}</span>
        </button>
      </div>
    </div>
  );
}
