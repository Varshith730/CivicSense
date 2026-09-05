import React from "react";
import { Building2, Search, Bell, PlusCircle, Database, Radio } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onSeed, isSeeding, onSyncLive, isSyncing }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-0 transition-all">
      <div className="flex items-center justify-between gap-4 h-16">
        {/* Left: Brand with GWMC context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-base text-slate-900 tracking-tight leading-none">CivicSense AI</span>
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">GWMC</span>
              <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider hidden sm:inline">Smart City</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5 hidden sm:block">Greater Warangal Municipal Corporation — Civic Intelligence Platform</p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints, wards, localities..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/70 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* SDG 11 Live Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full text-emerald-700 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SDG 11 Active</span>
          </div>

          {/* Live Sync Button */}
          <button
            onClick={onSyncLive}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            title="Pull live complaints from NYC 311 OpenData API"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Streaming..." : "Sync Live NYC"}</span>
          </button>

          {/* Seed Demo */}
          <button
            onClick={onSeed}
            disabled={isSeeding}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{isSeeding ? "Seeding..." : "Seed GWMC Demo"}</span>
          </button>

          {/* Report Issue */}
          <button
            onClick={() => setActiveTab("report")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-slate-200 shrink-0">
            GW
          </div>
        </div>
      </div>
    </header>
  );
}
