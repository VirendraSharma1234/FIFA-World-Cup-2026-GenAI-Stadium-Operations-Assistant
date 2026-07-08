import React from "react";
import { Cpu, Shuffle, Compass, Code } from "lucide-react";

interface CardData {
  title: string;
  emoji: string;
  icon: React.ReactNode;
  frontText: string;
  backHeading: string;
  backText: string;
  borderColor: string;
  glowColor: string;
}

export function ChallengeCards() {
  const cards: CardData[] = [
    {
      title: "Smart, Dynamic Assistant",
      emoji: "🧠⚽",
      icon: <Cpu className="w-8 h-8 text-cyan-400" />,
      frontText: "Hover to see how the assistant acts as the ultimate digital guide for matchday operations.",
      backHeading: "GEMINI MATCHDAY BRAIN",
      backText: "Utilizes server-side Gemini-3.5-flash with a detailed grounding system mapping stadium gates, green targets, concessions, and multilingual translations.",
      borderColor: "border-cyan-500/30",
      glowColor: "group-hover:shadow-cyan-500/20"
    },
    {
      title: "Logical Decision Making",
      emoji: "🧭👥",
      icon: <Shuffle className="w-8 h-8 text-amber-400" />,
      frontText: "Hover to discover how the assistant adapts rules and routes based on contextual inputs.",
      backHeading: "CONTEXT-AWARE LOGIC",
      backText: "Dynamically senses user role (fan/staff), seat sector, language preference, and live stadium alerts, creating customized evacuation, recycling, or transport playbooks.",
      borderColor: "border-amber-500/30",
      glowColor: "group-hover:shadow-amber-500/20"
    },
    {
      title: "Practical Usability",
      emoji: "🏟️🛞",
      icon: <Compass className="w-8 h-8 text-emerald-400" />,
      frontText: "Hover to explore the interactive stadium map and crowd incident control systems.",
      backHeading: "REAL-WORLD UTILITY",
      backText: "Features an interactive SVG heatmap, accessible pathway toggle, EV green transit routes, a simulated ticket scanner, and active incident reporting logs for venue responders.",
      borderColor: "border-emerald-500/30",
      glowColor: "group-hover:shadow-emerald-500/20"
    },
    {
      title: "Clean & Maintainable Code",
      emoji: "💻📐",
      icon: <Code className="w-8 h-8 text-rose-400" />,
      frontText: "Hover to review our clean architectural layout, custom-crafted widgets, and backend security.",
      backHeading: "MODULAR CRAFTSMANSHIP",
      backText: "Organized into distinct TypeScript components (Types, Map, Assistant, Dashboards) backed by a secure Express server proxy hiding API keys from the client.",
      borderColor: "border-rose-500/30",
      glowColor: "group-hover:shadow-rose-500/20"
    }
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📋</span>
        <h2 className="text-2xl font-bold text-white tracking-tight">Challenge Expectations</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className="group h-64 [perspective:1000px]"
          >
            {/* Card Inner Container with 3D transform */}
            <div 
              className="relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer"
            >
              {/* CARD FRONT */}
              <div 
                className={`absolute inset-0 w-full h-full rounded-2xl border ${card.borderColor} bg-slate-900/90 p-6 flex flex-col justify-between items-center [backface-visibility:hidden] shadow-lg group-hover:shadow-2xl ${card.glowColor} transition-shadow duration-300`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm md:text-base leading-snug">
                    {card.title}
                  </h3>
                </div>

                <p className="text-slate-300 text-xs text-center leading-relaxed">
                  {card.frontText}
                </p>

                <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
                  <span>Flip Card</span>
                  <span className="text-xs">{card.emoji}</span>
                </div>
              </div>

              {/* CARD BACK */}
              <div 
                className="absolute inset-0 w-full h-full rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between items-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl"
              >
                <div className="w-full flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
                    {card.backHeading}
                  </span>
                  <span className="text-xs">{card.emoji}</span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed text-center my-auto px-1">
                  {card.backText}
                </p>

                <div className="text-[9px] font-mono text-cyan-500 font-bold tracking-widest bg-cyan-950/45 border border-cyan-900 px-2 py-1 rounded-full uppercase">
                  Verified Complete
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
