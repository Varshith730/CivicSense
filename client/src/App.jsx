import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CitizenPortal from "./pages/CitizenPortal";
import Admin from "./pages/Admin";
import HotspotMap from "./pages/HotspotMap";
import Sustainability from "./pages/Sustainability";
import AnalysisLab from "./pages/AnalysisLab";
import { getKPIs } from "./api";

export default function App() {
  const [activeMode, setActiveMode] = useState("citizen"); // citizen | admin
  const [activeTab, setActiveTab] = useState("citizen");
  const [kpis, setKpis] = useState(null);

  const fetchKpis = async () => {
    try {
      const data = await getKPIs();
      setKpis(data);
    } catch (err) {
      console.error("Failed to load KPIs", err);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "citizen":
        return (
          <CitizenPortal 
            onComplaintSubmitted={fetchKpis}
            onSwitchToAdmin={() => {
              setActiveMode("admin");
              setActiveTab("admin");
            }}
          />
        );
      case "admin":
        return <Admin />;
      case "hotspots":
        return <HotspotMap />;
      case "sustainability":
        return <Sustainability />;
      case "analysis":
        return <AnalysisLab />;
      default:
        return (
          <CitizenPortal 
            onComplaintSubmitted={fetchKpis}
            onSwitchToAdmin={() => {
              setActiveMode("admin");
              setActiveTab("admin");
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        setActiveTab={setActiveTab}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
