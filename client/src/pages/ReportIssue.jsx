import React, { useState } from "react";
import { 
  Upload, 
  MapPin, 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Image as ImageIcon,
  Building,
  ShieldCheck
} from "lucide-react";
import { submitComplaint } from "../api";
import SeverityBadge from "../components/SeverityBadge";

export default function ReportIssue({ onSubmitted }) {
  const [text, setText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    { label: "Garbage at Hanamkonda Bazar", text: "Garbage has been accumulating near Hanamkonda Rythu Bazar for four days. Waste bins are overflowing and foul smell is affecting the entire market. Stray cattle are scattering the trash.", loc: "Hanamkonda Rythu Bazar, Hanamkonda", lat: 18.0003, lon: 79.5676 },
    { label: "Pothole at NIT Warangal Gate", text: "There is a large dangerous pothole on the main road near NIT Warangal Gate 2. Two motorcycles slipped yesterday evening. Pothole is unmarked and nearly one foot deep.", loc: "Near NIT Warangal Gate 2, Kazipet Road", lat: 17.9850, lon: 79.5300 },
    { label: "Burst Water Pipe MGM Road", text: "Mission Bhagiratha drinking water pipeline has burst near MGM Hospital road junction. Clean drinking water is gushing onto the road since yesterday morning. Massive wastage.", loc: "MGM Hospital Road, Warangal", lat: 17.9746, lon: 79.5941 },
    { label: "Dark Street Fort Road", text: "Street lights on Fort Road near the bus depot have not been working for 8 days. The road is completely dark at night and incidents of theft are increasing.", loc: "Fort Road, near Bus Depot, Warangal", lat: 17.9693, lon: 79.5858 },
  ];

  const handleApplyPreset = (preset) => {
    setText(preset.text);
    setLocationText(preset.loc);
    setLatitude(preset.lat);
    setLongitude(preset.lon);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }
    if (!locationText.trim()) {
      setError("Please specify the location of the issue.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const formData = new FormData();
      formData.append("text", text);
      formData.append("location_text", locationText);
      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);
      if (imageFile) formData.append("image", imageFile);

      const res = await submitComplaint(formData);
      setResult(res);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit complaint. Please check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Citizen Issue Reporting</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report a Civic or Environmental Problem</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit text, optional photographic evidence, and location. Our AI engine triages the issue, assigns severity, identifies duplicate incidents, and routes to the responsible department.
        </p>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-soft">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Quick Demo Presets (Click to autofill):
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 border border-slate-200 rounded-xl transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submission Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Issue Narrative <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the civic issue in detail. Mention duration (e.g. 3 days, since yesterday) and severity factors..."
              className="w-full p-4 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Mentioning duration & affected people boosts triage accuracy.</span>
              <span>{text.length} chars</span>
            </div>
          </div>

          {/* Location Details */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Location Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g. Near Main Gate, Sector 12"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 19.0760"
                className="w-full px-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 72.8777"
                className="w-full px-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Image Evidence Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              3. Image Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400/60 rounded-3xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/10 transition-all cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <span className="text-xs font-semibold text-emerald-600">
                    Click or drag another image to replace
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Drop photographic evidence here, or browse files
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Analyzed by OpenAI CLIP for automated issue recognition & evidence scoring
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Analyzing & Triage in Progress..." : "Submit Complaint for AI Triage"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Triage Card */}
      {result && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Complaint Successfully Triaged & Stored
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Ticket ID: {result.complaint?.ticket_id}
                </h3>
              </div>
            </div>
            <SeverityBadge level={result.analysis?.severity_level} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Detected Category
              </div>
              <div className="text-sm font-bold text-slate-900">
                {result.analysis?.issue_category}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Confidence: {Math.round((result.analysis?.nlp_confidence || 0.85) * 100)}%
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Severity Score
              </div>
              <div className="text-sm font-black text-slate-900">
                {result.analysis?.severity_score} / 100 pts
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {result.analysis?.severity_level} Priority Response
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200/80 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Primary SDG Alignment
              </div>
              <div className="text-sm font-bold text-emerald-800">
                {result.analysis?.sdg_primary || "SDG 11"}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                {result.analysis?.sdg_rationale?.slice(0, 40)}...
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white/90 border border-emerald-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Assigned Department: {result.analysis?.department}</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              <strong>Action:</strong> {result.analysis?.action_recommendation}
            </p>
          </div>

          {result.analysis?.similar_count > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-medium text-amber-800">
              ⚠️ <strong>{result.analysis.similar_count} similar report(s)</strong> detected nearby. Clustered to avoid duplicate municipal deployment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

