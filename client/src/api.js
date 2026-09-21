import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE,
});

// Complaints & Triage
export const getKPIs = async () => (await api.get("/api/kpi")).data;
export const getComplaints = async (params) => (await api.get("/api/complaints", { params })).data;
export const getComplaintDetail = async (id) => (await api.get(`/api/complaints/${id}`)).data;
export const updateComplaintStatus = async (id, status) => (await api.patch(`/api/complaints/${id}/status`, { status })).data;
export const submitComplaint = async (formData) => (await api.post("/api/complaints", formData, {
  headers: { "Content-Type": "multipart/form-data" },
})).data;
export const testAnalyze = async (formData) => (await api.post("/api/analyze-test", formData, {
  headers: { "Content-Type": "multipart/form-data" },
})).data;

// Officers & Workforce Assignment
export const getOfficers = async () => (await api.get("/api/officers")).data;
export const createOfficer = async (data) => (await api.post("/api/officers", data)).data;
export const assignOfficer = async (complaintId, officerId, officerName, notes = "") => 
  (await api.post(`/api/complaints/${complaintId}/assign`, {
    officer_id: officerId,
    officer_name: officerName,
    notes: notes
  })).data;

// RAG Knowledge Base & Documents
export const uploadRAGDocument = async (formData) => (await api.post("/api/admin/rag/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
})).data;
export const getRAGDocuments = async () => (await api.get("/api/admin/rag/documents")).data;
export const deleteRAGDocument = async (docId) => (await api.delete(`/api/admin/rag/documents/${docId}`)).data;

// Chatbot & LLM Assistant
export const chatWithAssistant = async (message) => (await api.post("/api/chat", { message })).data;
export const askAssistant = async (question) => (await api.post("/api/chat", { message: question })).data;

// Geospatial & Analytics
export const getHotspots = async (eps = 0.5, minSamples = 3) => (await api.get("/api/hotspots", {
  params: { eps_km: eps, min_samples: minSamples },
})).data;
export const getAnalytics = async () => (await api.get("/api/analytics")).data;
export const getSustainability = async () => (await api.get("/api/sustainability")).data;

// System Controls & Clean Slate
export const clearAllData = async () => (await api.post("/api/admin/clear-all")).data;
export const getSystemStatus = async () => (await api.get("/api/system/status")).data;
export const updateSystemConfig = async (data) => (await api.post("/api/system/config", data)).data;
export const syncLiveNYC311 = async (limit = 10) => (await api.post(`/api/sync-live-nyc311?limit=${limit}`)).data;
