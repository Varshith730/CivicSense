import React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FlaskConical,
  ClipboardList,
  MapPin,
  BarChart3,
  Leaf,
  Bot,
  ShieldCheck,
  Award,
  ChevronRight
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, kpis }) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "report", label: "Report Issue", icon: PlusCircle, highlight: true },
    { id: "analysis", label: "AI Analysis Lab", icon: FlaskConical, badge: "Live" },
    { 
      id: "complaints", 
      label: "Complaints", 
      icon: ClipboardList, 
      count: kpis?.total_complaints || 0 
    },
    { id: "hotspots", label: "Hotspot Map", icon: MapPin },
    { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
    { id: "sustainability", label: "Sustainability (SDG)", icon: Leaf },
    { id: "assistant", label: "AI Assistant", icon: Bot, badge: "RAG" },
    { id: "admin", label: "Admin & Ethics", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isActive
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Internship Badge */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              1M1B x IBM SkillsBuild
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            AI for Sustainability Virtual Internship in collaboration with AICTE.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>GWMC Warangal</span>
            <span className="text-emerald-400">Human Oversight</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

