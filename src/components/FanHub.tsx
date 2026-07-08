import React, { useState } from "react";
import { Award, Compass, RefreshCw, Zap, Landmark, Recycle, CheckCircle, Smartphone } from "lucide-react";
import { TransitLine } from "../types";

interface FanHubProps {
  transitLines: TransitLine[];
  ecoPoints: number;
  setEcoPoints: React.Dispatch<React.SetStateAction<number>>;
  setSeatCode: (code: string) => void;
  setTicketTier: (tier: string) => void;
  onReportConcessionCongestion: (loc: string, desc: string) => void;
}

export function FanHub({
  transitLines,
  ecoPoints,
  setEcoPoints,
  setSeatCode,
  setTicketTier,
  onReportConcessionCongestion
}: FanHubProps) {
  const [ticketScanned, setTicketScanned] = useState(false);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [reportingConcession, setReportingConcession] = useState(false);
  const [selectedConcession, setSelectedConcession] = useState("Concession Zone 2");
  const [concessionDesc, setConcessionDesc] = useState("Long lines of 30+ minutes to get water bottles.");

  // Simulate ticket scan
  const handleScanTicket = () => {
    setTicketScanned(true);
    // Auto-scans random Category 2 Seat near Gate C
    setSeatCode("Section 112, Row 8, Seat 14 (Near Gate C)");
    setTicketTier("Category 2 & Club");
  };

  // Recycle items simulation
  const handleRecycle = () => {
    setRecycleLoading(true);
    setTimeout(() => {
      setEcoPoints((prev) => prev + 50);
      setRecycleLoading(false);
    }, 600);
  };

  // Submit report
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concessionDesc.trim()) return;
    onReportConcessionCongestion(selectedConcession, concessionDesc);
    setReportingConcession(false);
    setConcessionDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Ticket Scanner Simulator widget */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 p-5 rounded-xl border border-cyan-900/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            FIFA 2026 Mobile Smart Ticket Scanner
          </h3>
          <p className="text-[11px] text-slate-300 max-w-xl">
            Simulate scanning your match ticket. It automatically syncs your exact seat section and gate parameters directly to the Gemini AI context.
          </p>
        </div>

        <div>
          {ticketScanned ? (
            <div className="bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <div>
                <strong className="block text-white">TICKET SYNCED</strong>
                <span>Section 112 / Gate C</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleScanTicket}
              className="bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-mono text-xs font-bold px-5 py-3 rounded-lg shadow-md shadow-cyan-950/60 uppercase transition-all duration-300 animate-pulse cursor-pointer"
            >
              Scan Match Ticket RFID
            </button>
          )}
        </div>
      </div>

      {/* Transit Options & Sustainability section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transit Lines */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
              Matchday Eco-Transit Schedules
            </h4>
          </div>

          <div className="space-y-3">
            {transitLines.map((line) => (
              <div
                key={line.id}
                className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{line.name}</span>
                    <span className="text-[9px] bg-slate-900 text-emerald-400 border border-emerald-900/40 px-1.5 rounded uppercase font-mono font-bold">
                      ECO: {line.sustainabilityRating}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Frequency: Every {line.frequencyMinutes} mins • Departs: {line.nextDeparture}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    line.status === "normal"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}
                >
                  {line.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Rewards */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Recycle className="w-4 h-4 text-emerald-400 animate-bounce" />
                FIFA Green Rewards Hub
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Estadio Azteca & MetLife Stadium use 100% reusable beer/water cups. Clean up the stands, return cups to Green recycling pillars, and unlock digital badges!
            </p>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-900 mb-4">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono block">Your Eco Scoreboard:</span>
                <span className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <Award className="w-4.5 h-4.5 text-amber-400" />
                  {ecoPoints} Green Points Accrued
                </span>
              </div>
              <div className="text-[10px] text-emerald-500 font-mono text-right">
                {ecoPoints >= 100 ? "🌱 ECO CHAMPION" : "🌱 MATCHDAY STEWARD"}
              </div>
            </div>
          </div>

          <button
            onClick={handleRecycle}
            disabled={recycleLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition-all shadow-md shadow-emerald-950/60 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recycleLoading ? "animate-spin" : ""}`} />
            <span>{recycleLoading ? "RECYCLING CUPS..." : "RECYCLE 5 REUSABLE CUPS (+50 PTS)"}</span>
          </button>
        </div>
      </div>

      {/* Fan reporting widget */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
            ⚠️ Crowding & Incident Reporter
          </h4>
          <button
            onClick={() => setReportingConcession(!reportingConcession)}
            className="text-xs text-cyan-400 font-mono hover:underline"
          >
            {reportingConcession ? "CLOSE FORM" : "SUBMIT REPORT"}
          </button>
        </div>

        {reportingConcession ? (
          <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 uppercase text-[9px] font-mono">Location of hazard:</label>
                <select
                  value={selectedConcession}
                  onChange={(e) => setSelectedConcession(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-300 outline-none"
                >
                  <option value="Concession Zone 2">Concession Zone 2 (North Stand)</option>
                  <option value="Concession Zone 4">Concession Zone 4 (South Stand)</option>
                  <option value="Gate A Plaza">Gate A Entrance Plaza</option>
                  <option value="Section 104 Ramps">Section 104 Wheelchair Ramp</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 uppercase text-[9px] font-mono">Brief detail:</label>
                <input
                  type="text"
                  value={concessionDesc}
                  onChange={(e) => setConcessionDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none"
                  placeholder="e.g. Extreme 30 minute wait for ADA elevator"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-[11px]">
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-1.5 rounded shadow-md shadow-cyan-950/50"
              >
                SUBMIT HAZARD REPORT TO OPERATIONS
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed">
            Spotted congestion at a beer line or a broken elevator? Send a report. Your dispatch is routed straight to the staff operations dashboard where managers use Gemini to tackle incidents.
          </p>
        )}
      </div>
    </div>
  );
}
