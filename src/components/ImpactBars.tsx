import React, { useEffect, useState } from "react";
import { Shield, Users, Recycle, RefreshCw } from "lucide-react";

interface ProgressProps {
  highVal?: number;
  medVal?: number;
  lowVal?: number;
}

export function ImpactBars({ highVal = 74, medVal = 58, lowVal = 82 }: ProgressProps) {
  // Add some state to allow dynamic pulsing and shifting numbers on render
  const [high, setHigh] = useState(0);
  const [med, setMed] = useState(0);
  const [low, setLow] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHigh(highVal);
      setMed(medVal);
      setLow(lowVal);
    }, 150);
    return () => clearTimeout(timer);
  }, [highVal, medVal, lowVal]);

  return (
    <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 mb-8 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            Matchday Operations Metrics
          </h3>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          <span>REAL-TIME STREAMING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HIGH IMPACT: Red Glowing Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-red-400 font-mono font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              HIGH IMPACT: Crowd Risk & Density
            </span>
            <span className="font-mono text-red-400 font-bold bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded">
              {high}%
            </span>
          </div>
          {/* Progress track */}
          <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
            {/* Glowing bar filled with animating red light */}
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              style={{ width: `${high}%` }}
            >
              {/* Scanlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 leading-snug">
            Triggers automatic safety stewards dispatch if gate flow exceeds 80%.
          </span>
        </div>

        {/* MEDIUM IMPACT: Yellow Pulse Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-amber-400 font-mono font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              MEDIUM IMPACT: Transport Transit Load
            </span>
            <span className="font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded">
              {med}%
            </span>
          </div>
          {/* Progress track */}
          <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
            {/* Pulsing bar width/color animation */}
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out animate-[pulse_2s_infinite] shadow-[0_0_6px_rgba(245,158,11,0.4)]"
              style={{ width: `${med}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 leading-snug">
            EV Shuttle frequency auto-adjusts based on subway arrival frequencies.
          </span>
        </div>

        {/* LOW IMPACT: Green Fade Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
              <Recycle className="w-3.5 h-3.5" />
              LOW IMPACT: Sustainability Circular Goal
            </span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
              {low}%
            </span>
          </div>
          {/* Progress track */}
          <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
            {/* Green fade effect */}
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 rounded-full transition-all duration-1000 ease-out opacity-90 hover:opacity-100 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${low}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 leading-snug">
            Eco points accrued by fans recycling reusable tournament items.
          </span>
        </div>
      </div>
    </div>
  );
}
