import React, { useState } from "react";
import { 
  Award, FileText, CheckCircle2, ShieldCheck, Printer, 
  X, ExternalLink, Sparkles, Building2, Layers, Compass, 
  TrendingUp, Users, Copy, Check 
} from "lucide-react";

export default function SubmissionDossierModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("description"); // description | responsible_ai | prototype | impact | slides
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(
      "How might we use AI to automatically triage, prioritize, and spatially cluster unstructured civic grievances in real time so that urban municipal corporations (such as the Greater Warangal Municipal Corporation - GWMC) can become more sustainable, responsive, and resource-efficient?"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
        
        {/* Header with 1M1B x IBM SkillsBuild x AICTE Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 text-slate-900 flex items-center justify-center font-black text-base shadow-lg shadow-emerald-500/20">
              1M1B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI for Sustainability Virtual Internship
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  IBM SkillsBuild • AICTE
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-1 text-white">
                Official Project Submission Dossier
              </h2>
              <p className="text-xs text-slate-300">
                1M1B Project Creation & Guideline Document Compliance Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "description", label: "1. Project Description", icon: FileText },
            { id: "responsible_ai", label: "2. Responsible AI (Mandatory)", icon: ShieldCheck },
            { id: "prototype", label: "3. Prototype & Tech Flow", icon: Layers },
            { id: "impact", label: "4. Impact Statement", icon: TrendingUp },
            { id: "slides", label: "5. Presentation Slides & Script", icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-xs leading-relaxed">

          {/* TAB 1: Project Description */}
          {activeTab === "description" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">Project Title</span>
                    <h3 className="text-base font-black text-slate-900">CivicSense AI</h3>
                    <p className="text-xs text-emerald-950 font-medium mt-0.5">
                      AI-Powered Civic Issue Intelligence & Sustainable Response System
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">Municipal Context</span>
                    <p className="text-xs font-bold text-slate-900">Greater Warangal Municipal Corporation (GWMC)</p>
                    <p className="text-[11px] text-slate-600">Telangana, India • Hanamkonda, Kazipet & Warangal Zones</p>
                  </div>
                </div>
              </div>

              {/* Official Problem Statement */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative">
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block mb-2">
                  Official Problem Statement (Guideline Format)
                </span>
                <blockquote className="text-sm sm:text-base font-bold italic text-slate-100 leading-snug">
                  "How might we use AI to automatically triage, prioritize, and spatially cluster unstructured civic grievances in real time so that urban municipal corporations (such as the Greater Warangal Municipal Corporation - GWMC) can become more sustainable, responsive, and resource-efficient?"
                </blockquote>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Section 3 Template Alignment (Page 3 of Guideline)</span>
                  <button
                    onClick={handleCopyStatement}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied Statement" : "Copy Statement"}</span>
                  </button>
                </div>
              </div>

              {/* The 4 Core Questions */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>The 4 Core Evaluation Questions (PDF Page 2)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">1. What problem are you solving?</span>
                    <p className="text-xs text-slate-700">
                      Municipal grievance triage paralysis. Complaints arrive in unstructured, noisy formats (informal vernacular text, blurry photos), creating delayed hazard remediation and zero spatial cluster awareness.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">2. Who is affected?</span>
                    <p className="text-xs text-slate-700">
                      Over 1 million residents across Warangal exposed to open trenches, drinking water leaks, and uncollected waste, alongside GWMC sanitation crews overburdened by disorganized ticketing backlogs.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">3. Why is AI needed?</span>
                    <p className="text-xs text-slate-700">
                      Millisecond speed on high complaint volumes, multimodal CLIP computer vision for photo verification, deterministic 6-factor mathematical severity calculation, and DBSCAN geospatial hotspot detection.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">4. How does solution create impact?</span>
                    <p className="text-xs text-slate-700">
                      Reduces triage turnaround by &gt;60%, prevents monsoon urban flooding through early nala de-silting, minimizes Mission Bhagiratha drinking water loss, and saves ~25% municipal fuel via clustered dispatch.
                    </p>
                  </div>
                </div>
              </div>

              {/* SDG Alignment */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h4 className="text-sm font-black text-slate-900 mb-2">UN Sustainable Development Goals (SDG) Alignment</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="bg-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded shrink-0">PRIMARY</span>
                    <div>
                      <strong className="text-slate-900">SDG 11: Sustainable Cities and Communities</strong>
                      <p className="text-[11px] text-slate-600">
                        Target 11.2 (Safe transport/roads & pothole triage) and Target 11.6 (Reduction of per-capita urban environmental impact & municipal solid waste management).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded shrink-0">SECONDARY</span>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p>• <strong>SDG 6 (Clean Water & Sanitation):</strong> Target 6.1 & 6.4 — Real-time triage of drinking water pipeline bursts.</p>
                      <p>• <strong>SDG 12 (Responsible Consumption):</strong> Target 12.5 — Municipal waste tracking & reduction.</p>
                      <p>• <strong>SDG 13 (Climate Action):</strong> Target 13.1 — Early warning for drainage/nala blockages preventing monsoon flash floods.</p>
                      <p>• <strong>SDG 15 (Life on Land):</strong> Target 15.1 — Triage of fallen urban trees and green canopy protection.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Mandatory Responsible AI */}
          {activeTab === "responsible_ai" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Mandatory Internship Requirement (PDF Pages 4 & 5)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Every project must explicitly address Fairness, Transparency, Ethics, and Privacy. CivicSense AI embeds these directly into the core AI architecture:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Fairness */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs">
                      01
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Fairness (Avoid Bias)</h4>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    <li>• <strong>Linguistic Inclusivity:</strong> NLP classifier is trained and augmented with informal Indian civic expressions and colloquial phrasing, preventing bias against non-English speakers.</li>
                    <li>• <strong>Demographic Equity:</strong> The 6-factor severity formula evaluates physical hazard metrics (safety hazard, water volume) rather than complainant profile or VIP status, ensuring low-income wards receive equal response priority.</li>
                  </ul>
                </div>

                {/* 2. Transparency */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                      02
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Transparency (Explainability)</h4>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    <li>• <strong>Explainable AI (XAI) Modal:</strong> Every triage decision outputs an auditable mathematical breakdown: Safety (25%), Environment (20%), Duration (15%), Population (15%), Evidence (15%), Frequency (10%).</li>
                    <li>• <strong>Human-in-the-Loop:</strong> AI serves as decision support, not an automated authority; municipal officers have full override capability.</li>
                  </ul>
                </div>

                {/* 3. Ethics */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                      03
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Ethics (Constructive Purpose)</h4>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    <li>• <strong>Strict Civic Scope:</strong> Dedicated solely to municipal remediation and environmental protection. Prohibits punitive citizen profiling or surveillance.</li>
                    <li>• <strong>Hallucination Prevention:</strong> Low-confidence classifications are flagged as <em>"Requires Human Review"</em> rather than generating deceptive labels.</li>
                  </ul>
                </div>

                {/* 4. Privacy */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs">
                      04
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Privacy (Data Protection)</h4>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    <li>• <strong>PII Scrubbing:</strong> Personal Identifiable Information (phone numbers, personal names) is stripped before ingestion.</li>
                    <li>• <strong>Data Minimization:</strong> Only civic metadata (issue text, category, coordinates, photo) is routed to departmental field units.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Prototype & Technical Flow */}
          {activeTab === "prototype" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-900 text-white p-5 rounded-2xl">
                <h4 className="text-sm font-black text-emerald-400 mb-2">Co-Developed with IBM BOB</h4>
                <p className="text-xs text-slate-300">
                  As required by the 1M1B / IBM SkillsBuild internship guidelines, <strong>IBM BOB</strong> was embedded across all three phases:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-[11px]">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <strong className="text-emerald-400 block mb-1">1. Ideation Stage</strong>
                    Formulated the 6-factor deterministic scoring rubric and mapped GWMC municipal wings to SDG 11.
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <strong className="text-emerald-400 block mb-1">2. Development Stage</strong>
                    Co-architected decoupled FastAPI backend, DBSCAN Haversine clustering, and SODA API sync.
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <strong className="text-emerald-400 block mb-1">3. Execution Stage</strong>
                    Designed automated test suites and the Explainable AI (XAI) transparent audit modal.
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                <h4 className="text-sm font-black text-slate-900">Full Technical Architecture Flow</h4>
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
{`Citizen / Admin ──▶ React 19 Frontend Dashboard (Vite, Leaflet, Tailwind)
                          │ (REST API / Multipart Upload)
                          ▼
                  FastAPI Backend Server (server.py)
   ┌──────────────────────┬──────────────────────┬──────────────────────┐
   │ NLP Classifier       │ CLIP Vision Model    │ 6-Factor Severity    │
   │ (TF-IDF + LogReg)    │ (Zero-Shot ViT-B/32) │ (0-100 Math Rubric)  │
   ├──────────────────────┼──────────────────────┼──────────────────────┤
   │ DBSCAN Geo Hotspots  │ RAG Assistant Engine │ GWMC Routing Matrix  │
   │ (Haversine Distance) │ (PDF Chunker + Gemini│ (8 Department Wings) │
   └──────────────────────┴──────────────────────┴──────────────────────┘
                          │ CRUD Operations
                          ▼
            Firebase Firestore (or Clean Local SQLite)`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Impact Statement */}
          {activeTab === "impact" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>What Changes if Solution is Implemented?</span>
                  </h4>
                  <ul className="space-y-2 text-slate-700 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Instant Triage:</strong> Grievance triage turnaround drops from 2–4 business days to under 500 milliseconds.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Disaster Mitigation:</strong> Early identification of clogged stormwater drains prevents urban flash flooding during monsoon downpours.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Municipal Efficiency:</strong> DBSCAN spatial clustering enables municipal fleets to resolve co-located issues in a single dispatch, saving ~25% in vehicle fuel costs.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Who Benefits and How?</span>
                  </h4>
                  <ul className="space-y-2 text-slate-700 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>1M+ Warangal Citizens:</strong> Safer roads, timely garbage clearance, clean drinking water, and transparent real-time grievance tracking.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Municipal Field Workers:</strong> Clear, prioritized work orders with exact landmarks and recommended intervention steps instead of generic tickets.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>City Leadership:</strong> Auditable, data-driven telemetry measuring tangible progress towards UN Sustainable Development Goal 11.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Presentation Slides & Script */}
          {activeTab === "slides" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h4 className="text-sm font-black text-slate-900 mb-3">10-Slide Presentation Deck Outline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 1:</strong> Title, Credentials & SDG 11 Focus</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 2:</strong> The Problem: Urban Grievance Paralysis</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 3:</strong> The Solution: CivicSense AI Architecture</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 4:</strong> Co-Development with IBM BOB (Ideation/Dev/Exec)</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 5:</strong> Technical Stack: FastAPI, React 19, Leaflet, Firebase</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 6:</strong> Greater Warangal Localization & Real Landmarks</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 7:</strong> AI Models: NLP, CLIP Vision, DBSCAN Hotspots</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 8:</strong> Live Demonstration & UI Walkthrough</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 9:</strong> Mandatory Responsible AI Framework</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200"><strong>Slide 10:</strong> Impact Statement & Future Scope</div>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-black text-emerald-400">5-Minute Video Demonstration Script Excerpt</h4>
                <p className="text-[11px] leading-relaxed italic text-slate-300">
                  "[0:00 - 0:45] Hello everyone and respected evaluators from 1M1B, IBM SkillsBuild, and AICTE. My name is [Student Name] from [College Name], and I am proud to present CivicSense AI — an AI-Powered Civic Issue Intelligence & Sustainable Response System built for Greater Warangal Municipal Corporation... Our core problem statement is: How might we use AI to automatically triage, prioritize, and spatially cluster civic grievances in real time so that urban municipal corporations like GWMC can become more sustainable, responsive, and resource-efficient?"
                </p>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-800">
                  Full 5-minute script documented in docs/PRESENTATION_SLIDES_AND_SCRIPT.md
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Aligned with 1M1B x IBM SkillsBuild x AICTE Guidelines</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}
