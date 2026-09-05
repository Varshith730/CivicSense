import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE,
});

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
export const getHotspots = async (eps = 0.5, minSamples = 3) => (await api.get("/api/hotspots", {
  params: { eps_km: eps, min_samples: minSamples },
})).data;
export const getAnalytics = async () => (await api.get("/api/analytics")).data;
export const getSustainability = async () => (await api.get("/api/sustainability")).data;
export const askAssistant = async (question) => (await api.post("/api/assistant", { question })).data;
export const seedDatabase = async () => (await api.post("/api/seed")).data;
export const syncLiveNYC311 = async (limit = 10) => (await api.post(`/api/sync-live-nyc311?limit=${limit}`)).data;
