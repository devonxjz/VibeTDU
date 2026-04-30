"use client";

import { useEffect } from "react";

import { motion, useSpring, useTransform } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { Formula } from "@/components/chemlab/Formula";
import { blendColors } from "@/utils/color";

/* ─── BeakerHero ────────────────────────────────────────────────────── */

interface BeakerHeroProps {
  /** ID of the center vessel this beaker represents */
  vesselId: string | null;
}

export function BeakerHero({ vesselId }: BeakerHeroProps) {
  const vessel = useLabStore((s) =>
    vesselId ? s.vessels[vesselId] : null
  );
  const lastReaction = useLabStore((s) => s.lastReaction);
  const activeEffect = useLabStore((s) => s.activeEffect);

  /* ── Liquid level — grows with each content added ─────────────────── */
  // Only count real chemicals (formula != "") so the init empty vessel shows nothing
  const realContents = vessel?.contents.filter((c) => c.formula) ?? [];
  const contentCount = realContents.length;
  // Start at 0% when empty, each chem adds ~14%, max 82%
  const targetFill = contentCount === 0 ? 0 : Math.min(0.82, 0.18 + contentCount * 0.14);
  const liquidFill = useSpring(0, { stiffness: 60, damping: 18 });

  // Explicitly set the spring target whenever contentCount changes
  useEffect(() => {
    liquidFill.set(targetFill);
  }, [targetFill, liquidFill]);

  // surfaceY in the 200×280 viewBox space (bottom = 250, top = 30)
  const surfaceY = useTransform(liquidFill, (f) => 250 - f * 220);

  // No color when empty — fully transparent
  const liquidColor = contentCount === 0
    ? "rgba(200,230,255,0.0)"
    : (vessel?.displayColor ?? "rgba(120,190,255,0.55)");

  /* ── Precipitate effect ────────────────────────────────────────────── */
  const showPrecipitate =
    activeEffect?.type === "PRECIPITATE" && activeEffect.vesselId === vesselId;
  const precipitateColor = activeEffect?.precipitateColor ?? "#e0e0e0";

  /* ── Product label ─────────────────────────────────────────────────── */
  const showLabel =
    lastReaction?.hasReaction &&
    vessel?.label &&
    vesselId != null;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ zIndex: 10 }}
    >
      {/* Product label — floats above beaker */}
      {showLabel && vessel && (
        <motion.div
          key={vessel.label || "empty-label"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-20"
        >
          <div className="relative rounded-lg bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-gray-100">
            <Formula
              formula={vessel.label}
              className="text-sm font-bold text-gray-800 whitespace-nowrap"
            />
            {/* Arrow pointing down */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "8px solid white",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.08))",
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Beaker SVG */}
      <div
        data-beaker-hero
        className="relative"
        style={{
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))",
          transition: "filter 0.2s ease",
        }}
      >
        <svg
          width="220"
          height="320"
          viewBox="0 0 200 280"
          fill="none"
          role="img"
          aria-label="Cốc thí nghiệm trung tâm"
          style={{ overflow: "visible" }}
        >
          {/* Beaker body — glass outline */}
          <motion.path
            d="M24 18 L22 240 Q22 262 44 262 L156 262 Q178 262 178 240 L176 18"
            fill="rgba(200,230,255,0.05)"
            initial={{ stroke: "rgba(176,190,197,0.5)", strokeWidth: 2 }}
            animate={{
              stroke: "rgba(176,190,197,0.5)",
              strokeWidth: 2,
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Rim — top horizontal bar */}
          <motion.path
            d="M14 18 L186 18"
            animate={{
              stroke: "rgba(176,190,197,0.5)",
            }}
            transition={{ duration: 0.2 }}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Pour spout — left notch */}
          <path
            d="M14 18 L24 18 L18 8"
            stroke="rgba(176,190,197,0.5)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Elliptical rim at top (depth illusion) */}
          <motion.ellipse
            cx="100"
            cy="18"
            rx="86"
            ry="10"
            fill="rgba(200,230,255,0.08)"
            animate={{
              stroke: "rgba(176,190,197,0.3)",
            }}
            transition={{ duration: 0.2 }}
            strokeWidth="1.5"
          />

          {/* Graduation marks + labels */}
          {[240, 210, 180, 150, 120, 90].map((y, i) => (
            <g key={y}>
              <line
                x1="30" y1={y}
                x2="52" y2={y}
                stroke="rgba(100,140,180,0.3)"
                strokeWidth="1.2"
              />
              <text
                x="58"
                y={y + 4}
                fontSize="11"
                fill="rgba(100,140,180,0.45)"
                fontFamily="system-ui, monospace"
                fontWeight="500"
              >
                {(6 - i) * 40}
              </text>
            </g>
          ))}

          {/* ── Liquid fill area ── */}
          <defs>
            <clipPath id="beaker-hero-clip">
              <path d="M23 20 L21 240 Q21 260 44 260 L156 260 Q179 260 179 240 L177 20 Z" />
            </clipPath>
          </defs>

          <g clipPath="url(#beaker-hero-clip)">
            {/* Liquid body */}
            <motion.rect
              x="23"
              y={surfaceY}
              width="154"
              height="242"
              fill={liquidColor}
              opacity="0.8"
            />

            {/* Liquid wave surface */}
            <motion.path
              animate={{
                d: [
                  "M23 0 Q75 -5 100 0 Q130 5 177 0 L177 12 L23 12 Z",
                  "M23 0 Q75 5 100 0 Q130 -5 177 0 L177 12 L23 12 Z",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
              fill={liquidColor}
              opacity="0.55"
              style={{ y: surfaceY }}
            />

            {/* Liquid surface gloss */}
            <motion.ellipse
              cx="100"
              cy={0}
              rx="70"
              ry="5"
              fill="rgba(255,255,255,0.18)"
              style={{ y: surfaceY }}
            />
          </g>

          {/* Precipitate layer at bottom */}
          {showPrecipitate && (
            <motion.ellipse
              cx="100"
              cy="252"
              rx="70"
              ry="8"
              fill={precipitateColor}
              style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.08)) drop-shadow(0 0 12px rgba(255,255,255,0.5))" }}
              initial={{ scaleX: 0, scaleY: 0.5, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 0.88 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ transformOrigin: "100px 252px" }}
            />
          )}

          {/* Glass highlights — left */}
          <line
            x1="36" y1="26"
            x2="32" y2="244"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Secondary highlight */}
          <line
            x1="46" y1="32"
            x2="43" y2="200"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Drag hint — show when beaker has no real chemicals */}
        {contentCount === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
            <div className="flex flex-col items-center gap-1.5 opacity-50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(100,150,200,0.8)" strokeWidth="1.5">
                <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-blue-400 text-center leading-snug px-6">
                Thêm hoá chất
                <br />từ thư viện bên phải
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
