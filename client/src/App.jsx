import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import ReportIssue from "./pages/ReportIssue";
import AnalysisLab from "./pages/AnalysisLab";
import Complaints from "./pages/Complaints";
import HotspotMap from "./pages/HotspotMap";
import Analytics from "./pages/Analytics";
import Sustainability from "./pages/Sustainability";
import AIAssistant from "./pages/AIAssistant";
import Admin from "./pages/Admin";
import { getKPIs, seedDatabase, syncLiveNYC311 } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [kpis, setKpis] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedDatabase();
      await fetchKpis();
      alert("Database successfully reset and seeded with demo complaints!");
    } catch (err) {
      alert("Failed to seed database: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSyncLive = async () => {
    try {
      setIsSyncing(true);
      const res = await syncLiveNYC311(10);
      await fetchKpis();
      alert(res.message || "Successfully pulled 10 live complaints from NYC 311 OpenData API!");
    } catch (err) {
      alert("Failed to sync live data: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSyncing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview setActiveTab={setActiveTab} />;
      case "report":
        return <ReportIssue onSubmitted={() => { fetchKpis(); setActiveTab("complaints"); }} />;
      case "analysis":
        return <AnalysisLab />;
      case "complaints":
        return <Complaints />;
      case "hotspots":
        return <HotspotMap />;
      case "analytics":
        return <Analytics />;
      case "sustainability":
        return <Sustainability />;
      case "assistant":
        return <AIAssistant />;
      case "admin":
        return <Admin onSyncLive={handleSyncLive} isSyncing={isSyncing} />;
      default:
        return <Overview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSeed={handleSeed}
        isSeeding={isSeeding}
        onSyncLive={handleSyncLive}
        isSyncing={isSyncing}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          kpis={kpis} 
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
