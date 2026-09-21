import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Lock, Users, FileUp, Database, CheckCircle2, 
  AlertTriangle, Trash2, Plus, UserPlus, RefreshCw, Eye, 
  ArrowRight, FileText, Settings, Key, Cpu, Sparkles 
} from "lucide-react";
import { 
  getComplaints, getOfficers, createOfficer, assignOfficer, 
  updateComplaintStatus, uploadRAGDocument, getRAGDocuments, 
  deleteRAGDocument, clearAllData, getSystemStatus, updateSystemConfig 
} from "../api";
import ExplainabilityModal from "../components/ExplainabilityModal";

const ADMIN_PASSKEY = "GWMC-ADMIN-2026";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState("");

  const [activeAdminTab, setActiveAdminTab] = useState("complaints"); // complaints | rag | officers | system

  // Complaints & Assignment State
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Explainability modal

  // Assign Officer Modal
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Officers State
  const [officers, setOfficers] = useState([]);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: "", department: "GWMC Solid Waste & Sanitation Wing",
    designation: "Field Officer", ward: "", phone: "", email: ""
  });

  // RAG State
  const [ragDocuments, setRagDocuments] = useState([]);
  const [ragUploadFile, setRagUploadFile] = useState(null);
  const [ragUploadTitle, setRagUploadTitle] = useState("");
  const [isUploadingRAG, setIsUploadingRAG] = useState(false);

  // System Config State
  const [systemStatus, setSystemStatus] = useState(null);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [firebaseJsonInput, setFirebaseJsonInput] = useState("");
  const [configSaving, setConfigSaving] = useState(false);

  // Load Data
  const loadAllData = async () => {
    try {
      setLoadingComplaints(true);
      const [compRes, offRes, ragRes, sysRes] = await Promise.all([
        getComplaints({ status: statusFilter !== "all" ? statusFilter : undefined }),
        getOfficers(),
        getRAGDocuments(),
        getSystemStatus()
      ]);
      setComplaints(compRes.complaints || []);
      setOfficers(offRes.officers || []);
      setRagDocuments(ragRes.documents || []);
      setSystemStatus(sysRes);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, statusFilter]);

  // Handle Passkey Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (passkeyInput.trim() === ADMIN_PASSKEY || passkeyInput.trim() === "admin") {
      setIsAuthenticated(true);
      setPasskeyError("");
    } else {
      setPasskeyError("Invalid passkey. (Default: GWMC-ADMIN-2026)");
    }
  };

  // Open Assign Modal
  const openAssignModal = (complaint) => {
    setAssigningComplaint(complaint);
    setSelectedOfficerId(officers[0]?.id || "");
    setAssignmentNotes(complaint.officer_notes || "");
  };

  // Submit Officer Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedOfficerId) return;

    const officer = officers.find((o) => o.id === selectedOfficerId);
    if (!officer) return;

    try {
      setIsAssigning(true);
      await assignOfficer(
        assigningComplaint.id,
        officer.id,
        officer.name,
        assignmentNotes
      );
      setAssigningComplaint(null);
      await loadAllData();
      alert(`Complaint successfully assigned to ${officer.name} (${officer.department})!`);
    } catch (err) {
      alert("Failed to assign officer: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsAssigning(false);
    }
  };

  // Quick Status Change
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      await loadAllData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Upload RAG Document
  const handleRAGUpload = async (e) => {
    e.preventDefault();
    if (!ragUploadFile) {
      alert("Please select a PDF or TXT file.");
      return;
    }

    try {
      setIsUploadingRAG(true);
      const formData = new FormData();
      formData.append("file", ragUploadFile);
      if (ragUploadTitle.trim()) {
        formData.append("title", ragUploadTitle.trim());
      }
      const res = await uploadRAGDocument(formData);
      alert(res.message || "Document indexed into RAG successfully!");
      setRagUploadFile(null);
      setRagUploadTitle("");
      await loadAllData();
    } catch (err) {
      alert("Failed to index document: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingRAG(false);
    }
  };

  // Delete RAG Document
  const handleDeleteRAG = async (docId) => {
    if (!window.confirm("Remove this document from the RAG knowledge base?")) return;
    try {
      await deleteRAGDocument(docId);
      await loadAllData();
    } catch (err) {
      alert("Failed to delete document: " + err.message);
    }
  };

  // Add Officer
  const handleAddOfficer = async (e) => {
    e.preventDefault();
    try {
      await createOfficer(newOfficer);
      setShowAddOfficerModal(false);
      setNewOfficer({
        name: "", department: "GWMC Solid Waste & Sanitation Wing",
        designation: "Field Officer", ward: "", phone: "", email: ""
      });
      await loadAllData();
      alert("Municipal officer onboarded successfully!");
    } catch (err) {
      alert("Failed to add officer: " + err.message);
    }
  };

  // Save System Config
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setConfigSaving(true);
      const res = await updateSystemConfig({
        gemini_api_key: geminiKeyInput || undefined,
        firebase_service_account_json: firebaseJsonInput || undefined
      });
      alert("Configuration updated successfully!");
      setSystemStatus((prev) => ({ ...prev, ...res }));
    } catch (err) {
      alert("Failed to update config: " + err.message);
    } finally {
      setConfigSaving(false);
    }
  };

  // Wipe All Data
  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to wipe all registered complaints? This will start completely from scratch with 0 complaints.")) return;
    try {
      await clearAllData();
      await loadAllData();
      alert("Database wiped clean. Starting completely fresh from 0 complaints!");
    } catch (err) {
      alert("Failed to clear data: " + err.message);
    }
  };

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center">
        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
          <Lock className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Municipal Admin Console</h2>
        <p className="text-xs text-slate-500 mb-6">
          Authorized personnel only. Enter your administrator passkey to manage complaints, assign officers, and upload documents to RAG.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Enter Admin Passkey (GWMC-ADMIN-2026)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-center text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            {passkeyError && (
              <p className="text-[11px] text-rose-500 font-semibold mt-2">{passkeyError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticate Admin Access</span>
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-4">
          Default Master Passkey: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">GWMC-ADMIN-2026</code>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 mb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
              Admin Console
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              GWMC Control Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Municipal Governance & Workforce Hub</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
        {[
          { id: "complaints", label: "Complaints & Officer Dispatch", icon: CheckCircle2, badge: complaints.length },
          { id: "rag", label: "RAG Knowledge Base & Documents", icon: FileUp, badge: ragDocuments.length },
          { id: "officers", label: "Municipal Workforce Directory", icon: Users, badge: officers.length },
          { id: "system", label: "Database & Cloud Config", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                activeAdminTab === tab.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeAdminTab === tab.id ? "bg-emerald-500 text-slate-900" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Complaints & Officer Dispatch */}
      {activeAdminTab === "complaints" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filter by Status:</span>
              {["all", "pending", "assigned", "in_progress", "resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    statusFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{complaints.length}</span> registered complaints
            </div>
          </div>

          {loadingComplaints ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs font-bold">Loading registered complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Clean Slate: 0 Complaints</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No complaints currently in the database. New issues submitted via the public Citizen Portal will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Ticket ID</th>
                      <th className="px-6 py-3.5">Category & Locality</th>
                      <th className="px-6 py-3.5">Severity</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Assigned Officer</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {c.ticket_id}
                          <span className="block text-[10px] text-slate-400 font-sans">
                            {new Date(c.submitted_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 block truncate max-w-xs">{c.text}</span>
                          <span className="text-[10px] text-slate-500">{c.location_text || "Warangal"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.severity_level === "CRITICAL" ? "bg-rose-100 text-rose-800" :
                            c.severity_level === "HIGH" ? "bg-orange-100 text-orange-800" :
                            c.severity_level === "MEDIUM" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {c.severity_level || "MEDIUM"} ({c.severity_score || 50})
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={c.status || "pending"}
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            className="text-[11px] font-bold px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {c.assigned_officer_name ? (
                            <div>
                              <span className="font-bold text-slate-900 block">{c.assigned_officer_name}</span>
                              <span className="text-[10px] text-slate-500">{c.department}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-rose-500 font-semibold italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openAssignModal(c)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-all"
                          >
                            {c.assigned_officer_name ? "Reassign" : "Assign Officer"}
                          </button>
                          <button
                            onClick={() => setSelectedComplaint(c)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
                            title="View XAI Severity Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: RAG Knowledge Hub */}
      {activeAdminTab === "rag" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Upload Document */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-600" />
              <span>Upload Municipal Policy to RAG</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Uploaded guidelines and circulars are automatically parsed, chunked, and indexed. The citizen AI chatbot immediately uses these documents to generate grounded, factual answers.
            </p>

            <form onSubmit={handleRAGUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={ragUploadTitle}
                  onChange={(e) => setRagUploadTitle(e.target.value)}
                  placeholder="e.g. Mission Bhagiratha Water Works SOP 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select File (PDF / TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={(e) => setRagUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingRAG || !ragUploadFile}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploadingRAG ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                <span>{isUploadingRAG ? "Parsing & Indexing Chunks..." : "Index Document into RAG"}</span>
              </button>
            </form>
          </div>

          {/* Right: Indexed Documents List */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Indexed Municipal Knowledge Base</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Active documents providing ground truth for citizen AI queries.
            </p>

            {ragDocuments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                No policy documents uploaded yet. Upload a PDF/TXT to equip the chatbot with authoritative municipal circulars.
              </div>
            ) : (
              <div className="space-y-3">
                {ragDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{doc.title}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                          {doc.chunk_count} Chunks
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.content_preview}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">File: {doc.filename}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteRAG(doc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Remove from RAG index"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Municipal Workforce Directory */}
      {activeAdminTab === "officers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900">GWMC Department Field Officers</h3>
              <p className="text-xs text-slate-500">Authorized personnel for grievance assignment and SLA tracking.</p>
            </div>
            <button
              onClick={() => setShowAddOfficerModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Onboard New Officer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officers.map((off) => (
              <div key={off.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center">
                      {off.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{off.name}</h4>
                      <span className="text-[11px] text-slate-500 font-semibold">{off.designation}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full">
                    {off.active_tickets || 0} Tickets
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <p><span className="font-bold text-slate-400">Wing:</span> {off.department}</p>
                  <p><span className="font-bold text-slate-400">Ward:</span> {off.ward || "All Zones"}</p>
                  <p><span className="font-bold text-slate-400">Phone:</span> {off.phone || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System Settings & Cloud Database */}
      {activeAdminTab === "system" && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Cloud Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Firebase Firestore</h4>
                  <span className={`text-[10px] font-bold ${systemStatus?.firebase_configured ? "text-emerald-600" : "text-slate-500"}`}>
                    {systemStatus?.firebase_configured ? "● Cloud Connected" : "○ Clean Local Storage Mode"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {systemStatus?.firebase_configured
                  ? "Live sync enabled with Firebase cloud collection."
                  : "Using zero-config local storage with 0 demo complaints. Connect Firebase via the form below."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">LLM Generation Engine</h4>
                  <span className={`text-[10px] font-bold ${systemStatus?.gemini_configured ? "text-emerald-600" : "text-amber-600"}`}>
                    {systemStatus?.gemini_configured ? "● Gemini API Active" : "○ Grounded Rule Engine"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {systemStatus?.gemini_configured
                  ? "Conversational synthesis active via Google Gemini."
                  : "Grounding queries against uploaded municipal circulars. Add GEMINI_API_KEY below."}
              </p>
            </div>
          </div>

          {/* Config Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <span>Connect API Keys & Cloud Credentials</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Paste your API keys below to activate cloud persistence and conversational LLM generation without restarting the server.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firebase Service Account JSON (Optional)</label>
                <textarea
                  rows={4}
                  value={firebaseJsonInput}
                  onChange={(e) => setFirebaseJsonInput(e.target.value)}
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={configSaving}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {configSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                <span>Save Configuration</span>
              </button>
            </form>
          </div>

          {/* Danger Zone: Clean Slate */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6">
            <h3 className="text-sm font-black text-rose-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Clean Slate Maintenance</span>
            </h3>
            <p className="text-xs text-rose-700 mb-4">
              Wipes all registered complaints and returns the platform to 0 complaints from scratch.
            </p>
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Wipe All Complaints to Scratch (0 Complaints)
            </button>
          </div>
        </div>
      )}

      {/* Modal: Assign Officer */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assign Officer</span>
                <h3 className="text-base font-black text-slate-900">{assigningComplaint.ticket_id}</h3>
              </div>
              <button
                onClick={() => setAssigningComplaint(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700">
              <p className="font-bold">{assigningComplaint.text}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Locality: {assigningComplaint.location_text}</span>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Municipal Officer</label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} — {off.designation} ({off.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Instructions / Notes</label>
                <textarea
                  rows={3}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="e.g., Immediate site visit ordered; verify pipeline burst and cordon road section."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isAssigning ? "Assigning..." : "Confirm Officer Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Officer */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">Onboard Field Officer</h3>
              <button onClick={() => setShowAddOfficerModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleAddOfficer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                  placeholder="e.g. Er. Srinivas Rao"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newOfficer.department}
                  onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="GWMC Solid Waste & Sanitation Wing">GWMC Solid Waste & Sanitation Wing</option>
                  <option value="GWMC Engineering & Town Planning Department">GWMC Engineering & Town Planning Department</option>
                  <option value="GWMC Mission Bhagiratha Water Works Division">GWMC Mission Bhagiratha Water Works Division</option>
                  <option value="GWMC Electrical & Street Lighting Wing">GWMC Electrical & Street Lighting Wing</option>
                  <option value="GWMC Stormwater & Nala Maintenance Wing">GWMC Stormwater & Nala Maintenance Wing</option>
                  <option value="Telangana State Pollution Control Board (TSPCB)">Telangana State Pollution Control Board (TSPCB)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newOfficer.designation}
                  onChange={(e) => setNewOfficer({ ...newOfficer, designation: e.target.value })}
                  placeholder="e.g. Assistant Executive Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ward / Zone</label>
                <input
                  type="text"
                  value={newOfficer.ward}
                  onChange={(e) => setNewOfficer({ ...newOfficer, ward: e.target.value })}
                  placeholder="e.g. Ward 18 (Hanamkonda North)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                  placeholder="+91 94401 23000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explainability Modal */}
      {selectedComplaint && (
        <ExplainabilityModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}
