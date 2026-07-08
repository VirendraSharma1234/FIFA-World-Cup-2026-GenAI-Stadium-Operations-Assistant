import React, { useState } from "react";
import { HeroSection } from "./components/HeroSection";
import { ChallengeCards } from "./components/ChallengeCards";
import { BackgroundAnimations } from "./components/BackgroundAnimations";
import { CustomCursor } from "./components/CustomCursor";
import { ImpactBars } from "./components/ImpactBars";
import { StadiumMap } from "./components/StadiumMap";
import { CopilotChat } from "./components/CopilotChat";
import { StaffDashboard } from "./components/StaffDashboard";
import { FanHub } from "./components/FanHub";
import { GateStatus, StadiumIncident, TransitLine, UserRole } from "./types";
import { Shield, Eye, Compass, Trophy, Footprints, AlertCircle, Sparkles, VolumeX } from "lucide-react";

export default function App() {
  // Personas toggles
  const [role, setRole] = useState<UserRole>("fan");

  // State managers
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [showAdaPaths, setShowAdaPaths] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("English");
  const [seatCode, setSeatCode] = useState<string>("None - Scan ticket to sync");
  const [ticketTier, setTicketTier] = useState<string>("General Admission");
  const [ecoPoints, setEcoPoints] = useState<number>(85);
  const [loadingPlaybookId, setLoadingPlaybookId] = useState<string | null>(null);

  // Simulated Gates data
  const [gates, setGates] = useState<GateStatus[]>([
    { id: "Gate A", name: "Gate A (North)", density: "high", waitTimeMinutes: 28, isOpen: true, accessible: true },
    { id: "Gate B", name: "Gate B (East)", density: "low", waitTimeMinutes: 4, isOpen: true, accessible: true },
    { id: "Gate C", name: "Gate C (South)", density: "moderate", waitTimeMinutes: 12, isOpen: true, accessible: true },
    { id: "Gate D", name: "Gate D (West)", density: "high", waitTimeMinutes: 22, isOpen: true, accessible: true }
  ]);

  // Simulated Transit Lines
  const [transitLines] = useState<TransitLine[]>([
    { id: "sub-1", name: "🏆 World Cup Special Metro Link (Gate A Plaza)", type: "subway", status: "crowded", frequencyMinutes: 3, nextDeparture: "2 mins", sustainabilityRating: "A+" },
    { id: "shuttle-eco", name: "🌱 Electric Shuttles to Eco-Parking (Gate B Hub)", type: "shuttle", status: "normal", frequencyMinutes: 5, nextDeparture: "4 mins", sustainabilityRating: "A+" },
    { id: "express-train", name: "🚄 FIFA Interstate Express Line", type: "train", status: "normal", frequencyMinutes: 15, nextDeparture: "11 mins", sustainabilityRating: "A" }
  ]);

  // Initial Incidents logs
  const [incidents, setIncidents] = useState<StadiumIncident[]>([
    {
      id: "inc-1",
      type: "Crowd Congestion",
      location: "Gate A Plaza",
      severity: "high",
      description: "Subway arrivals are backing up at Gate A ticket turnstiles. Crowd wave velocity exceeds 2.5m/s.",
      status: "reported",
      timestamp: "10:42 AM",
      reportedBy: "sensor"
    },
    {
      id: "inc-2",
      type: "Medical Spill / Slippery",
      location: "Section 104 Ramps",
      severity: "medium",
      description: "Spilled stadium soda near the entry ramp creating a slick surface for wheelchair users.",
      status: "reported",
      timestamp: "10:50 AM",
      reportedBy: "fan"
    },
    {
      id: "inc-3",
      type: "Broken ADA elevator Sector 312",
      location: "ADA Lift Sector 312",
      severity: "low",
      description: "Minor mechanical issue reported on Elevator 4 upper tier.",
      status: "reported",
      timestamp: "11:02 AM",
      reportedBy: "volunteer"
    }
  ]);

  // Triggered by Fan reporting crowding
  const handleFanReportConcession = (loc: string, desc: string) => {
    const newInc: StadiumIncident = {
      id: Math.random().toString(),
      type: "Concession Overcrowding",
      location: loc,
      severity: "medium",
      description: desc,
      status: "reported",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reportedBy: "fan"
    };
    setIncidents((prev) => [newInc, ...prev]);

    // Give fan eco points for participating in ops feedback!
    setEcoPoints((prev) => prev + 15);
  };

  // Trigger server-side Gemini tactical playbook generation
  const handleInvokePlaybook = async (incident: StadiumIncident) => {
    setLoadingPlaybookId(incident.id);
    try {
      const response = await fetch("/api/incident-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType: incident.type,
          location: incident.location,
          severity: incident.severity,
          description: incident.description
        })
      });

      const data = await response.json();
      if (response.ok) {
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === incident.id
              ? { ...inc, playbook: data, status: "dispatching" }
              : inc
          )
        );
      } else {
        alert(`Failed to query playbook: ${data.details || "API Error"}`);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating tactical response. Matchday API is congested.");
    } finally {
      setLoadingPlaybookId(null);
    }
  };

  // Coordinate Copilot interactive links directly to map/UI
  const handleTriggerAction = (actionType: string, payload: string) => {
    if (actionType === "highlight_gate") {
      setSelectedGateId(payload);
    } else if (actionType === "accessibility_map") {
      setShowAdaPaths(true);
    } else if (actionType === "transit_info") {
      setRole("fan");
      // Scroll to transit section if present
      const element = document.getElementById("transit-hub-section");
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Compute values for progress indicators dynamically
  // High Impact: Risk indicator (count of unresolved high/med incidents)
  const unresolvedHigh = incidents.filter((i) => i.status !== "resolved" && i.severity === "high").length;
  const unresolvedMed = incidents.filter((i) => i.status !== "resolved" && i.severity === "medium").length;
  const computedRisk = Math.min((unresolvedHigh * 30) + (unresolvedMed * 15) + 10, 100);

  // Medium Impact: Transit lines crowding percentage
  const computedTransitLoad = 62; // Constant matching normal operation level

  // Low Impact: Eco goal completion based on ecoPoints
  const computedEcoProgress = Math.min(Math.round((ecoPoints / 250) * 100), 100);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      <CustomCursor />
      <BackgroundAnimations />
      {/* Top Banner Warning lines (stadium aesthetic margins) */}
      <div className="bg-gradient-to-r from-cyan-900 via-rose-950 to-emerald-950 text-[10px] sm:text-xs text-center py-2 uppercase font-mono tracking-widest font-bold border-b border-slate-900 flex items-center justify-center gap-1.5 px-4 text-white z-10 relative">
        <span>⚽ FIFA WORLD CUP 2026 MATCHDAY LIVE OPS CONSOLE</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">ESTADIO AZTECA / METLIFE STADIUM PLATFORM ACTIVE</span>
      </div>

      {/* Main Container */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-16">
        {/* Animated Hero Section */}
        <section aria-label="Hero Section">
          <HeroSection />
        </section>

        {/* Dynamic Glowing Impact Progress Bars */}
        <section aria-label="Live Impact Metrics">
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Operations Metrics
            </h3>
            <span className="text-xs text-slate-400 font-mono">UPDATED: JUST NOW</span>
          </div>
          <ImpactBars 
            highVal={computedRisk} 
            medVal={computedTransitLoad} 
            lowVal={computedEcoProgress} 
          />
        </section>

        <section aria-label="Interactive Matchday Portal" className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800/80 backdrop-blur-md shadow-2xl">
          {/* Mode Selector Tab & Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700/80 pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">📢</span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Interactive Matchday Portal
                </h2>
                <p className="text-sm text-slate-300 font-mono mt-1">Select your role to view localized operational dashboards.</p>
              </div>
            </div>

            {/* Toggle buttons styled with custom CSS hover transitions */}
            <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                onClick={() => setRole("fan")}
                className={`px-5 py-2.5 rounded-lg font-mono text-sm font-bold uppercase transition-all duration-300 ${
                  role === "fan"
                    ? "bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-lg shadow-cyan-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                👋 Fan Experience Portal
              </button>
              <button
                onClick={() => setRole("staff")}
                className={`px-5 py-2.5 rounded-lg font-mono text-sm font-bold uppercase transition-all duration-300 ${
                  role === "staff"
                    ? "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-red-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🛡️ Venue Staff Center
              </button>
            </div>
          </div>

          {/* Core Layout Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* LEFT SIDE: Interactive map */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <StadiumMap
                selectedGateId={selectedGateId}
                onSelectGate={setSelectedGateId}
                showAdaPaths={showAdaPaths}
                setShowAdaPaths={setShowAdaPaths}
                gates={gates}
              />
            </div>

            {/* RIGHT SIDE: Dedicated Gemini Chat assistant */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <CopilotChat
                role={role}
                language={language}
                setLanguage={setLanguage}
                seatCode={seatCode}
                setSeatCode={setSeatCode}
                ticketTier={ticketTier}
                setTicketTier={setTicketTier}
                onTriggerAction={handleTriggerAction}
                activeAlertContext={incidents.filter((i) => i.status !== "resolved")}
              />
            </div>
          </div>

          {/* Dashboards Section */}
          <div id="transit-hub-section" className="pt-4 border-t border-slate-800/60">
            <h3 className="text-lg font-bold text-white mb-6">
              {role === "fan" ? "🏟️ Fan Utilities & Rewards" : "🚨 Incident Management & Playbooks"}
            </h3>
            {role === "fan" ? (
              <FanHub
                transitLines={transitLines}
                ecoPoints={ecoPoints}
                setEcoPoints={setEcoPoints}
                setSeatCode={setSeatCode}
                setTicketTier={setTicketTier}
                onReportConcessionCongestion={handleFanReportConcession}
              />
            ) : (
              <StaffDashboard
                incidents={incidents}
                setIncidents={setIncidents}
                onInvokePlaybook={handleInvokePlaybook}
                loadingPlaybookId={loadingPlaybookId}
              />
            )}
          </div>
        </section>

        {/* Hover-Flippable Challenge Expectations Cards */}
        <section aria-label="System Architecture & Logic" className="pt-6">
          <div className="text-center mb-10 space-y-3">
             <h2 className="text-3xl font-bold text-white tracking-tight">System Architecture & AI Capabilities</h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-sm">Discover how server-side Gemini intelligence powers adaptive routing, real-time translations, and actionable insights for stadium operations.</p>
          </div>
          <ChallengeCards />
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-6 mt-12 text-center text-sm text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>FIFA WORLD CUP 2026™ GENAI OPERATION PROTOTYPE</span>
          </div>
          <div className="text-slate-500">
            SECURED MULTILINGUAL NODE/VITE PIPELINE • ZERO PUBLIC KEYS EXPOSED
          </div>
        </footer>
      </div>
    </div>
  );
}
