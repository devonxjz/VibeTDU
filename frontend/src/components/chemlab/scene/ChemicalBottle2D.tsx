"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { CHEMICAL_COLORS, BOTTLE_COLORS } from "@/constants/chemicals";

/* ─── Types ─────────────────────────────────────────────────────────── */

export type BottleSize = "large" | "medium" | "small" | "flask" | "tube";
export type BottleCategory =
  | "acid"
  | "base"
  | "salt"
  | "metal"
  | "indicator"
  | "organic"
  | "gas";

interface ChemicalBottle2DProps {
  formula: string;
  category: BottleCategory;
  size?: BottleSize;
  rotate?: number;
  yOffset?: number;
  animate?: boolean;
}

/* ─── Resolve actual chemical color from formula ────────────────────── */

/**
 * Convert a display formula (may have subscript unicode) to the key used in CHEMICAL_COLORS.
 * e.g. "H₂SO₄" → "h2so4", "KMnO₄" → "kmno4"
 */
function formulaToKey(formula: string): string {
  return formula
    .toLowerCase()
    // Unicode subscripts → ascii digits
    .replace(/₀/g, "0").replace(/₁/g, "1").replace(/₂/g, "2")
    .replace(/₃/g, "3").replace(/₄/g, "4").replace(/₅/g, "5")
    .replace(/₆/g, "6").replace(/₇/g, "7").replace(/₈/g, "8").replace(/₉/g, "9")
    // Remove parens, spaces
    .replace(/[()[\]\s]/g, "");
}

function getLiquidColor(formula: string, fallbackCategory: BottleCategory): string {
  const key = formulaToKey(formula);
  if (CHEMICAL_COLORS[key]) return CHEMICAL_COLORS[key];
  // Category fallbacks with realistic chemistry colors
  const CAT_FALLBACK: Record<BottleCategory, string> = {
    acid:      "rgba(255, 250, 210, 0.85)",
    base:      "rgba(220, 235, 255, 0.85)",
    salt:      "rgba(240, 245, 255, 0.9)",
    metal:     "rgba(190, 195, 205, 0.9)",
    indicator: "rgba(255, 240, 150, 0.85)",
    organic:   "rgba(230, 245, 230, 0.85)",
    gas:       "rgba(210, 235, 255, 0.5)",
  };
  return CAT_FALLBACK[fallbackCategory];
}

function getCapColor(formula: string, category: BottleCategory): { cap: string; capLight: string; label: string } {
  const key = formulaToKey(formula);
  // Try BOTTLE_COLORS as label background
  const bottleColor = BOTTLE_COLORS[key];
  
  // Cap colors by category
  const CAP_COLORS: Record<BottleCategory, { cap: string; capLight: string; label: string }> = {
    acid:      { cap: "#8B1A00", capLight: "#B22800", label: "#FFF3EE" },
    base:      { cap: "#0D47A1", capLight: "#1565C0", label: "#E3F6FF" },
    salt:      { cap: "#4A148C", capLight: "#6A1B9A", label: "#F8F0FF" },
    metal:     { cap: "#37474F", capLight: "#546E7A", label: "#F5F5F5" },
    indicator: { cap: "#F57F17", capLight: "#FBC02D", label: "#FFFDE7" },
    organic:   { cap: "#1B5E20", capLight: "#2E7D32", label: "#F1F8E9" },
    gas:       { cap: "#0277BD", capLight: "#039BE5", label: "#E1F5FE" },
  };
  
  const base = CAP_COLORS[category];
  return { ...base, label: bottleColor ?? base.label };
}

/* ─── Size Variants ─────────────────────────────────────────────────── */

const SIZE_MAP: Record<
  BottleSize,
  { w: number; h: number; vb: string; type: "bottle" | "flask" | "tube" }
> = {
  large:  { w: 56, h: 90,  vb: "0 0 60 100", type: "bottle" },
  medium: { w: 44, h: 72,  vb: "0 0 60 100", type: "bottle" },
  small:  { w: 34, h: 58,  vb: "0 0 60 100", type: "bottle" },
  flask:  { w: 58, h: 78,  vb: "0 0 80 100", type: "flask"  },
  tube:   { w: 16, h: 56,  vb: "0 0 20 70",  type: "tube"   },
};

/* ─── Bottle SVG ─────────────────────────────────────────────────────── */

function BottleSVG({
  uid, formula, liquidColor, capColor, capLight, labelBg,
}: {
  uid: string; formula: string; liquidColor: string;
  capColor: string; capLight: string; labelBg: string;
}) {
  const clipId = `btl-${uid}`;
  return (
    <>
      <rect x="22" y="0" width="16" height="5" rx="2.5" fill={capLight} />
      <rect x="20" y="4" width="20" height="7" rx="3" fill={capColor} />
      <rect x="24" y="11" width="12" height="10" rx="1.5"
        fill="rgba(200,230,255,0.35)" stroke="rgba(120,160,200,0.3)" strokeWidth="0.6" />
      <path
        d="M24 21 L16 33 Q12 37 12 43 L12 86 Q12 93 18 93 L42 93 Q48 93 48 86 L48 43 Q48 37 44 33 L36 21 Z"
        fill="rgba(200,230,255,0.18)" stroke="rgba(120,160,200,0.35)" strokeWidth="0.8" />
      <clipPath id={clipId}>
        <path d="M13 46 L13 86 Q13 91 18 91 L42 91 Q47 91 47 86 L47 46 Z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x="12" y="44" width="36" height="50" fill={liquidColor} />
        <ellipse cx="30" cy="46" rx="17" ry="2.5" fill="rgba(255,255,255,0.28)" />
      </g>
      <path d="M18 32 L18 84 Q18 87 20 87"
        stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M21 35 L21 60"
        stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <rect x="16" y="56" width="28" height="20" rx="2" fill={labelBg} opacity="0.92" />
      <text x="30" y="67" textAnchor="middle" fontSize="9" fontWeight="700"
        fill="#1a1a2e" fontFamily="system-ui, sans-serif">
        {formula.length > 6 ? formula.slice(0, 5) + "…" : formula}
      </text>
    </>
  );
}

/* ─── Flask SVG ──────────────────────────────────────────────────────── */

function FlaskSVG({
  uid, formula, liquidColor, capColor, capLight, labelBg,
}: {
  uid: string; formula: string; liquidColor: string;
  capColor: string; capLight: string; labelBg: string;
}) {
  const clipId = `flask-${uid}`;
  return (
    <>
      <rect x="32" y="0" width="16" height="5" rx="2.5" fill={capLight} />
      <rect x="30" y="4" width="20" height="7" rx="3" fill={capColor} />
      <rect x="33" y="11" width="14" height="20" rx="1"
        fill="rgba(200,230,255,0.3)" stroke="rgba(120,160,200,0.3)" strokeWidth="0.6" />
      <path d="M33 31 L14 75 Q8 90 18 93 L62 93 Q72 90 66 75 L47 31 Z"
        fill="rgba(200,230,255,0.18)" stroke="rgba(120,160,200,0.35)" strokeWidth="0.8" />
      <clipPath id={clipId}>
        <path d="M15 68 L15 87 Q15 91 18 91 L62 91 Q65 91 65 87 L65 68 Z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x="14" y="66" width="52" height="30" fill={liquidColor} />
        <ellipse cx="40" cy="68" rx="25" ry="3" fill="rgba(255,255,255,0.22)" />
      </g>
      <path d="M20 70 L20 86 Q20 89 22 89"
        stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="20" y="72" width="40" height="14" rx="2" fill={labelBg} opacity="0.9" />
      <text x="40" y="81" textAnchor="middle" fontSize="9" fontWeight="700"
        fill="#1a1a2e" fontFamily="system-ui, sans-serif">
        {formula.length > 6 ? formula.slice(0, 5) + "…" : formula}
      </text>
    </>
  );
}

/* ─── Tube SVG ───────────────────────────────────────────────────────── */

function TubeSVG({ uid, liquidColor, capColor }: { uid: string; liquidColor: string; capColor: string }) {
  const clipId = `tube-${uid}`;
  return (
    <>
      <rect x="3" y="0" width="14" height="4" rx="1" fill={capColor} />
      <path d="M5 4 L5 54 Q5 64 10 64 Q15 64 15 54 L15 4 Z"
        fill="rgba(200,230,255,0.25)" stroke="rgba(120,160,200,0.3)" strokeWidth="0.6" />
      <clipPath id={clipId}>
        <path d="M6 32 L6 54 Q6 62 10 62 Q14 62 14 54 L14 32 Z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x="5" y="30" width="10" height="34" fill={liquidColor} />
      </g>
      <line x1="7" y1="8" x2="7" y2="52"
        stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
    </>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */

export function ChemicalBottle2D({
  formula,
  category,
  size = "medium",
  rotate = 0,
  yOffset = 0,
  animate = true,
}: ChemicalBottle2DProps) {
  const uid = useId().replace(/:/g, "");
  const { w, h, vb, type } = SIZE_MAP[size];

  // Get correct colors based on actual chemical formula
  const liquidColor = getLiquidColor(formula, category);
  const { cap, capLight, label: labelBg } = getCapColor(formula, category);

  const content =
    type === "flask" ? (
      <FlaskSVG uid={uid} formula={formula} liquidColor={liquidColor} capColor={cap} capLight={capLight} labelBg={labelBg} />
    ) : type === "tube" ? (
      <TubeSVG uid={uid} liquidColor={liquidColor} capColor={cap} />
    ) : (
      <BottleSVG uid={uid} formula={formula} liquidColor={liquidColor} capColor={cap} capLight={capLight} labelBg={labelBg} />
    );

  return (
    <motion.div
      className="relative shrink-0 cursor-default select-none"
      style={{
        width: w,
        height: h,
        transform: `rotate(${rotate}deg) translateY(${yOffset}px)`,
        transformOrigin: "bottom center",
      }}
      whileHover={animate ? { scale: 1.12, filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.22))", y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <svg width={w} height={h} viewBox={vb} fill="none"
        style={{ overflow: "visible" }} role="img" aria-label={`Lọ ${formula}`}>
        {content}
      </svg>
    </motion.div>
  );
}
