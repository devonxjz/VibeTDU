"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { CHEMICAL_COLORS, BOTTLE_COLORS } from "@/constants/chemicals";

interface PouringAnimationProps {
  chemicalName: string;
  chemicalCategory: string;
  chemicalId: string;
  targetVesselId?: string;
  onComplete: () => void;
}

function getLiquidColor(id: string): string {
  return CHEMICAL_COLORS[id.toLowerCase()] ?? "rgba(120,180,240,0.85)";
}
function getBottleBody(id: string): string {
  return BOTTLE_COLORS[id.toLowerCase()] ?? "#b0c8e8";
}
const CAP_COLORS: Record<string, string> = {
  acid: "#B71C1C", base: "#0D47A1", salt: "#4A148C",
  metal: "#37474F", indicator: "#F57F17", organic: "#1B5E20", gas: "#01579B",
};

export function PouringAnimation({
  chemicalName, chemicalCategory, chemicalId, onComplete,
}: PouringAnimationProps) {
  const liquid   = getLiquidColor(chemicalId);
  const bodyFill = getBottleBody(chemicalId);
  const cap      = CAP_COLORS[chemicalCategory] ?? "#455A64";
  const done     = useRef(false);

  // Find beaker rim center
  const bk = useMemo(() => {
    if (typeof document === "undefined") return { x: 0, y: 0 };
    const el = document.querySelector("[data-beaker-hero]") as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + 14 };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 - 80 };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) { done.current = true; onComplete(); }
    }, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  const splashes = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i, dx: (Math.random() - 0.5) * 36,
      dy: -(5 + Math.random() * 16), size: 2 + Math.random() * 3,
      delay: 0.6 + Math.random() * 0.3,
    })), []);

  /*
   * GEOMETRY — bottle to the LEFT, mouth tilts RIGHT toward beaker.
   *
   * Bottle SVG: 48×62, viewBox 0 0 50 65
   * Mouth (neck top-center) ≈ SVG (25, 5) → rendered (24, 4.8)
   * transformOrigin: "15% 90%" = rendered (7.2, 55.8)
   *
   * Pivot placed at (bk.x - 38, bk.y - 28).
   * At +110° CLOCKWISE rotation, mouth lands at ≈ (bk.x + 5, bk.y + 5).
   * → Mouth points DOWN-RIGHT into the beaker. ✓
   */
  const bW = 48, bH = 62;
  const pivotX = bk.x - 38;
  const pivotY = bk.y - 28;
  const originXPct = 15, originYPct = 90;
  const originX = bW * originXPct / 100; // 7.2
  const originY = bH * originYPct / 100; // 55.8
  const bottleX = pivotX - originX;
  const bottleY = pivotY - originY;

  // Pour point — where the stream starts (≈ mouth position when tilted)
  const pourX = bk.x + 2;
  const pourY = bk.y + 2;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]">

      {/* ═══ BOTTLE ═══ */}
      <motion.div
        className="absolute"
        style={{
          left: bottleX, top: bottleY,
          width: bW, height: bH,
          transformOrigin: `${originXPct}% ${originYPct}%`,
        }}
        initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
        animate={{
          /* POSITIVE rotation = clockwise = mouth goes RIGHT toward beaker */
          rotate:  [0,   0,  110, 115, 115, 115, 110,  50,  0],
          scale:   [0.5, 1,  1,   1,   1,   1,   1,   0.85, 0.5],
          opacity: [0,   1,  1,   1,   1,   1,   1,    1,    0],
        }}
        transition={{
          duration: 2.2,
          times: [0, 0.1, 0.22, 0.3, 0.52, 0.65, 0.74, 0.88, 1],
          ease: "easeInOut",
        }}
      >
        <motion.div className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: liquid }}
          animate={{ opacity: [0, 0, 0.25, 0.25, 0.25, 0] }}
          transition={{ duration: 2.2, times: [0, 0.18, 0.28, 0.65, 0.78, 1] }}
        />
        <svg width={bW} height={bH} viewBox="0 0 50 65" fill="none" className="relative z-10">
          <rect x="18" y="0" width="14" height="5" rx="2" fill={cap} />
          <rect x="20" y="5" width="10" height="8" rx="1.5"
            fill="rgba(200,230,255,0.3)" stroke="rgba(120,160,200,0.35)" strokeWidth="0.6" />
          <path d="M20 13 L14 20 Q11 24 11 28 L11 52 Q11 57 16 57 L34 57 Q39 57 39 52 L39 28 Q39 24 36 20 L30 13 Z"
            fill="rgba(200,230,255,0.2)" stroke="rgba(140,180,220,0.45)" strokeWidth="0.8" />
          <motion.path d="M12 28 L12 52 Q12 56 16 56 L34 56 Q38 56 38 52 L38 28 Z"
            fill={bodyFill}
            animate={{ opacity: [0.92, 0.92, 0.92, 0.55, 0.25, 0.1] }}
            transition={{ duration: 2.2, times: [0, 0.22, 0.35, 0.55, 0.75, 1] }}
          />
          <path d="M15 20 L15 50 Q15 53 16 53"
            stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <rect x="16" y="34" width="18" height="12" rx="2" fill="rgba(255,255,255,0.88)" />
          <text x="25" y="42" textAnchor="middle" fontSize="6.5" fontWeight="800"
            fill="#1a2340" fontFamily="system-ui, sans-serif">
            {chemicalName.length > 6 ? chemicalName.slice(0, 5) + "…" : chemicalName}
          </text>
        </svg>
      </motion.div>

      {/* ═══ LIQUID STREAM — from pour point downward ═══ */}
      <motion.div className="absolute" style={{
        left: pourX - 3, top: pourY, width: 5, borderRadius: 3,
        background: `linear-gradient(180deg, ${liquid}, ${liquid.replace(/[\d.]+\)$/, "0.35)")})`,
        boxShadow: `0 0 6px ${liquid}`, transformOrigin: "top center",
      }}
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height:  [0, 0, 40, 40, 40, 40, 18, 0],
          opacity: [0, 0, 0.85, 0.85, 0.85, 0.85, 0.3, 0],
        }}
        transition={{ duration: 2.2, times: [0, 0.22, 0.3, 0.44, 0.58, 0.68, 0.82, 1], ease: "easeInOut" }}
      />
      {/* Thin side stream */}
      <motion.div className="absolute" style={{
        left: pourX + 1, top: pourY + 4, width: 2.5, borderRadius: 2,
        background: liquid, transformOrigin: "top center",
      }}
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height:  [0, 0, 30, 30, 30, 30, 8, 0],
          opacity: [0, 0, 0.4, 0.4, 0.4, 0.4, 0.1, 0],
        }}
        transition={{ duration: 2.2, times: [0, 0.24, 0.32, 0.46, 0.6, 0.7, 0.84, 1], ease: "easeInOut" }}
      />

      {/* ═══ DRIP DROPS ═══ */}
      {[0, 1, 2].map((i) => (
        <motion.div key={`drip-${i}`} className="absolute rounded-full" style={{
          left: pourX - 2 + i * 3, top: pourY,
          width: 3, height: 5,
          borderRadius: "50% 50% 50% 50% / 35% 35% 65% 65%",
          background: liquid, boxShadow: `0 0 3px ${liquid}`,
        }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 0, 36, 42], opacity: [0, 0, 0.7, 0] }}
          transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: "easeIn" }}
        />
      ))}

      {/* ═══ SPLASH at beaker surface ═══ */}
      {splashes.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full" style={{
          left: bk.x - s.size / 2, top: bk.y + 36,
          width: s.size, height: s.size,
          background: liquid, filter: "blur(0.5px)", boxShadow: `0 0 3px ${liquid}`,
        }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: [0, s.dx * 0.5, s.dx], y: [0, s.dy, s.dy + 8],
            scale: [0, 1, 0], opacity: [0, 0.7, 0],
          }}
          transition={{ duration: 0.45, delay: s.delay, ease: "easeOut" }}
        />
      ))}

      {/* ═══ RIPPLE RINGS ═══ */}
      {[0, 1].map((i) => (
        <motion.div key={`rip-${i}`} className="absolute rounded-full border" style={{
          left: bk.x - 14, top: bk.y + 32,
          width: 28, height: 8, borderColor: liquid, borderWidth: 1,
        }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 0.3, 1 + i * 0.3, 1.4 + i * 0.3], opacity: [0, 0, 0.35, 0] }}
          transition={{ duration: 0.9, delay: 0.5 + i * 0.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
