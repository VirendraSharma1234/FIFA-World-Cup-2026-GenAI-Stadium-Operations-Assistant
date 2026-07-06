/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Users,
  Compass,
  MessageSquare,
  AlertTriangle,
  Activity,
  UserCheck,
  TrendingUp,
  MapPin,
  Clock,
  Accessibility,
  CheckCircle2,
  Send,
  Sparkles,
  Search,
  Train,
  Coffee,
  ArrowRight,
  RefreshCw,
  Zap,
  Volume2,
  Navigation,
  Check,
  Smartphone,
  Layers,
  HeartPulse,
  Award,
  Sun,
  Moon
} from "lucide-react";
import {
  StadiumState,
  GateMetric,
  ZoneMetric,
  RestroomMetric,
  ConcessionMetric,
  TransitMetric,
  ActiveIncident,
  ChatMessage,
  StaffRecommendation,
  FanAlert
} from "./types";

export default function App() {
  // Theme Management
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("stadium-assistant-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    }
    return "dark"; // Default theme
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("stadium-assistant-theme", theme);
  }, [theme]);

  // Mode selection: 'staff' (Command Center) or 'fan' (Personalized Companion)
  const [activeView, setActiveView] = useState<'staff' | 'fan'>('staff');
  
  // App State fetched from server
  const [stadiumState, setStadiumState] = useState<StadiumState | null>(null);
  const [recommendations, setRecommendations] = useState<StaffRecommendation[]>([]);
  const [alerts, setAlerts] = useState<FanAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-clear success messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Selected Stadium Config
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>("metlife");

  // Chat States (Staff Assistant)
  const [staffChat, setStaffChat] = useState<ChatMessage[]>([
    {
      id: "welcome_staff",
      role: "assistant",
      content: "FIFA Stadium Operations Assistant online. Command Center terminal configured. How can I assist you with crowd control, resource planning, or real-time incident mitigation?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [staffInput, setStaffInput] = useState<string>("");
  const [isStaffTyping, setIsStaffTyping] = useState<boolean>(false);

  // Chat States (Fan Assistant)
  const [fanChat, setFanChat] = useState<ChatMessage[]>([
    {
      id: "welcome_fan",
      role: "assistant",
      content: "Welcome to the FIFA World Cup 2026! ⚽\nI am your Personalized Fan Companion. I can help you find food, restrooms, exits, and provide real-time step-by-step directions. How can I help you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [fanInput, setFanInput] = useState<string>("");
  const [isFanTyping, setIsFanTyping] = useState<boolean>(false);
  const [fanLocation, setFanLocation] = useState<string>("South Plaza Gate C");
  const [isAccessibilityMode, setIsAccessibilityMode] = useState<boolean>(false);

  // Simulation Form State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Custom Promotion State
  const [promoConcessionId, setPromoConcessionId] = useState<string>("conc_n1");
  const [promoText, setPromoText] = useState<string>("Get FREE soft drink with any Burger purchase!");

  // Refs for auto-scrolling chats
  const staffChatEndRef = useRef<HTMLDivElement>(null);
  const fanChatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats
  useEffect(() => {
    staffChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [staffChat, isStaffTyping]);

  useEffect(() => {
    fanChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fanChat, isFanTyping]);

  // Fetch complete state from backend
  const fetchStadiumState = async (silently: boolean = false) => {
    if (!silently) setIsLoading(true);
    try {
      const res = await fetch("/api/stadium-state");
      if (!res.ok) throw new Error("Could not retrieve current operations state.");
      const data = await res.json();
      setStadiumState(data.state);
      setRecommendations(data.recommendations);
      setAlerts(data.alerts);
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to communicate with stadium telemetry stream.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Fetch & Poll every 10 seconds for real-time update visualizer
  useEffect(() => {
    fetchStadiumState();
    const interval = setInterval(() => {
      fetchStadiumState(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Stadium Switch
  const handleStadiumChange = async (stadiumId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stadium-state/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stadiumId })
      });
      if (!res.ok) throw new Error("Error switching stadium configuration.");
      const data = await res.json();
      setStadiumState(data.state);
      setRecommendations(data.recommendations);
      setAlerts(data.alerts);
      setSelectedStadiumId(stadiumId);
      
      // Reset chats for new context
      setStaffChat([
        {
          id: `welcome_staff_${stadiumId}`,
          role: "assistant",
          content: `Stadium Operations Assistant online for ${data.state.stadium.name}. Telemetry systems initialized. Ask me for recommendations or command center analytics.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setFanChat([
        {
          id: `welcome_fan_${stadiumId}`,
          role: "assistant",
          content: `Welcome to ${data.state.stadium.name}! ⚽\nI am your Personalized Fan Companion. Ask me for step-by-step navigation, facility wait times, or accessible pathways.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Operational Incident
  const triggerIncident = async (category: 'MEDICAL' | 'SECURITY' | 'TRANSIT') => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulate-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category })
      });
      if (!res.ok) throw new Error("Error submitting simulation scenario.");
      await fetchStadiumState(true);
      setSuccessMsg(`Operational incident (${category}) ingested & simulated successfully!`);
    } catch (err: any) {
      setErrorMsg("Simulation failed: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Resolve Operational Incident
  const resolveIncident = async (incidentId: string) => {
    try {
      const res = await fetch("/api/resolve-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId })
      });
      if (!res.ok) throw new Error("Could not clear or resolve the incident.");
      await fetchStadiumState(true);
      setSuccessMsg("Incident resolved and state synchronized.");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Implement Recommendation
  const implementRecommendation = async (recId: string) => {
    try {
      const res = await fetch("/api/implement-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recId })
      });
      if (!res.ok) throw new Error("Failed to flag recommendation as active.");
      await fetchStadiumState(true);
      setSuccessMsg("Action plan deployed & stewards dispatched successfully.");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Push Concession Deal Alert to Attendees
  const pushConcessionDeal = async () => {
    try {
      const res = await fetch("/api/concession-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concessionId: promoConcessionId,
          discountText: promoText
        })
      });
      if (!res.ok) throw new Error("Failed to deploy promotion.");
      await fetchStadiumState(true);
      setSuccessMsg("Halftime/concession promotion broadcasted to all active Companion Apps successfully!");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Submit Staff Operations Chat to Gemini
  const submitStaffChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffInput.trim()) return;

    const userMsg: ChatMessage = {
      id: "staff_" + Date.now(),
      role: "user",
      content: staffInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setStaffChat(prev => [...prev, userMsg]);
    const inputToSend = staffInput;
    setStaffInput("");
    setIsStaffTyping(true);

    try {
      const res = await fetch("/api/staff-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputToSend,
          chatHistory: staffChat.slice(-10) // Pass last few conversations
        })
      });

      if (!res.ok) throw new Error("Operations AI offline or overloaded.");
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: "staff_ai_" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString()
      };
      setStaffChat(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setStaffChat(prev => [
        ...prev,
        {
          id: "staff_err_" + Date.now(),
          role: "assistant",
          content: `⚠️ Error communicating with Gemini Operations Strategy Engine: ${err.message}. Please verify your server API Key settings.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsStaffTyping(false);
    }
  };

  // Submit Fan Companion Chat to Gemini
  const submitFanChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fanInput.trim()) return;

    const userMsg: ChatMessage = {
      id: "fan_" + Date.now(),
      role: "user",
      content: fanInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setFanChat(prev => [...prev, userMsg]);
    const inputToSend = fanInput;
    setFanInput("");
    setIsFanTyping(true);

    try {
      const res = await fetch("/api/fan-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputToSend,
          chatHistory: fanChat.slice(-10),
          userLocation: fanLocation,
          isAccessibilityMode
        })
      });

      if (!res.ok) throw new Error("Fan companion server unresponsive.");
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: "fan_ai_" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString()
      };
      setFanChat(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setFanChat(prev => [
        ...prev,
        {
          id: "fan_err_" + Date.now(),
          role: "assistant",
          content: `⚠️ Error with Fan Support Engine: ${err.message}. Please verify the Gemini configuration.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsFanTyping(false);
    }
  };

  // Quick navigation prompt triggers for fan companion
  const sendQuickFanPrompt = (promptText: string) => {
    setFanInput(promptText);
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300 ${theme}`}>
      
      {/* GLOBAL BANNER / HEADER */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo & FIFA World Cup 2026 Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  FIFA Host City Hub
                </span>
                <span className="text-[10px] tracking-widest font-mono uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  GenAI Stadium Ops
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-display font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                WORLD CUP 2026 <span className="text-blue-600 dark:text-blue-400 font-normal">STADIUM ASSISTANT</span>
              </h1>
            </div>
          </div>

          {/* Quick Stats Banner & Selector */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Host Stadium Selector */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex items-center transition-colors duration-300">
              <label className="text-xs text-slate-500 dark:text-slate-400 px-2 font-mono">STADIUM:</label>
              <select
                value={selectedStadiumId}
                onChange={(e) => handleStadiumChange(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-800 dark:text-white font-medium focus:outline-none border-none py-1 px-2 rounded cursor-pointer transition-colors duration-300"
              >
                <option value="metlife">MetLife Stadium (NY/NJ)</option>
                <option value="azteca">Estadio Azteca (CDMX)</option>
                <option value="bcplace">BC Place (Vancouver)</option>
              </select>
            </div>

            {/* State Refresher */}
            <button
              onClick={() => fetchStadiumState()}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Telemetry State"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-800"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-1 flex border border-slate-200 dark:border-slate-800 transition-colors duration-300 relative">
              <button
                onClick={() => setActiveView('staff')}
                className={`relative px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide flex items-center gap-2 transition-all z-10 select-none cursor-pointer ${
                  activeView === 'staff'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeView === 'staff' && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-blue-600 rounded-md -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Shield className="w-3.5 h-3.5" />
                Staff Operations
              </button>
              <button
                onClick={() => setActiveView('fan')}
                className={`relative px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide flex items-center gap-2 transition-all z-10 select-none cursor-pointer ${
                  activeView === 'fan'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeView === 'fan' && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-emerald-600 rounded-md -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Smartphone className="w-3.5 h-3.5" />
                Fan Companion App
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MATCH LIVE FOOTER TICKER */}
      {stadiumState && (
        <div className="bg-gradient-to-r from-blue-100/40 via-slate-100/40 to-emerald-100/40 dark:from-blue-950/40 dark:via-slate-900/40 dark:to-emerald-950/40 border-b border-slate-200 dark:border-slate-800 py-2 px-4 text-xs font-mono text-slate-800 dark:text-slate-300 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-500 dark:text-red-400 font-bold tracking-wider">LIVE TELEMETRY:</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                ⚽ {stadiumState.match.team1} {stadiumState.match.score1} - {stadiumState.match.score2} {stadiumState.match.team2}
              </span>
              <span className="text-slate-700 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                {stadiumState.match.half === "HALFTIME" ? "HALFTIME" : `${stadiumState.match.minute}'`}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Attendance: <strong className="text-emerald-600 dark:text-emerald-400">{stadiumState.match.attendance.toLocaleString()}</strong> / {stadiumState.stadium.capacity.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[10px]">
              <div>City: <span className="text-slate-800 dark:text-slate-200">{stadiumState.stadium.city}</span></div>
              <div className="h-3 w-px bg-slate-300 dark:bg-slate-800"></div>
              <div>System Health: <span className="text-emerald-600 dark:text-emerald-400">ONLINE</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR CORNER WARNING */}
      {errorMsg && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-200 text-sm py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 text-xs">Dismiss</button>
        </div>
      )}

      {/* SUCCESS CORNER FEEDBACK */}
      {successMsg && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 text-sm py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 text-xs">Dismiss</button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">

        {/* LOADING INDICATOR */}
        {isLoading && !stadiumState && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
            <p className="font-mono text-sm tracking-widest">INGESTING STADIUM DATA STREAMS...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === 'staff' && stadiumState ? (
            <motion.div
              key="staff-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
            
            {/* LEFT COLUMN: SIMULATORS & RECOMMENDATIONS (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* INCIDENT MANAGEMENT SIMULATOR */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  INCIDENT INGESTION SIMULATOR
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Trigger automated real-time incidents to test Gemini's anomaly recognition, triage dispatch recommendations, and live fan app warnings.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    onClick={() => triggerIncident('MEDICAL')}
                    disabled={isSimulating}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="p-3 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-950/80 border border-red-200 dark:border-red-800/80 rounded-xl text-center group transition-all text-red-800 dark:text-red-200 cursor-pointer"
                  >
                    <HeartPulse className="w-5 h-5 mx-auto text-red-600 dark:text-red-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono font-bold block uppercase">Medical</span>
                  </motion.button>

                  <motion.button
                    onClick={() => triggerIncident('SECURITY')}
                    disabled={isSimulating}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="p-3 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 rounded-xl text-center group transition-all text-amber-800 dark:text-amber-200 cursor-pointer"
                  >
                    <Shield className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono font-bold block uppercase">Security</span>
                  </motion.button>

                  <motion.button
                    onClick={() => triggerIncident('TRANSIT')}
                    disabled={isSimulating}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="p-3 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 rounded-xl text-center group transition-all text-blue-800 dark:text-blue-200 cursor-pointer"
                  >
                    <Train className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono font-bold block uppercase">Transit</span>
                  </motion.button>
                </div>
              </div>

              {/* AUTOMATED AI STRATEGIC RECOMMENDATIONS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    REAL-TIME DECISION SUPPORT
                  </span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono px-2 py-0.5 rounded-full">
                    {recommendations.length} Active
                  </span>
                </h3>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {recommendations.length === 0 ? (
                      <motion.div
                        key="no-recs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-slate-500 text-xs font-mono"
                      >
                        No critical actions recommended currently.
                      </motion.div>
                    ) : (
                      recommendations.map((rec) => (
                        <motion.div
                          key={rec.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className={`p-3.5 rounded-xl border transition-colors ${
                            rec.isImplemented
                              ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/50 opacity-60'
                              : rec.priority === 'critical'
                              ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/60 shadow-md shadow-red-900/5'
                              : rec.priority === 'high'
                              ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/60'
                              : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              rec.priority === 'critical'
                                ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                : rec.priority === 'high'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {rec.priority} priority
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{rec.timestamp}</span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{rec.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{rec.message}</p>

                          {!rec.isImplemented ? (
                            <button
                              onClick={() => implementRecommendation(rec.id)}
                              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Acknowledge & Deploy Stewards
                            </button>
                          ) : (
                            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
                              <Check className="w-3.5 h-3.5" /> DEPLOYED & MONITORING
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* BROADCAST CENTER: LOAD BALANCE CONCESSIONS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Volume2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  HALFTIME LOAD BALANCER
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Mitigate long queues by pushing dynamic snack discounts to attendee app users located near active bottleneck corridors.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">CHOOSE CONCESSION:</label>
                    <select
                      value={promoConcessionId}
                      onChange={(e) => setPromoConcessionId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                    >
                      {stadiumState.concessions.map(c => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                          {c.name} (Wait: {c.waitTimeMinutes}m, Level: {c.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">CAMPAIGN PROMOTION TEXT:</label>
                    <input
                      type="text"
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 font-medium transition-colors duration-300"
                    />
                  </div>

                  <button
                    onClick={pushConcessionDeal}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase"
                  >
                    <Zap className="w-4 h-4" />
                    Broadcast Deal To Fans
                  </button>
                </div>
              </div>

            </div>

            {/* MIDDLE COLUMN: LIVE METRICS & FEEDBACK MAPS (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* STADIUM LAYOUT MAP PLATFORM - STATIC VISUALIZER */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    STADIUM HEATMAP CHANNELS
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                    Active Sectors
                  </span>
                </h3>

                {/* Simulated Stadium Map Layout */}
                <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950 aspect-[4/3] p-4 flex flex-col justify-between overflow-hidden transition-colors duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  {/* Outer stadium outline representation */}
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center">
                    <div className="w-2/3 h-2/3 rounded-full border border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 relative">
                      
                      {/* Inner Soccer Pitch */}
                      <div className="w-20 h-10 border border-slate-300 dark:border-slate-700 bg-emerald-50/20 dark:bg-emerald-950/20 rounded flex items-center justify-center">
                        <div className="w-10 h-full border-r border-slate-300 dark:border-slate-700"></div>
                      </div>
                      <span className="absolute text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest bottom-2">FIELD</span>

                      {/* Overcrowded indicator blinking */}
                      <div className="absolute top-1/4 right-3 flex flex-col items-center">
                        <span className="h-3.5 w-3.5 rounded-full bg-red-500 animate-ping absolute"></span>
                        <span className="h-3.5 w-3.5 rounded-full bg-red-600 border border-white"></span>
                        <span className="text-[8px] font-mono text-red-600 dark:text-red-400 font-bold bg-white dark:bg-slate-950 px-1 rounded mt-1 shadow border border-slate-200 dark:border-slate-800">
                          S120 Squeeze
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Quad Sectors Indicators */}
                  <div className="flex justify-between items-start z-10">
                    <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-center min-w-[70px] shadow-sm transition-colors duration-300">
                      <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">NORTH</div>
                      <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">78% DENSE</div>
                    </div>
                    <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-center min-w-[70px] shadow-sm transition-colors duration-300">
                      <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">EAST</div>
                      <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">65% DENSE</div>
                    </div>
                  </div>

                  {/* Quad Sectors Indicators Bottom */}
                  <div className="flex justify-between items-end z-10">
                    <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-center min-w-[70px] shadow-sm transition-colors duration-300">
                      <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">WEST</div>
                      <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">70% DENSE</div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-red-300 dark:border-red-900 p-2 rounded-lg text-center min-w-[70px] shadow-lg shadow-red-950/10 dark:shadow-red-950/20">
                      <div className="text-[10px] font-semibold text-red-600 dark:text-red-200">SOUTH</div>
                      <div className="text-[9px] font-mono text-red-600 dark:text-red-400 font-bold animate-pulse">82% HIGH</div>
                    </div>
                  </div>

                  {/* Map Pin Guide */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-500 mx-auto drop-shadow" />
                      <span className="text-[9px] font-mono text-slate-700 dark:text-slate-400 uppercase bg-white/95 dark:bg-slate-950/90 px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
                        METLIFE HQ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVE INCIDENTS INCIDENT FEED */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                    LIVE ALERTS & TELEMETRY
                  </span>
                  <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-mono px-2 py-0.5 rounded-full">
                    {stadiumState.incidents.length} Critical
                  </span>
                </h3>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {stadiumState.incidents.length === 0 ? (
                      <motion.div
                        key="no-incidents"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-10 text-slate-500 text-xs font-mono"
                      >
                        🎉 No active stadium incidents. All systems nominal.
                      </motion.div>
                    ) : (
                      stadiumState.incidents.map((inc) => (
                        <motion.div
                          key={inc.id}
                          layout
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className={`p-3.5 rounded-xl border transition-colors ${
                            inc.status === 'RESOLVED'
                              ? 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 opacity-50'
                              : inc.severity === 'CRITICAL'
                              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/80 shadow-md shadow-red-950/5 dark:shadow-red-950/20'
                              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full mr-2 ${
                                inc.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
                              }`}>
                                {inc.severity}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400">{inc.timestamp}</span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              inc.status === 'RESOLVED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : inc.status === 'DISPATCHED'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {inc.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">{inc.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">{inc.description}</p>
                          
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-150 dark:border-slate-800 mb-3">
                            <strong className="text-slate-800 dark:text-slate-300">LOC:</strong> {inc.location}
                          </div>

                          {inc.status !== 'RESOLVED' ? (
                            <button
                              onClick={() => resolveIncident(inc.id)}
                              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors uppercase tracking-wider cursor-pointer"
                            >
                              Mark As Resolved
                            </button>
                          ) : (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono text-center flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Incident Handled & Cleared
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* SOCIAL MEDIA SENTIMENT CARD */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  FAN SENTIMENT STREAM
                </h3>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-2.5 rounded-xl">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono block uppercase">Positive</span>
                    <strong className="text-lg text-emerald-700 dark:text-emerald-300 font-bold">{stadiumState.sentiment.positivePercentage}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block uppercase">Neutral</span>
                    <strong className="text-lg text-slate-800 dark:text-slate-200 font-bold">{stadiumState.sentiment.neutralPercentage}%</strong>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-2.5 rounded-xl">
                    <span className="text-xs text-red-600 dark:text-red-400 font-mono block uppercase">Negative</span>
                    <strong className="text-lg text-red-700 dark:text-red-300 font-bold">{stadiumState.sentiment.negativePercentage}%</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Trending Social Mentions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {stadiumState.sentiment.trendingKeywords.map((tag, idx) => (
                      <span key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-mono px-2 py-1 rounded transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: REAL-TIME STRATEGIC OPERATIONS CHAT (4 COLS) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col h-[670px] overflow-hidden transition-colors duration-300">
              
              {/* Chat Title bar */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/30 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Shield className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-black">
                      OPERATIONS INTELLIGENCE
                    </h3>
                    <h2 className="text-sm font-display font-black text-slate-900 dark:text-white">
                      COMMAND STRATEGY CHAT
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase">Gemini 3.5</span>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {staffChat.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-wider">
                        {msg.role === 'user' ? 'Ops Officer' : 'Gemini Director'} • {msg.timestamp}
                      </div>
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none font-mono font-light transition-colors duration-300 shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isStaffTyping && (
                  <div className="flex flex-col max-w-[85%] mr-auto items-start">
                    <span className="text-[9px] font-mono text-slate-500 mb-1">Analyzing Telemetry State...</span>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-3 rounded-xl rounded-tl-none text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 transition-colors duration-300">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200"></span>
                      </div>
                      Processing mitigation scenario rules...
                    </div>
                  </div>
                )}
                <div ref={staffChatEndRef}></div>
              </div>

              {/* Chat Input panel */}
              <form onSubmit={submitStaffChat} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 shrink-0 transition-colors duration-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={staffInput}
                    onChange={(e) => setStaffInput(e.target.value)}
                    placeholder="Ask operations strategy... e.g., 'Draft crowd strategy for Gate B'"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    disabled={isStaffTyping || !staffInput.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex gap-1 justify-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStaffInput("Provide evacuation plan for North Concourse.")}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    🚨 Evac Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffInput("Draft crowd strategy for Gate B scenario.")}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    🚶 Gate B Mitigation
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffInput("Suggest medical redeployment coordinates.")}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    🚑 Medical Shift
                  </button>
                </div>
              </form>

            </div>

          </motion.div>
        ) : activeView === 'fan' && stadiumState ? (
          <motion.div
            key="fan-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            
            {/* LEFT COLUMN: ACTIVE USER COMPASS PANEL (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* CURRENT FAN CONFIGURATION COMPASS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Compass className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  PERSONALIZED PROFILE COMPASS
                </h3>

                <div className="space-y-4">
                  {/* Current Location Config */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block mb-1">
                      📍 Set Your Location in Stadium:
                    </label>
                    <select
                      value={fanLocation}
                      onChange={(e) => setFanLocation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors duration-300"
                    >
                      <option value="Gate A (North Entrance) Queue">Gate A (North Entrance) Plaza</option>
                      <option value="Gate B (East Entrance) Plaza">Gate B (East Entrance) Plaza</option>
                      <option value="South Plaza Gate C">Gate C (South Plaza Entrance)</option>
                      <option value="Lower Tier, Section 120 (South Corridor)">Section 120 (South Concourse)</option>
                      <option value="Upper Tier, Section 315 Row 12">Section 315 (Upper Tier Level)</option>
                      <option value="Club Suites Elevator Lobby B">Club Suites Lobby</option>
                    </select>
                  </div>

                  {/* ACCESSIBILITY COMPLIANCE SWITCH */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between transition-colors duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Accessibility className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Accessibility Route Support</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">Step-free paths, elevators, ramps</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAccessibilityMode}
                        onChange={() => setIsAccessibilityMode(!isAccessibilityMode)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Call Guest Services Button */}
                  <button
                    onClick={() => {
                      setFanChat(prev => [
                        ...prev,
                        {
                          id: "call_guest_help_" + Date.now(),
                          role: "user",
                          content: "I need physical guest support at my location please.",
                          timestamp: new Date().toLocaleTimeString()
                        },
                        {
                          id: "call_guest_help_ai_" + Date.now(),
                          role: "assistant",
                          content: "🔔 Request transmitted! A stadium guest representative (Steward Team Charlie) has been dispatched to assist you at **" + fanLocation + "**. Estimated response time is under 4 minutes. Please remain at your current location.",
                          timestamp: new Date().toLocaleTimeString()
                        }
                      ]);
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" /> Call Guest Services Steward
                  </button>

                </div>
              </div>

              {/* CONCESSIONS & WAITING TIMES PANEL */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    CONCESSION CORRIDORS
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                    Halftime Queue Check
                  </span>
                </h3>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {stadiumState.concessions.map((conc) => (
                    <motion.div
                      key={conc.id}
                      onClick={() => sendQuickFanPrompt(`Provide step-by-step navigation from my location to ${conc.name}. Can you tell me what food options are available?`)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 hover:border-emerald-600/50 dark:hover:border-emerald-600/50 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {conc.name}
                        </h4>
                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            conc.waitTimeMinutes >= 15
                              ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                              : conc.waitTimeMinutes >= 8
                              ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {conc.waitTimeMinutes} Min Wait
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>Level {conc.level} • {conc.cuisine}</span>
                        {conc.isAccessible && <span className="text-emerald-600 dark:text-emerald-400">♿ Accessible</span>}
                      </div>

                      {conc.activePromotion && (
                        <div className="mt-2 bg-gradient-to-r from-emerald-50/50 to-slate-50 dark:from-emerald-950/40 dark:to-slate-950 border border-emerald-100 dark:border-emerald-900/50 rounded p-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 transition-colors">
                          <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span>DEAL: {conc.activePromotion}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* MIDDLE COLUMN: REAL-TIME TICKER & RESTROOM WAITS (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* ACCESSIBLE & GENDER RECONCILING RESTROOMS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Accessibility className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    RESTROOM QUEUES & ACCESSIBILITY
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                    Sensor Telemetry
                  </span>
                </h3>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {stadiumState.restrooms.map((rest) => (
                    <motion.div
                      key={rest.id}
                      onClick={() => sendQuickFanPrompt(`How do I walk to ${rest.name}? Does it support step-free paths?`)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rest.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Gender: {rest.gender.replace('_', ' ')} • Level {rest.level}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-mono font-bold ${
                            rest.waitTimeMinutes >= 12 ? 'text-red-600 dark:text-red-400' : rest.waitTimeMinutes >= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {rest.waitTimeMinutes} Min Wait
                          </div>
                          <span className={`text-[9px] font-mono ${
                            rest.cleanlinessStatus === 'NEEDS_CLEANING' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {rest.cleanlinessStatus}
                          </span>
                        </div>
                      </div>
                      {rest.isAccessible && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                          <Accessibility className="w-3 h-3" /> Step-free access / wheelchair equipped
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* LIVE TRANSIT & DEPARTURE DELAYS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Train className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  TRANSIT DEPARTURES CHANNELS
                </h3>

                <div className="space-y-3">
                  {stadiumState.transit.map((tr) => (
                    <div
                      key={tr.id}
                      className={`p-3 rounded-xl border transition-colors duration-300 ${
                        tr.status === 'DELAYED'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                          : tr.status === 'SUSPENDED'
                          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {tr.name}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          tr.status === 'DELAYED'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            : tr.status === 'SUSPENDED'
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {tr.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>Arrival: <strong className="text-slate-800 dark:text-white">{tr.nextArrivalMinutes}m</strong></span>
                        <span>Congestion: <strong className={tr.congestionLevel === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}>{tr.congestionLevel}</strong></span>
                      </div>

                      {tr.delayMinutes > 0 && (
                        <div className="mt-1.5 text-[9px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>Delay Factor: {tr.delayMinutes} mins signaling holdout</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE NOTIFICATIONS PUSH LIST */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-300">
                <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  REAL-TIME FAN NOTIFICATIONS
                </h3>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-colors duration-300 ${
                        al.category === 'danger'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200'
                          : al.category === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
                          : al.category === 'deal'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between mb-0.5 text-xs text-slate-900 dark:text-white">
                        <span>{al.title}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-normal">{al.timestamp}</span>
                      </div>
                      {al.message}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: MULTILINGUAL FAN CHAT COMPANION (4 COLS) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col h-[670px] overflow-hidden transition-colors duration-300">
              
              {/* Chat Title bar */}
              <div className="bg-gradient-to-r from-emerald-50 to-slate-50 dark:from-emerald-900/30 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Compass className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-black">
                      REAL-TIME MULTILINGUAL CONCIERGE
                    </h3>
                    <h2 className="text-sm font-display font-black text-slate-900 dark:text-white">
                      FAN COMPANION CHAT
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase">Gemini 3.5</span>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {fanChat.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-wider">
                        {msg.role === 'user' ? 'Attendee' : 'FIFA Guide'} • {msg.timestamp}
                      </div>
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium transition-colors duration-300 shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isFanTyping && (
                  <div className="flex flex-col max-w-[85%] mr-auto items-start">
                    <span className="text-[9px] font-mono text-slate-500 mb-1">Mapping route paths...</span>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-3 rounded-xl rounded-tl-none text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 transition-colors duration-300">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                      </div>
                      Analyzing crowd queues...
                    </div>
                  </div>
                )}
                <div ref={fanChatEndRef}></div>
              </div>

              {/* Chat Input panel */}
              <form onSubmit={submitFanChat} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 shrink-0 transition-colors duration-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fanInput}
                    onChange={(e) => setFanInput(e.target.value)}
                    placeholder="Ask FIFA Companion... (try Spanish, French, etc.)"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    disabled={isFanTyping || !fanInput.trim()}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex gap-1 justify-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFanInput("How do I reach Section 205? Are there stairs or can I use an elevator?")}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    🗺️ Walk Section 205
                  </button>
                  <button
                    type="button"
                    onClick={() => setFanInput("¿Dónde puedo comprar tacos o comida mexicana y cuánto tiempo es la espera?")}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    🌮 Tacos (ES)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFanInput("Where is the nearest accessible restroom with low wait times?")}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    ♿ Restrooms
                  </button>
                </div>
              </form>

            </div>

          </motion.div>
        ) : null}
      </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-600 font-mono transition-colors duration-300">
        <p>© FIFA World Cup 2026 GenAI Operations Network. Real-Time Security, Ingress & Accessibility Orchestration.</p>
      </footer>
    </div>
  );
}
