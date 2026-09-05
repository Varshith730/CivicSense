import React, { useState } from "react";
import { Bot, Send, User, Sparkles, ShieldCheck } from "lucide-react";
import { askAssistant } from "../api";

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am the CivicSense AI Assistant. I provide verified intelligence regarding civic triage, UN SDG 11 alignment, multi-modal evidence processing, and responsible AI governance.",
      source: "CivicSense Verified Knowledge Base"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "How is the 6-factor severity scored?",
    "Explain duplicate detection with SBERT embeddings",
    "What is the primary target under SDG 11?",
    "How does CLIP computer vision handle images?",
    "What are the Responsible AI rules for municipal officers?",
    "How are geographic hotspots detected?"
  ];

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAssistant(q);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, source: res.source }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an issue accessing the knowledge base.", source: "Error" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Bot className="w-3.5 h-3.5" />
          <span>Grounded Retrieval-Augmented Assistant</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Civic Intelligence Knowledge Assistant</h1>
        <p className="text-xs text-slate-500 mt-1">
          Query the system regarding SDG indicators, scoring rules, computer vision confidence thresholds, and municipal guidelines.
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 rounded-xl shadow-sm transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-soft flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs sm:text-sm ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-xl space-y-1.5 ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white font-medium rounded-tr-none"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-medium"
                }`}
              >
                <p className="leading-relaxed">{m.content}</p>
                {m.source && (
                  <div className="text-[10px] text-emerald-700/80 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Source: {m.source}</span>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="w-4 h-4 animate-bounce text-emerald-600" />
              <span>Retrieving grounded response...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about CivicSense AI, SDG 11, or triage rules..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
