import React from "react";
import { motion } from "motion/react";

export function BackgroundAnimations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[100px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_alternate]" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-900/10 blur-[100px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_alternate-reverse]" />
      
      {/* Animated Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/10"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.1,
            scale: Math.random() * 1.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            x: [null, (Math.random() - 0.5) * 100],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
