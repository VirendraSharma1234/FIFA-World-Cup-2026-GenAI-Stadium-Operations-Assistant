import React, { useState } from "react";
import { Compass, Info, MapPin, Eye, Shuffle } from "lucide-react";
import { GateStatus } from "../types";

interface StadiumMapProps {
  selectedGateId: string | null;
  onSelectGate: (gateId: string | null) => void;
  showAdaPaths: boolean;
  setShowAdaPaths: (val: boolean) => void;
  gates: GateStatus[];
}

export function StadiumMap({
  selectedGateId,
  onSelectGate,
  showAdaPaths,
  setShowAdaPaths,
  gates
}: StadiumMapProps) {
  const [selectedStand, setSelectedStand] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<boolean>(true);

  // Stand Details
  const standsInfo: Record<string, { name: string; capacity: string; tier: string; vibe: string; crowd: string; color: string }> = {
    north: {
      name: "North Stand (General Admission)",
      capacity: "22,500 seats",
      tier: "Category 2 & 3",
      vibe: "Active fan chants, flags, drums",
      crowd: "Heavy - Gates A & D close",
      color: "text-rose-400"
    },
    south: {
      name: "South Stand (Family & Support)",
      capacity: "18,000 seats",
      tier: "Category 3 & Wheelchair",
      vibe: "Family atmosphere, kids play zone",
      crowd: "Moderate - Gate C direct",
      color: "text-emerald-400"
    },
    east: {
      name: "East Stand (Premium Club)",
      capacity: "24,500 seats",
      tier: "Category 1 & Club Seats",
      vibe: "Gourmet dining access, corporate",
      crowd: "Low - Gate B direct",
      color: "text-cyan-400"
    },
    west: {
      name: "West Stand (VIP & Media Rail)",
      capacity: "20,000 seats",
      tier: "VIP Box & Press Center",
      vibe: "Calm, executive suites, cameras",
      crowd: "Moderate - Gate C & B",
      color: "text-amber-400"
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col h-[560px] justify-between">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏟️</span>
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Interactive Heatmap Stadium Layout
              </h3>
              <p className="text-[11px] text-slate-400">Click stadium sectors or gates to highlight operational metrics.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Heatmap Toggle */}
            <button
              onClick={() => setHeatmapMode(!heatmapMode)}
              className={`flex items-center gap-1 text-[10px] font-mono px-2.5 py-1.5 rounded border transition-all ${
                heatmapMode
                  ? "bg-cyan-950/80 text-cyan-400 border-cyan-800 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>HEATMAP: {heatmapMode ? "ACTIVE" : "OFF"}</span>
            </button>

            {/* ADA Pathways Toggle */}
            <button
              onClick={() => setShowAdaPaths(!showAdaPaths)}
              className={`flex items-center gap-1 text-[10px] font-mono px-2.5 py-1.5 rounded border transition-all ${
                showAdaPaths
                  ? "bg-emerald-950/85 text-emerald-400 border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800"
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>ADA PATHS: {showAdaPaths ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* The SVG Container */}
        <div className="relative w-full flex-1 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center overflow-hidden min-h-0">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full max-h-[360px]"
          >
            {/* Ambient stadium background glow */}
            <circle cx="200" cy="150" r="140" fill="url(#radialGlow)" opacity="0.3" />

            <defs>
              <radialGradient id="radialGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>

              {/* Crowd heat pattern patterns */}
              <linearGradient id="heavyHeat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="modHeat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="lowHeat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>

            {/* STADIUM SEATS / OUTER RING SECTORS */}
            {/* North Stand Sector */}
            <path
              d="M 100 60 A 140 110 0 0 1 300 60 L 270 95 A 90 70 0 0 0 130 95 Z"
              fill={heatmapMode ? "url(#heavyHeat)" : "#1e293b"}
              stroke={selectedStand === "north" ? "#38bdf8" : "#334155"}
              strokeWidth={selectedStand === "north" ? "2" : "1"}
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => setSelectedStand("north")}
            />

            {/* South Stand Sector */}
            <path
              d="M 100 240 A 140 110 0 0 0 300 240 L 270 205 A 90 70 0 0 1 130 205 Z"
              fill={heatmapMode ? "url(#lowHeat)" : "#1e293b"}
              stroke={selectedStand === "south" ? "#38bdf8" : "#334155"}
              strokeWidth={selectedStand === "south" ? "2" : "1"}
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => setSelectedStand("south")}
            />

            {/* West Stand Sector */}
            <path
              d="M 100 60 A 140 110 0 0 0 100 240 L 130 205 A 90 70 0 0 1 130 95 Z"
              fill={heatmapMode ? "url(#modHeat)" : "#1e293b"}
              stroke={selectedStand === "west" ? "#38bdf8" : "#334155"}
              strokeWidth={selectedStand === "west" ? "2" : "1"}
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => setSelectedStand("west")}
            />

            {/* East Stand Sector */}
            <path
              d="M 300 60 A 140 110 0 0 1 300 240 L 270 205 A 90 70 0 0 0 270 95 Z"
              fill={heatmapMode ? "url(#lowHeat)" : "#1e293b"}
              stroke={selectedStand === "east" ? "#38bdf8" : "#334155"}
              strokeWidth={selectedStand === "east" ? "2" : "1"}
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => setSelectedStand("east")}
            />

            {/* THE PLAYING PITCH */}
            <rect
              x="145"
              y="110"
              width="110"
              height="80"
              rx="4"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="1.5"
            />
            {/* Center Line & Circle */}
            <line x1="200" y1="110" x2="200" y2="190" stroke="#475569" strokeWidth="1" />
            <circle cx="200" cy="150" r="18" fill="none" stroke="#475569" strokeWidth="1" />
            {/* Penalty boxes */}
            <rect x="145" y="130" width="15" height="40" fill="none" stroke="#475569" strokeWidth="1" />
            <rect x="240" y="130" width="15" height="40" fill="none" stroke="#475569" strokeWidth="1" />

            {/* GATES MARKERS */}
            {/* Gate A (Top Left Near North Stand) */}
            <g 
              className="cursor-pointer"
              onClick={() => onSelectGate("Gate A")}
            >
              <circle
                cx="80"
                cy="45"
                r="10"
                fill={selectedGateId === "Gate A" ? "#06b6d4" : "#ef4444"}
                stroke="#1e293b"
                strokeWidth="1.5"
                className="transition-colors hover:scale-110 transform origin-center"
              />
              <text x="80" y="48" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">A</text>
            </g>

            {/* Gate B (Top Right Near East Stand) */}
            <g 
              className="cursor-pointer"
              onClick={() => onSelectGate("Gate B")}
            >
              <circle
                cx="320"
                cy="45"
                r="10"
                fill={selectedGateId === "Gate B" ? "#06b6d4" : "#10b981"}
                stroke="#1e293b"
                strokeWidth="1.5"
                className="transition-colors hover:scale-110 transform origin-center"
              />
              <text x="320" y="48" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">B</text>
            </g>

            {/* Gate C (Bottom Right Near South/East Stand) */}
            <g 
              className="cursor-pointer"
              onClick={() => onSelectGate("Gate C")}
            >
              <circle
                cx="320"
                cy="255"
                r="10"
                fill={selectedGateId === "Gate C" ? "#06b6d4" : "#10b981"}
                stroke="#1e293b"
                strokeWidth="1.5"
                className="transition-colors hover:scale-110 transform origin-center"
              />
              <text x="320" y="258" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">C</text>
            </g>

            {/* Gate D (Bottom Left Near West Stand) */}
            <g 
              className="cursor-pointer"
              onClick={() => onSelectGate("Gate D")}
            >
              <circle
                cx="80"
                cy="255"
                r="10"
                fill={selectedGateId === "Gate D" ? "#06b6d4" : "#f59e0b"}
                stroke="#1e293b"
                strokeWidth="1.5"
                className="transition-colors hover:scale-110 transform origin-center"
              />
              <text x="80" y="258" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">D</text>
            </g>

            {/* ACCESSIBILITY / ADA LANE OVERLAYS */}
            {showAdaPaths && (
              <g opacity="0.85" className="animate-pulse">
                {/* Safe ADA Path from South Gate C into South stand */}
                <path
                  d="M 320 255 L 250 220 L 200 205"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                {/* Ramps at South West Corner */}
                <path
                  d="M 80 255 L 110 215 L 145 190"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                {/* Helper Wheelchair Icon at center bottom */}
                <circle cx="200" cy="235" r="8" fill="#047857" />
                <path d="M 198 231 H 202 M 200 231 V 239 M 197 236 H 203" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* CONCESSIONS & PILLARS MARKERS */}
            {/* Green recycling pillar 1 near Gate B */}
            <g className="cursor-pointer hover:scale-110 transition-transform origin-center">
              <rect x="290" y="70" width="8" height="8" rx="2" fill="#059669" />
              <text x="294" y="76" fill="#ffffff" fontSize="6" textAnchor="middle">♻️</text>
            </g>
            {/* Green recycling pillar 2 near West Stand */}
            <g className="cursor-pointer hover:scale-110 transition-transform origin-center">
              <rect x="105" y="180" width="8" height="8" rx="2" fill="#059669" />
              <text x="109" y="186" fill="#ffffff" fontSize="6" textAnchor="middle">♻️</text>
            </g>
          </svg>

          {/* Compass layout key overlay */}
          <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded text-[9px] font-mono flex items-center gap-1.5 text-slate-300">
            <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>NORTH STAND TOP</span>
          </div>
        </div>
      </div>

      {/* Dynamic Detail Panel */}
      <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        {selectedGateId ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                GATE PROFILE: {selectedGateId}
              </h4>
              <button 
                onClick={() => onSelectGate(null)}
                className="text-[10px] text-slate-400 hover:text-slate-300 font-mono"
              >
                CLEAR
              </button>
            </div>
            {(() => {
              const profile = gates.find((g) => g.id === selectedGateId);
              if (!profile) return null;
              return (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Wait Time:</span>
                    <strong className={profile.waitTimeMinutes > 20 ? "text-rose-400" : "text-emerald-400"}>
                      {profile.waitTimeMinutes} Minutes
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Safety Load:</span>
                    <strong className="text-slate-300 font-mono uppercase">{profile.density}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Status:</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${profile.isOpen ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {profile.isOpen ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">ADA Access Ramps:</span>
                    <strong className="text-emerald-400">{profile.accessible ? "YES" : "NO"}</strong>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : selectedStand ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                SECTOR PROFILE
              </h4>
              <button 
                onClick={() => setSelectedStand(null)}
                className="text-[10px] text-slate-400 hover:text-slate-300 font-mono"
              >
                CLEAR
              </button>
            </div>
            {(() => {
              const details = standsInfo[selectedStand];
              if (!details) return null;
              return (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stand Name:</span>
                    <span className="text-slate-200 font-bold">{details.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Seat Tiers:</span>
                    <span className="text-slate-300 font-mono">{details.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Crowd Level:</span>
                    <span className={details.color}>{details.crowd}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 italic bg-slate-900 p-1.5 rounded border border-slate-800/40">
                    "{details.vibe}"
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-2 italic">
            <Info className="w-3.5 h-3.5 text-cyan-500 animate-bounce" />
            <span>No sector or gate selected. Click any point above to inspect.</span>
          </div>
        )}
      </div>
    </div>
  );
}
