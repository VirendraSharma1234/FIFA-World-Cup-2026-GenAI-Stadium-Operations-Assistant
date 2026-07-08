import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Shield, Sparkles, Volume2 } from "lucide-react";

export function HeroSection() {
  const [lightsOn, setLightsOn] = useState(false);
  const [lightsFlickerStage, setLightsFlickerStage] = useState(0); // 0: off, 1: flicker1, 2: black, 3: flicker2, 4: solid on
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");

  const megaPrompt = [
    "> INITIATING FIFA WORLD CUP 2026 OPERATIONS HUB...",
    "> LOADING METADATA: HOST STADIA [ESTADIO AZTECA, METLIFE STADIUM]",
    "> GROUNDING GEOMETRIC MAPPING FOR 85,000+ SEAT DENSITY...",
    "> SYNCING MULTILINGUAL TRANSLATION ENGINE [EN, ES, FR, AR]...",
    "> MOUNTING SERVER-SIDE GEMINI-3.5-FLASH CO-PILOT...",
    "> CORE DECISION SUPPORT & MOBILITY ASSISTANT IS ONLINE."
  ];

  // Flicker lights effect on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setLightsFlickerStage(1), 400);  // Quick burst
    const timer2 = setTimeout(() => setLightsFlickerStage(2), 650);  // Dark again
    const timer3 = setTimeout(() => setLightsFlickerStage(3), 850);  // Second flicker
    const timer4 = setTimeout(() => {
      setLightsFlickerStage(4);
      setLightsOn(true);
    }, 1200);                                                       // Fully on

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Typewriter effect for mega prompt lines
  useEffect(() => {
    if (lightsOn && currentLineIndex < megaPrompt.length) {
      const line = megaPrompt[currentLineIndex];
      if (currentCharIndex < line.length) {
        const charTimer = setTimeout(() => {
          setCurrentText((prev) => prev + line[currentCharIndex]);
          setCurrentCharIndex((prev) => prev + 1);
        }, 15);
        return () => clearTimeout(charTimer);
      } else {
        // Line completed, push to list and proceed to next line
        const delayTimer = setTimeout(() => {
          setTypedLines((prev) => [...prev, line]);
          setCurrentText("");
          setCurrentCharIndex(0);
          setCurrentLineIndex((prev) => prev + 1);
        }, 400);
        return () => clearTimeout(delayTimer);
      }
    }
  }, [lightsOn, currentLineIndex, currentCharIndex]);

  return (
    <div className="relative overflow-hidden bg-slate-950 rounded-3xl border border-slate-800 p-6 md:p-10 mb-8 shadow-2xl">
      {/* Stadium Grid & Beams of light */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
        {/* Pitch Lines background */}
        <div className="absolute inset-x-0 bottom-0 h-40 border-t border-slate-800/40 opacity-30 flex items-center justify-center">
          <div className="w-1/2 h-full border-x border-slate-800/40 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b border-x border-slate-800/40 rounded-b-3xl" />
          </div>
        </div>
      </div>

      {/* Floodlights Simulator */}
      <div className="absolute inset-x-0 top-0 h-32 flex justify-between px-12 z-10 pointer-events-none">
        {[0, 1, 2, 3].map((bank) => {
          // Determine light intensity based on flicker stages
          let lightOpacity = 0.05;
          let beamHeight = "h-0";
          let glowColor = "bg-amber-100/10";

          if (lightsFlickerStage === 1) {
            lightOpacity = 0.4;
            beamHeight = "h-40";
            glowColor = "bg-amber-200/40";
          } else if (lightsFlickerStage === 3) {
            lightOpacity = 0.6;
            beamHeight = "h-60";
            glowColor = "bg-sky-200/50";
          } else if (lightsFlickerStage === 4) {
            lightOpacity = 1;
            beamHeight = "h-96";
            glowColor = "bg-cyan-100/40";
          }

          return (
            <div key={bank} className="relative flex flex-col items-center">
              {/* Bulbs Bank */}
              <div 
                className={`flex gap-1 p-1 bg-slate-800 rounded border border-slate-700 transition-all duration-100 ${
                  lightsFlickerStage >= 4 ? "shadow-[0_0_15px_#38bdf8]" : ""
                }`}
              >
                {[0, 1, 2, 3].map((bulb) => (
                  <div
                    key={bulb}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                      lightsFlickerStage === 1 || lightsFlickerStage === 3
                        ? "bg-amber-200 animate-pulse"
                        : lightsFlickerStage === 4
                        ? "bg-sky-200 shadow-[0_0_8px_#ffffff]"
                        : "bg-slate-900"
                    }`}
                  />
                ))}
              </div>
              {/* Light beam projection */}
              <div
                className={`w-32 md:w-56 ${beamHeight} bg-gradient-to-b from-sky-400/20 to-transparent blur-xl origin-top -rotate-12 transform transition-all duration-200`}
                style={{ opacity: lightOpacity }}
              />
              {/* Glowing halo */}
              <div 
                className={`absolute top-4 w-12 h-12 rounded-full filter blur-md mix-blend-screen transition-all duration-300 ${glowColor}`} 
                style={{ opacity: lightOpacity * 0.8 }}
              />
            </div>
          );
        })}
      </div>

      {/* Cheering Crowd Spectator Wave Simulation */}
      <div className="absolute inset-x-0 bottom-0 h-24 overflow-hidden pointer-events-none z-10 opacity-30">
        <div className="flex justify-around items-end h-full px-4 gap-0.5">
          {Array.from({ length: 42 }).map((_, i) => {
            // Give stadium wave effect using sin math
            const delay = (i % 8) * 0.15;
            const heightMultiplier = Math.sin((i / 42) * Math.PI) * 15 + 10;
            return (
              <motion.div
                key={i}
                className="w-1.5 md:w-2 bg-slate-600 rounded-t-sm"
                animate={{
                  height: [
                    `${heightMultiplier + 5}px`, 
                    `${heightMultiplier + 25}px`, 
                    `${heightMultiplier + 5}px`
                  ],
                  backgroundColor: lightsOn ? ["#475569", "#06b6d4", "#475569"] : ["#334155", "#334155", "#334155"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pt-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-800 rounded-full px-3 w-fit py-1 text-cyan-400 text-xs font-mono mb-4 shadow-sm shadow-cyan-900/40">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>FIFA WORLD CUP 2026™ OPERATIONS</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Matchday <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400">Operations Hub</span> & AI Assistant
          </h1>
          <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed mb-6">
            Connecting real-time crowd dynamics, localized transit services, green sustainability tracking, and accessibility navigation with high-intelligence Gemini routing.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              STADIUM STATUS: READY
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
              ⚽ METLIFE STADIUM / ESTADIO AZTECA
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
              🏆 QF MATCHDAY 32
            </span>
          </div>
        </div>

        {/* Mega Prompt Typewriter Console */}
        <div className="w-full md:w-96 bg-black/85 backdrop-blur-md rounded-xl border border-slate-800 p-4 font-mono text-[11px] leading-relaxed text-cyan-400 shadow-xl self-stretch flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GENAI BOOT LOG</span>
          </div>

          <div className="flex-1 min-h-[140px] flex flex-col justify-start gap-1">
            {typedLines.map((line, idx) => (
              <div key={idx} className="text-slate-300">{line}</div>
            ))}
            {currentLineIndex < megaPrompt.length && lightsOn && (
              <div className="text-cyan-400 font-bold">
                {currentText}
                <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
              </div>
            )}
            {!lightsOn && (
              <div className="text-slate-600 italic">Waiting for floodlight activation...</div>
            )}
          </div>

          <div className="border-t border-slate-900 pt-2 mt-2 flex justify-between items-center text-[10px] text-slate-400">
            <span>MODALITY: TEXT/JSON</span>
            <span>MODEL: GEMINI-3.5-FLASH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
