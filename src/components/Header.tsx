/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Smartphone, Landmark, Calendar, Clock, Trophy } from "lucide-react";
import { StadiumState } from "../types";

interface HeaderProps {
  stadiumState: StadiumState | null;
  selectedStadiumId: string;
  onStadiumChange: (id: string) => void;
  activeTab: "staff" | "fan";
  setActiveTab: (tab: "staff" | "fan") => void;
}

export const Header: React.FC<HeaderProps> = ({
  stadiumState,
  selectedStadiumId,
  onStadiumChange,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-xl" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Tournament Title */}
        <div className="flex items-center gap-3" id="brand-logo-container">
          <div className="bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600 p-2.5 rounded-xl shadow-lg border border-amber-400/30 flex items-center justify-center animate-pulse">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-amber-500 font-mono uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                FIFA World Cup 2026
              </span>
              <span className="text-xs font-bold tracking-widest text-emerald-400 font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                GenAI Stadium Operations
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-1">
              PROMPTWARS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">STADIUM ASSISTANT</span>
            </h1>
          </div>
        </div>

        {/* Center: Host Stadium Selector */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 w-full md:w-auto" id="stadium-selector-box">
          <Landmark className="h-4 w-4 text-amber-500 flex-shrink-0 ml-1" />
          <div className="flex-grow md:w-60">
            <label htmlFor="stadium-select" className="sr-only">Select Host Stadium</label>
            <select
              id="stadium-select"
              value={selectedStadiumId}
              onChange={(e) => onStadiumChange(e.target.value)}
              className="bg-transparent text-sm font-semibold font-sans text-white focus:outline-none w-full cursor-pointer pr-4"
            >
              <option value="metlife" className="bg-slate-900 text-white">MetLife Stadium (USA)</option>
              <option value="azteca" className="bg-slate-900 text-white">Estadio Azteca (Mexico)</option>
              <option value="bcplace" className="bg-slate-900 text-white">BC Place (Canada)</option>
            </select>
          </div>
        </div>

        {/* Right side: App Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800" id="view-mode-tabs">
          <button
            id="staff-mode-tab"
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-tight transition-all duration-300 ${
              activeTab === "staff"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Command Center</span>
          </button>
          <button
            id="fan-mode-tab"
            onClick={() => setActiveTab("fan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-tight transition-all duration-300 ${
              activeTab === "fan"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Fan Companion App</span>
          </button>
        </div>
      </div>

      {/* Subheader: Tournament & Match Status Bar */}
      {stadiumState && (
        <div className="bg-slate-950 border-t border-slate-800/60 px-4 py-2" id="match-status-bar">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>TOURNAMENT LIVE: MATCHDAY 18</span>
            </div>
            
            {/* Live Score indicator */}
            <div className="flex items-center gap-3 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">{stadiumState.match.team1}</span>
              <span className="bg-slate-950 px-2 py-0.5 rounded font-black text-amber-500">{stadiumState.match.score1}</span>
              <span>-</span>
              <span className="bg-slate-950 px-2 py-0.5 rounded font-black text-amber-500">{stadiumState.match.score2}</span>
              <span className="font-bold">{stadiumState.match.team2}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-bold">
                {stadiumState.match.half === "HALFTIME" ? "HALFTIME" : 
                 stadiumState.match.half === "POST_MATCH" ? "FULLTIME" : 
                 `${stadiumState.match.minute}'`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>UTC Time: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
