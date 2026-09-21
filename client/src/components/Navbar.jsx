import React, { useState } from "react";
import { Building2, ShieldCheck, UserCheck, Map, BarChart3, PlusCircle, Award, ExternalLink } from "lucide-react";
import SubmissionDossierModal from "./SubmissionDossierModal";

export default function Navbar({ activeMode, setActiveMode, setActiveTab }) {
  const [showDossier, setShowDossier] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-0 transition-all shadow-sm">
        <div className="flex items-center justify-between gap-4 h-16 max-w-7xl mx-auto w-full">
          
          {/* Left: Brand with GWMC context */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => { setActiveMode("citizen"); setActiveTab("citizen"); }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-base text-slate-900 tracking-tight leading-none">CivicSense AI</span>
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">GWMC</span>
                <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider hidden sm:inline">Warangal</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none mt-1 hidden sm:block">
                Greater Warangal Municipal Corporation — AI Civic Response
              </p>
            </div>
          </div>

          {/* Center: Mode Switcher (Citizen vs Admin) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveMode("citizen");
                setActiveTab("citizen");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === "citizen"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => {
                setActiveMode("admin");
                setActiveTab("admin");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === "admin"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Console</span>
            </button>
          </div>

          {/* Right: Submission Dossier & Quick Actions */}
          <div className="flex items-center gap-2">
            {/* 1M1B Submission Dossier Button */}
            <button
              onClick={() => setShowDossier(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
              title="View 1M1B x IBM SkillsBuild x AICTE Project Submission Dossier"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Submission Dossier</span>
            </button>

            {/* City Map Link */}
            <button
              onClick={() => {
                setActiveTab("hotspots");
              }}
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Map className="w-3.5 h-3.5 text-teal-600" />
              <span>Warangal Map</span>
            </button>

            {/* SDG Tracker Link */}
            <button
              onClick={() => {
                setActiveTab("sustainability");
              }}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full text-emerald-700 text-[10px] font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SDG 11 Active</span>
            </button>

            {/* Quick Report Button */}
            <button
              onClick={() => {
                setActiveMode("citizen");
                setActiveTab("citizen");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>

        </div>
      </header>

      {/* Submission Dossier Modal */}
      <SubmissionDossierModal
        isOpen={showDossier}
        onClose={() => setShowDossier(false)}
      />
    </>
  );
}
