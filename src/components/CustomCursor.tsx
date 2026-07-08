import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updatePointerState = (e: PointerEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest(
        'button, a, input, select, textarea, [role="button"], [data-cursor="interactive"]',
      );
      setIsHovering(isInteractive);
    };

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);

    window.addEventListener("pointermove", updatePointerState, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePointerState);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  if (!isMounted) return null;

  // Avoid rendering custom cursor on touch devices for better performance
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-[340px] h-[340px] rounded-full pointer-events-none z-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.24) 0%, rgba(34,211,238,0.12) 30%, rgba(34,211,238,0.04) 52%, rgba(34,211,238,0) 72%)",
        }}
        animate={{
          x: mousePosition.x - 170,
          y: mousePosition.y - 170,
          scale: isPressed ? 1.12 : isHovering ? 1.06 : 1,
          opacity: isHovering ? 1 : 0.82,
        }}
        transition={{
          type: "spring",
          stiffness: 55,
          damping: 18,
          mass: 1.2,
        }}
      />

      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[9998] mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 120deg, rgba(34,211,238,0.04), rgba(34,211,238,0.55), rgba(14,165,233,0.25), rgba(251,191,36,0.35), rgba(34,211,238,0.04))",
          boxShadow:
            "0 0 14px rgba(34,211,238,0.22), inset 0 0 14px rgba(255,255,255,0.12)",
        }}
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          scale: isPressed ? 0.78 : isHovering ? 1.35 : 1,
          rotate: isHovering ? 180 : 0,
          opacity: isHovering ? 1 : 0.88,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 18,
          mass: 0.25,
        }}
      />

      <motion.div
        className="fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,1) 0%, rgba(251,191,36,0.95) 18%, rgba(34,211,238,0.92) 60%, rgba(15,23,42,0.1) 100%)",
        }}
        animate={{
          x: mousePosition.x - 10,
          y: mousePosition.y - 10,
          scale: isPressed ? 0.82 : isHovering ? 1.3 : 1,
          boxShadow: isHovering
            ? "0 0 12px 3px rgba(251,191,36,0.65), 0 0 28px rgba(34,211,238,0.45)"
            : "0 0 8px 2px rgba(34,211,238,0.7), 0 0 18px rgba(34,211,238,0.35)",
        }}
        transition={{
          type: "spring",
          stiffness: 900,
          damping: 32,
          mass: 0.06,
        }}
      />

      {isPressed ? (
        <motion.div
          className="fixed top-0 left-0 w-14 h-14 rounded-full border border-cyan-300/60 pointer-events-none z-[9997] mix-blend-screen"
          animate={{
            x: mousePosition.x - 28,
            y: mousePosition.y - 28,
            scale: [0.55, 1.4],
            opacity: [0.9, 0],
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
        />
      ) : null}

      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[10001]"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(34,211,238,1))",
          boxShadow: "0 0 6px rgba(255,255,255,0.9)",
        }}
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isPressed ? 0.7 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 2400,
          damping: 80,
          mass: 0.02,
        }}
      />
    </>
  );
}
