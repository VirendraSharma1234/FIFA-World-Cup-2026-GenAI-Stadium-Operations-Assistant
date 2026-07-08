import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Globe, Award, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { ChatMessage, UserRole } from "../types";

interface CopilotChatProps {
  role: UserRole;
  language: string;
  setLanguage: (lang: string) => void;
  seatCode: string;
  setSeatCode: (code: string) => void;
  ticketTier: string;
  setTicketTier: (tier: string) => void;
  onTriggerAction: (actionType: string, payload: string) => void;
  activeAlertContext?: any;
}

export function CopilotChat({
  role,
  language,
  setLanguage,
  seatCode,
  setSeatCode,
  ticketTier,
  setTicketTier,
  onTriggerAction,
  activeAlertContext
}: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "👋 **Welcome to the FIFA World Cup 2026 Matchday Hub!** I am your GenAI Operations Co-Pilot. I am fully customized based on your scanned seat location, language, and ticket tier. Ask me anything about finding your gates, transport schedules, accessibility routes, or green cup-recycling rewards!",
      timestamp: new Date(),
      category: "general"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Languages supported
  const languages = [
    { code: "English", label: "English" },
    { code: "Spanish", label: "Español (MEX)" },
    { code: "French", label: "Français (CAN)" },
    { code: "Portuguese", label: "Português" },
    { code: "Arabic", label: "العربية" }
  ];

  // Presets based on role
  const fanPresets = [
    { label: "♿ Nearest Ramp Route", query: "Where is the nearest wheelchair ramp from my seat?" },
    { label: "♻️ Recycling Reward", query: "How do I return my reusable cup to earn green points?" },
    { label: "🚇 Train back home", query: "What is the fastest way to get back to the subway transit line?" }
  ];

  const staffPresets = [
    { label: "🚨 Medical protocol", query: "What is the official rapid protocol if a fan collapses near Section 104?" },
    { label: "🗑️ Overflowing bin text", query: "Help me write a professional dispatch text for an overflowing green recycling bin at Concession 4." },
    { label: "📢 Evacuation script", query: "Draft an urgent but calm crowd control announcement script because of a Gate congestion emergency." }
  ];

  const presets = role === "fan" ? fanPresets : staffPresets;

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          role,
          seatCode,
          language,
          ticketTier,
          currentIncidentContext: activeAlertContext
        })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.text,
        timestamp: new Date(),
        category: data.category,
        actionableLink: data.actionableLink
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "system",
          text: "⚠️ Matchday data connection is currently saturated. Please try re-sending shortly.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col h-[560px] justify-between">
      {/* Header with Context Settings */}
      <div className="border-b border-slate-800 pb-4 mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Gemini AI Matchday Co-Pilot
            </h3>
          </div>
          {/* Language selection dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-300 outline-none font-mono cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-950 text-slate-300">
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Context Parameters Input */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[11px] font-mono">
          <div>
            <label className="text-slate-400 block mb-1 uppercase text-[9px]">Scanned Seat Section:</label>
            <input
              type="text"
              value={seatCode}
              onChange={(e) => setSeatCode(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500/50"
              placeholder="e.g. S104-Gate C"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 uppercase text-[9px]">Ticket Tier / Access:</label>
            <select
              value={ticketTier}
              onChange={(e) => setTicketTier(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded px-1.5 py-1 text-slate-200 outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="General Admission">Category 3 (GA)</option>
              <option value="Category 2 & Club">Category 2 Seats</option>
              <option value="VIP Suite">VIP Hospitality Suite</option>
              <option value="ADA Accessible">ADA Ramps Access</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.map((msg) => {
          const isAssistant = msg.sender === "assistant";
          const isUser = msg.sender === "user";
          const isSystem = msg.sender === "system";

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              {/* Sender Tag */}
              <span className="text-[9px] text-slate-400 font-mono mb-0.5">
                {isAssistant ? "✨ GEMINI MATCHDAY CO-PILOT" : isUser ? "YOU" : "SYSTEMALERT"}
              </span>

              {/* Message Bubble */}
              <div
                className={`rounded-xl p-3 text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? "bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-950/40"
                    : isSystem
                    ? "bg-rose-950/50 text-rose-300 border border-rose-900/50"
                    : "bg-slate-950 text-slate-300 rounded-tl-none border border-slate-800/80"
                }`}
              >
                {/* Basic rendering of text lines */}
                {msg.text.split("\n").map((para, pIdx) => (
                  <p key={pIdx} className={pIdx > 0 ? "mt-1.5" : ""}>
                    {para}
                  </p>
                ))}

                {/* Display category Badge */}
                {msg.category && msg.category !== "general" && (
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[9px] bg-slate-900 text-cyan-400 border border-cyan-900/40 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-wider">
                      {msg.category} context
                    </span>
                  </div>
                )}

                {/* Render Interactive Action Button if returned from Gemini */}
                {msg.actionableLink && (
                  <div className="mt-3 pt-2.5 border-t border-slate-900">
                    <button
                      onClick={() => onTriggerAction(msg.actionableLink!.actionType, msg.actionableLink!.payload)}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-md shadow-lg shadow-cyan-950/60 uppercase transition-all duration-300"
                    >
                      <span>{msg.actionableLink.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-start max-w-[80%] mr-auto">
            <span className="text-[9px] text-slate-400 font-mono mb-0.5">
              ✨ GEMINI IS COMPUTING MATCHDAY FLOWS...
            </span>
            <div className="bg-slate-950 text-slate-300 rounded-xl rounded-tl-none border border-slate-900 p-3 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              <span className="italic font-mono">Routing tactical query...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input box & Presets */}
      <div className="space-y-3">
        {/* Helper query presets */}
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, pIdx) => (
            <button
              key={pIdx}
              onClick={() => sendMessage(preset.query)}
              className="text-[10px] font-mono bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-md px-2.5 py-1.5 transition-all text-left"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-xl p-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={role === "fan" ? "Ask your matchday AI Co-Pilot..." : "Query emergency playbook protocols..."}
            className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-400 text-xs md:text-sm px-2.5 py-2 outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            className="p-2 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 rounded-lg text-white transition-all disabled:opacity-50"
            disabled={!input.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
