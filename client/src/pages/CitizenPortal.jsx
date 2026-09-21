import React, { useState, useRef } from "react";
import { 
  FileText, Search, MessageSquare, MapPin, Camera, CheckCircle2, 
  Clock, ShieldAlert, Sparkles, Send, ArrowRight, User, Phone, 
  Building2, AlertTriangle, RefreshCw, Copy, Check, Eye, Award, 
  HelpCircle, Compass, Layers, ChevronRight
} from "lucide-react";
import { submitComplaint, getComplaintDetail, chatWithAssistant } from "../api";
import SubmissionDossierModal from "../components/SubmissionDossierModal";

const WARANGAL_LANDMARKS = [
  { name: "Hanamkonda Rythu Bazar", lat: 18.0125, lng: 79.5603 },
  { name: "NIT Warangal Main Gate", lat: 17.9836, lng: 79.5308 },
  { name: "Kazipet Railway Junction", lat: 17.9782, lng: 79.5085 },
  { name: "MGM Hospital Road", lat: 17.9812, lng: 79.5982 },
  { name: "Kakatiya University Campus", lat: 18.0315, lng: 79.5442 },
  { name: "Balasamudram Nala", lat: 17.9982, lng: 79.5684 }
];

const CIVIC_CATEGORIES = [
  "Garbage / Waste",
  "Pothole / Road Damage",
  "Water Leakage / Sanitation",
  "Broken Streetlight",
  "Drainage / Flooding",
  "Pollution",
  "Fallen Tree / Vegetation",
  "Other Infrastructure"
];

// 6 Authentic Warangal Civic Issues for 1-Click Evaluation
const SAMPLE_WARANGAL_ISSUES = [
  {
    id: "sample-1",
    title: "Commercial Waste Dump",
    locality: "Hanamkonda Rythu Bazar",
    category: "Garbage / Waste",
    desc: "Huge pile of rotting vegetable waste and unsegregated plastic dumped near the market entrance for 3 days. Foul smell and stray animal hazard.",
    image: "/warangal/waste_dump.jpg",
    coords: { lat: 18.0125, lng: 79.5603 },
    sdg: "SDG 11.6 & 12.5"
  },
  {
    id: "sample-2",
    title: "Dangerous Road Crater",
    locality: "NIT Warangal Kazipet Road",
    category: "Pothole / Road Damage",
    desc: "Deep crater formed on the main transit corridor after rains. Two-wheelers losing balance; urgent road patching required near student crossing.",
    image: "/warangal/road_pothole.jpg",
    coords: { lat: 17.9836, lng: 79.5308 },
    sdg: "SDG 11.2"
  },
  {
    id: "sample-3",
    title: "Fallen Electric Pole Hazard",
    locality: "Kakatiya University / Subedari",
    category: "Broken Streetlight",
    desc: "Streetlight pole bent at dangerous 45-degree angle with loose live wiring hanging over pedestrian path outside residential colony.",
    image: "/warangal/electric_pole.jpg",
    coords: { lat: 18.0315, lng: 79.5442 },
    sdg: "SDG 11.2"
  },
  {
    id: "sample-4",
    title: "Stormwater Nala Flooding",
    locality: "Balasamudram Low-Lying Ward",
    category: "Drainage / Flooding",
    desc: "Main drainage nala blocked with plastic silt causing filthy overflow across the road. Pedestrians unable to cross; disease outbreak risk.",
    image: "/warangal/urban_flood.jpg",
    coords: { lat: 17.9982, lng: 79.5684 },
    sdg: "SDG 13.1 & 6.4"
  },
  {
    id: "sample-5",
    title: "Cracked Junction Pavement",
    locality: "Kazipet Railway Junction Colony",
    category: "Pothole / Road Damage",
    desc: "Severely broken road surface and loose gravel causing heavy traffic jams for auto-rickshaws and buses arriving at the railway station.",
    image: "/warangal/pothole_crater.jpg",
    coords: { lat: 17.9782, lng: 79.5085 },
    sdg: "SDG 11.2"
  },
  {
    id: "sample-6",
    title: "Fallen Tree Blocking Road",
    locality: "Fort Warangal Heritage Corridor",
    category: "Fallen Tree / Vegetation",
    desc: "Massive roadside banyan branch collapsed after strong winds, completely blocking both vehicular lanes and entangled in overhead wires.",
    image: "/warangal/fallen_tree.jpg",
    coords: { lat: 17.9693, lng: 79.5858 },
    sdg: "SDG 15.1"
  }
];

export default function CitizenPortal({ onComplaintSubmitted, onSwitchToAdmin }) {
  const [activeSubTab, setActiveSubTab] = useState("lodge"); // lodge | track | chatbot | map
  const formRef = useRef(null);

  // Submission Dossier Modal State
  const [showDossier, setShowDossier] = useState(false);

  // Lodge Form State
  const [category, setCategory] = useState(CIVIC_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState({ lat: 17.9812, lng: 79.5982 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  // Track State
  const [searchTicketId, setSearchTicketId] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Namaskaram! I am your CivicSense AI Municipal Assistant for Greater Warangal Municipal Corporation (GWMC). How can I assist you today? You can inquire about municipal guidelines, waste disposal rules, Mission Bhagiratha water schedules, or type your Ticket ID to check real-time status."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Quick Landmark Select
  const handleSelectLandmark = (landmark) => {
    setLocationText(landmark.name + ", Warangal");
    setCoords({ lat: landmark.lat, lng: landmark.lng });
  };

  // Quick-Fill Sample Warangal Issue
  const handleQuickFillSample = (sample) => {
    setActiveSubTab("lodge");
    setCategory(sample.category);
    setDescription(sample.desc);
    setLocationText(sample.locality + ", Warangal");
    setCoords(sample.coords);
    setImagePreview(sample.image);
    // Smooth scroll down to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide a description of the issue.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("text", description);
      formData.append("location_text", locationText || "Warangal Zone");
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await submitComplaint(formData);
      setSubmittedTicket(res);
      if (onComplaintSubmitted) onComplaintSubmitted();
    } catch (err) {
      alert("Failed to submit grievance: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Ticket
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Track Ticket
  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!searchTicketId.trim()) return;

    try {
      setTrackingLoading(true);
      setTrackingError("");
      const res = await getComplaintDetail(searchTicketId.trim());
      setTrackingResult(res);
    } catch (err) {
      setTrackingError("Ticket not found. Please check your Ticket ID (e.g. GWMC-20260918-XXXX).");
      setTrackingResult(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setChatLoading(true);

    try {
      const res = await chatWithAssistant(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.answer || "I processed your request.",
          sources: res.sources,
          model: res.model
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Sorry, I am having trouble connecting to the municipal knowledge base right now. Please try again shortly."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* ── 1. Hero Banner with Real Warangal Visual Branding ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/30">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/gwmc_banner.jpg')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/90 to-teal-950/80 backdrop-blur-[2px]"></div>

        <div className="relative z-10 p-8 sm:p-12 text-white max-w-3xl">
          {/* Partnership Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
              1M1B • IBM SkillsBuild • AICTE
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold rounded-full">
              SDG 11: Sustainable Cities
            </span>
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold rounded-full hidden sm:inline">
              Co-Developed with IBM BOB
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Greater Warangal <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              CivicSense Intelligence
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-8">
            Empowering citizens across Hanamkonda, Kazipet, and Warangal with multimodal AI grievance triage, 
            instant department routing, and transparent resolution tracking for sustainable urban governance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSubTab("lodge")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                activeSubTab === "lodge" 
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30" 
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Report Civic Issue</span>
            </button>

            <button
              onClick={() => setActiveSubTab("track")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                activeSubTab === "track" 
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30" 
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Ticket ID</span>
            </button>

            <button
              onClick={() => setActiveSubTab("chatbot")}
              className={`px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                activeSubTab === "chatbot" 
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30" 
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>RAG AI Assistant</span>
            </button>

            <button
              onClick={() => setShowDossier(true)}
              className="px-5 py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition-all flex items-center gap-1.5 ml-auto"
            >
              <Award className="w-4 h-4" />
              <span>1M1B Submission Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Ground Reality: Greater Warangal Civic Issues Interactive Showcase ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                Field Evidence Gallery
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Authentic Warangal Urban Context</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Ground Reality: Greater Warangal Civic Challenges</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md text-right hidden md:block">
            Click <strong>"1-Click Test in AI"</strong> on any real issue below to populate the grievance form and test the automated triage pipeline!
          </p>
        </div>

        {/* Sliced Warangal Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_WARANGAL_ISSUES.map((sample) => (
            <div 
              key={sample.id}
              className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col"
            >
              {/* Photo */}
              <div className="relative h-44 overflow-hidden bg-slate-200">
                <img 
                  src={sample.image} 
                  alt={sample.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  {sample.locality}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black">
                  {sample.sdg}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{sample.category}</span>
                  <h3 className="text-sm font-black text-slate-900 mb-2">{sample.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {sample.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleQuickFillSample(sample)}
                  className="w-full py-2.5 bg-white group-hover:bg-emerald-600 text-slate-800 group-hover:text-white border border-slate-300 group-hover:border-emerald-600 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-300" />
                  <span>1-Click Test in AI Engine</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Sub-Tabs Section (Lodge Grievance | Track | Chatbot) ── */}
      <div ref={formRef}>
        {activeSubTab === "lodge" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span>Lodge a Civic Grievance</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multimodal triage: NLP classification, CLIP visual validation, and GWMC department routing.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Public • Zero Login
                </span>
              </div>

              {submittedTicket ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in">
                  <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Grievance Successfully Registered!</h3>
                  <p className="text-xs text-slate-600 mb-4">
                    Your issue has been triaged by CivicSense AI and logged in the municipal system.
                  </p>

                  <div className="bg-white border border-emerald-300 rounded-xl p-4 max-w-md mx-auto mb-6 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Your Ticket ID</span>
                      <p className="font-mono font-black text-lg text-emerald-700">{submittedTicket.ticket_id}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(submittedTicket.ticket_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-6 text-left">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Assigned Wing</span>
                      <span className="text-xs font-bold text-slate-800 truncate block">{submittedTicket.analysis?.department || "GWMC Triage"}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">AI Severity</span>
                      <span className="text-xs font-bold text-rose-600 block">{submittedTicket.analysis?.severity_level || "MEDIUM"} ({submittedTicket.analysis?.severity_score}/100)</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">SDG Target</span>
                      <span className="text-xs font-bold text-emerald-700 block">{submittedTicket.analysis?.sdg_primary || "SDG 11"}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSearchTicketId(submittedTicket.ticket_id);
                        setActiveSubTab("track");
                        handleTrack();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Track Remediation Progress
                    </button>
                    <button
                      onClick={() => {
                        setSubmittedTicket(null);
                        setDescription("");
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Lodge Another Grievance
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Issue Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    >
                      {CIVIC_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Issue Description & Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the issue: e.g., 'Mission Bhagiratha drinking water pipeline burst near Rythu Bazar, road flooded for 2 days...'"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      required
                    />
                  </div>

                  {/* Location & Landmark Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Location & Landmark</label>
                    <div className="relative mb-2">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        placeholder="e.g. Near Hanamkonda Rythu Bazar, Ward 12"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Warangal Landmarks:</span>
                      {WARANGAL_LANDMARKS.map((lm) => (
                        <button
                          key={lm.name}
                          type="button"
                          onClick={() => handleSelectLandmark(lm)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 transition-all"
                        >
                          {lm.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Attach Photographic Evidence</label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 rounded-2xl p-4 text-center cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="citizen-image-upload"
                      />
                      <label htmlFor="citizen-image-upload" className="cursor-pointer block">
                        {imagePreview ? (
                          <div className="relative inline-block">
                            <img src={imagePreview} alt="Evidence" className="h-40 rounded-xl object-cover shadow-sm mx-auto" />
                            <span className="text-[10px] font-bold text-emerald-600 mt-2 block">Click to replace photo</span>
                          </div>
                        ) : (
                          <div>
                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-700">Upload mobile photo or drag & drop</p>
                            <p className="text-[10px] text-slate-400">Validated automatically by CLIP Zero-Shot Computer Vision</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI Engine Triaging Grievance in Milliseconds...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Grievance to GWMC</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Info Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Smart City Map Blueprint Widget */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-600" />
                    <span>Warangal GIS Command Blueprint</span>
                  </h3>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    66 Wards
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 mb-3 group cursor-pointer">
                  <img 
                    src="/warangal_map.jpg" 
                    alt="Warangal GIS Map" 
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    View Full Hotspot Map
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Complaints are automatically grouped using <strong>DBSCAN geospatial clustering</strong> across Hanamkonda, Kazipet, and Warangal zones.
                </p>
              </div>

              {/* Responsible AI Guarantee */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mb-3">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">Citizen Privacy Guarantee</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  In strict accordance with our <strong>Mandatory Responsible AI Guidelines</strong>, citizen PII is stripped. Only physical hazard severity and coordinates are routed to GWMC field crews.
                </p>
              </div>

              {/* Admin Console Callout */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black mb-1">Municipal Officials Login</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Access the Admin Console to assign complaints to field officers and index policy circulars to RAG.
                </p>
                <button
                  onClick={onSwitchToAdmin}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Switch to Admin Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Tab: Track Grievance */}
        {activeSubTab === "track" && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="text-center max-w-md mx-auto mb-8">
              <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Track Grievance Status</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your official Ticket ID to view real-time remediation progress and assigned department officers.
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto mb-8">
              <input
                type="text"
                value={searchTicketId}
                onChange={(e) => setSearchTicketId(e.target.value)}
                placeholder="e.g. GWMC-20260918-XXXX"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Track</span>
              </button>
            </form>

            {trackingError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl text-center mb-6">
                {trackingError}
              </div>
            )}

            {trackingResult && (
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Grievance Ticket</span>
                    <p className="text-base font-mono font-black text-slate-900">{trackingResult.ticket_id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                    trackingResult.status === "resolved" ? "bg-emerald-100 text-emerald-800" :
                    trackingResult.status === "assigned" ? "bg-blue-100 text-blue-800" :
                    trackingResult.status === "in_progress" ? "bg-amber-100 text-amber-800" :
                    "bg-slate-200 text-slate-700"
                  }`}>
                    Status: {trackingResult.status || "Pending"}
                  </span>
                </div>

                {/* Progress Steps */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-3">Resolution Milestone Tracker</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span>1. Registered</span>
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span>2. AI Triaged</span>
                    </div>
                    <div className={`p-2 rounded-lg ${trackingResult.status !== 'pending' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                      <User className="w-4 h-4 mx-auto mb-1" />
                      <span>3. Officer Assigned</span>
                    </div>
                    <div className={`p-2 rounded-lg ${trackingResult.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      <span>4. Remediated</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Officer Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Assigned Municipal Authority</span>
                  {trackingResult.assigned_officer_name ? (
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                          {trackingResult.assigned_officer_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{trackingResult.assigned_officer_name}</p>
                          <p className="text-[11px] text-slate-500">{trackingResult.department || "Municipal Wing"}</p>
                        </div>
                      </div>
                      {trackingResult.officer_notes && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block">Officer Inspection Note:</span>
                          <span className="text-xs font-semibold text-slate-700">{trackingResult.officer_notes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Ticket is currently under automated zonal review; field officer assignment will be completed shortly.
                    </div>
                  )}
                </div>

                {/* Summary details */}
                <div className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Issue Reported</span>
                  <p className="mb-2 font-medium">{trackingResult.text}</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Location</span>
                  <p className="text-slate-600 font-medium">{trackingResult.location_text || "Warangal Locality"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab: AI Chatbot */}
        {activeSubTab === "chatbot" && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">CivicSense AI Assistant</h2>
                  <p className="text-[10px] text-slate-500">RAG Grounded in Official GWMC Policies & Live Ticket Telemetry</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full">
                Live & Grounded
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
              {[
                "Water supply timings in Warangal?",
                "How to report an open garbage dump?",
                "Who repairs broken streetlights in GWMC?",
                "Track ticket GWMC-..."
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 whitespace-nowrap transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none shadow-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                        Source: {m.sources.join(", ")}
                      </div>
                    )}
                  </div>
                  {m.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">
                      You
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                    AI
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none p-3 text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Consulting municipal guidelines...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-2 border-t border-slate-200"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question or enter Ticket ID..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Submission Dossier Modal */}
      <SubmissionDossierModal
        isOpen={showDossier}
        onClose={() => setShowDossier(false)}
      />

    </div>
  );
}
