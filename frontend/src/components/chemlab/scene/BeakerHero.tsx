"use client";

import { useEffect } from "react";

import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import { useLabStore } from "@/stores/lab-store";
import { Formula } from "@/components/chemlab/Formula";

interface BeakerHeroProps {
  vesselId: string | null;
}

export function BeakerHero({ vesselId }: BeakerHeroProps) {
  const vessel = useLabStore((state) => (vesselId ? state.vessels[vesselId] : null));
  const lastReaction = useLabStore((state) => state.lastReaction);
  const activeEffect = useLabStore((state) => state.activeEffect);
  const effectSpeed = useLabStore((state) => state.getEffectSpeed());

  const realContents = vessel?.contents.filter((content) => content.formula) ?? [];
  const contentCount = realContents.length;
  const targetFill = contentCount === 0 ? 0 : Math.min(0.82, 0.18 + contentCount * 0.14);
  const liquidFill = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    liquidFill.set(targetFill);
  }, [targetFill, liquidFill]);

  const surfaceY = useTransform(liquidFill, (fill) => 250 - fill * 220);

  const liquidColor =
    contentCount === 0
      ? "rgba(200,230,255,0)"
      : vessel?.displayColor ?? "rgba(120,190,255,0.55)";

  const showPrecipitate =
    activeEffect?.type === "PRECIPITATE" && activeEffect.vesselId === vesselId;
  const precipitateColor = activeEffect?.precipitateColor ?? "#e0e0e0";
  const showHeat = activeEffect?.type === "HEAT" && activeEffect.vesselId === vesselId;
  const showExplosion =
    activeEffect?.type === "EXPLOSION" && activeEffect.vesselId === vesselId;
  const showGas = activeEffect?.type === "GAS_BUBBLE" && activeEffect.vesselId === vesselId;
  const showColorShift =
    activeEffect?.type === "COLOR_CHANGE" && activeEffect.vesselId === vesselId;

  const showLabel = lastReaction?.hasReaction && vessel?.label && vesselId != null;

  const stageGlow = showExplosion
    ? "radial-gradient(circle, rgba(255,194,92,0.72) 0%, rgba(255,122,69,0.38) 34%, transparent 70%)"
    : showHeat
      ? "radial-gradient(circle, rgba(255,164,88,0.34) 0%, rgba(255,120,70,0.14) 38%, transparent 74%)"
      : showColorShift
        ? "radial-gradient(circle, rgba(198,176,255,0.28) 0%, rgba(124,148,255,0.12) 36%, transparent 72%)"
        : "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(176,220,255,0.05) 32%, transparent 70%)";

  const waveDuration = Math.max(1.5, 3 / Math.max(0.8, effectSpeed));

  return (
    <div className="relative flex flex-col items-center" style={{ zIndex: 10 }}>
      {showLabel && vessel && (
        <motion.div
          key={vessel.label || "empty-label"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-[calc(100%-4px)] left-1/2 z-30 -translate-x-1/2"
        >
          <div className="relative max-w-[min(78vw,420px)] rounded-[18px] border border-clay-hairline bg-clay-surface-card px-4 py-2.5 shadow-[0_14px_34px_rgba(15,23,42,0.16)]">
            <Formula
              formula={vessel.label}
              className="block break-words text-center clay-title-sm leading-tight text-clay-ink"
            />
            <div
              className="absolute bottom-[-8px] left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "9px solid var(--clay-surface-card)",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.08))",
              }}
            />
          </div>
        </motion.div>
      )}

      <motion.div
        className="absolute bottom-2 h-10 w-[186px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(33,52,82,0.2) 0%, rgba(33,52,82,0.1) 36%, transparent 78%)",
          filter: "blur(10px)",
        }}
        animate={{ opacity: [0.48, 0.62, 0.48], scaleX: [0.96, 1.02, 0.96] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        data-beaker-hero
        className="relative"
        style={{
          filter: showExplosion
            ? "drop-shadow(0 0 34px rgba(248,113,22,0.48)) drop-shadow(0 24px 40px rgba(15,23,42,0.22))"
            : "drop-shadow(0 18px 34px rgba(15,23,42,0.16))",
          transition: "filter 0.2s ease",
        }}
      >
        <motion.div
          className="absolute inset-x-[18%] top-[14%] bottom-[18%] -z-10 rounded-[50%]"
          style={{
            background: stageGlow,
            filter: "blur(14px)",
          }}
          animate={{
            opacity: showExplosion ? [0.28, 0.92, 0.18] : [0.1, 0.24, 0.1],
            scale: showExplosion ? [0.9, 1.22, 1] : [0.96, 1.04, 0.96],
          }}
          transition={{
            duration: showExplosion ? 0.9 : 2.4,
            repeat: showExplosion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />

        <AnimatePresence>
          {showExplosion && (
            <motion.div
              className="absolute inset-0 -z-10 rounded-full"
              initial={{ scale: 0.68, opacity: 0 }}
              animate={{ scale: [0.78, 1.2, 0.98], opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(circle, rgba(255,230,126,0.78) 0%, rgba(255,126,72,0.52) 30%, transparent 68%)",
                filter: "blur(8px)",
              }}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="absolute left-1/2 top-[18px] z-10 h-6 w-[164px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 50%, transparent 80%)",
            filter: "blur(4px)",
          }}
          animate={{ opacity: [0.14, 0.28, 0.14] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg
          width="236"
          height="336"
          viewBox="0 0 200 280"
          fill="none"
          role="img"
          aria-label="Cốc thí nghiệm trung tâm"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id="beaker-heat-glow" cx="50%" cy="58%" r="56%">
              <stop offset="0%" stopColor="rgba(255, 164, 88, 0.34)" />
              <stop offset="100%" stopColor="rgba(255, 50, 0, 0)" />
            </radialGradient>

            <linearGradient id="beaker-glass-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
              <stop offset="35%" stopColor="rgba(235,244,255,0.12)" />
              <stop offset="100%" stopColor="rgba(185,214,255,0.08)" />
            </linearGradient>

            <linearGradient id="beaker-front-reflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.48)" />
              <stop offset="22%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <linearGradient id="beaker-liquid-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="0.42" />
              <stop offset="28%" stopColor={liquidColor} stopOpacity="0.5" />
              <stop offset="74%" stopColor={liquidColor} stopOpacity="0.58" />
              <stop offset="100%" stopColor={liquidColor} stopOpacity="0.64" />
            </linearGradient>

            <linearGradient id="beaker-liquid-soft-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="18%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="58%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(18,24,38,0.08)" />
            </linearGradient>

            <radialGradient id="beaker-liquid-bottom" cx="50%" cy="88%" r="66%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="56%" stopColor={liquidColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgba(18,24,38,0.12)" />
            </radialGradient>

            <clipPath id="beaker-hero-clip">
              <path d="M23 20 L21 240 Q21 260 44 260 L156 260 Q179 260 179 240 L177 20 Z" />
            </clipPath>
          </defs>

          <motion.path
            d="M24 18 L22 240 Q22 262 44 262 L156 262 Q178 262 178 240 L176 18"
            fill="url(#beaker-glass-fill)"
            initial={{ stroke: "var(--beaker-glass)", strokeWidth: 2 }}
            animate={{
              stroke: showExplosion
                ? "rgba(255, 138, 76, 0.95)"
                : showHeat
                  ? "rgba(255, 132, 72, 0.82)"
                  : "var(--beaker-glass)",
              strokeWidth: showExplosion ? 4.4 : showHeat ? 3.8 : 2.35,
              filter: showExplosion
                ? "drop-shadow(0 0 16px rgba(255, 112, 67, 0.7))"
                : showHeat
                  ? "drop-shadow(0 0 12px rgba(255, 118, 52, 0.54))"
                  : "none",
            }}
            transition={{ duration: 0.45 }}
          />

          <AnimatePresence>
            {showHeat && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.08, 0.34, 0.08] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.7, repeat: Infinity }}
                d="M30 30 L28 236 Q28 256 48 256 L152 256 Q172 256 172 236 L170 30"
                fill="url(#beaker-heat-glow)"
              />
            )}
          </AnimatePresence>

          <motion.path
            d="M14 18 L186 18"
            stroke="var(--beaker-glass)"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={{ opacity: showExplosion ? 0.92 : 1 }}
          />

          <path
            d="M14 18 L24 18 L18 8"
            stroke="var(--beaker-glass)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <motion.ellipse
            cx="100"
            cy="18"
            rx="86"
            ry="10"
            fill="rgba(200,230,255,0.03)"
            stroke="var(--beaker-glass)"
            strokeWidth="1.5"
            animate={{ opacity: showExplosion ? 0.82 : 1 }}
          />

          {[240, 210, 180, 150, 120, 90].map((y, index) => (
            <g key={y}>
              <line
                x1="30"
                y1={y}
                x2="52"
                y2={y}
                stroke="rgba(100,140,180,0.42)"
                strokeWidth="1.35"
              />
              <text
                x="58"
                y={y + 4}
                fontSize="11"
                fill="rgba(88,124,166,0.62)"
                fontFamily="system-ui, monospace"
                fontWeight="600"
              >
                {(6 - index) * 40}
              </text>
            </g>
          ))}

          <g clipPath="url(#beaker-hero-clip)">
            <motion.rect
              x="23"
              y={surfaceY}
              width="154"
              height="242"
              fill="url(#beaker-liquid-fill)"
              opacity={contentCount === 0 ? 0 : 1}
            />

            <motion.rect
              x="27"
              y={surfaceY}
              width="146"
              height="236"
              fill="url(#beaker-liquid-soft-light)"
              opacity={contentCount === 0 ? 0 : 0.82}
            />

            <motion.ellipse
              cx="100"
              cy="246"
              rx="66"
              ry="22"
              fill="url(#beaker-liquid-bottom)"
              opacity={contentCount === 0 ? 0 : 0.46}
            />

            <motion.rect
              x="27"
              y={surfaceY}
              width="18"
              height="220"
              fill="url(#beaker-front-reflection)"
              opacity={contentCount === 0 ? 0 : 0.42}
            />

            <motion.rect
              x="134"
              y={surfaceY}
              width="18"
              height="220"
              fill="rgba(255,255,255,0.08)"
              opacity={contentCount === 0 ? 0 : 0.1}
            />

            <motion.path
              d="M26 252 Q100 236 174 252"
              fill="rgba(255,255,255,0.05)"
              opacity={contentCount === 0 ? 0 : 0.2}
            />

            <motion.path
              animate={{
                d: [
                  "M23 0 Q75 -5 100 0 Q130 5 177 0 L177 12 L23 12 Z",
                  "M23 0 Q75 5 100 0 Q130 -5 177 0 L177 12 L23 12 Z",
                ],
              }}
              transition={{
                duration: waveDuration,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
              fill={liquidColor}
              opacity={showGas ? 0.94 : 0.88}
              style={{ y: surfaceY }}
            />

            <motion.ellipse
              cx="100"
              cy={0}
              rx="70"
              ry="5"
              fill="rgba(255,255,255,0.22)"
              style={{ y: surfaceY }}
              animate={{ opacity: [0.18, 0.3, 0.18] }}
              transition={{ duration: waveDuration, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.ellipse
              cx="102"
              cy={0}
              rx="62"
              ry="4"
              fill="rgba(255,255,255,0.08)"
              style={{ y: surfaceY }}
              animate={{ opacity: [0.07, 0.13, 0.07] }}
              transition={{ duration: waveDuration * 0.9, repeat: Infinity, ease: "easeInOut" }}
            />

            {showGas &&
              [0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                <motion.circle
                  key={index}
                  cx={52 + index * 14}
                  cy={244}
                  r={2.4 + (index % 3)}
                  fill="rgba(255,255,255,0.82)"
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{
                    opacity: [0, 0.85, 0],
                    y: [0, -92 - (index % 4) * 14],
                    scale: [0.7, 1.25, 0.5],
                  }}
                  transition={{
                    duration: 1.6,
                    delay: index * 0.12,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}

            {contentCount > 0 && (
              <motion.path
                d="M32 250 Q100 238 168 250"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.08, 0.16, 0.08] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </g>

          {showPrecipitate && (
            <>
              <motion.ellipse
                cx="100"
                cy="252"
                rx="70"
                ry="8"
                fill={precipitateColor}
                initial={{ scaleX: 0, scaleY: 0.5, opacity: 0 }}
                animate={{ scaleX: 1, scaleY: 1, opacity: 0.88 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  filter:
                    "drop-shadow(0 0 5px rgba(0,0,0,0.08)) drop-shadow(0 0 12px rgba(255,255,255,0.32))",
                  transformOrigin: "100px 252px",
                }}
              />
              <motion.ellipse
                cx="100"
                cy="246"
                rx="54"
                ry="4"
                fill="rgba(255,255,255,0.14)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.22, 0.08] }}
                transition={{ duration: 1.3, ease: "easeOut" }}
              />
            </>
          )}

          <line
            x1="36"
            y1="26"
            x2="32"
            y2="244"
            stroke="rgba(255,255,255,0.44)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <line
            x1="46"
            y1="32"
            x2="43"
            y2="200"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M156 28 Q166 126 154 242"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>

        {contentCount === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
            <div className="flex flex-col items-center gap-1.5 rounded-[18px] border border-clay-hairline bg-clay-surface-card/80 px-4 py-3 opacity-95 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(106,122,148,0.82)"
                strokeWidth="1.5"
              >
                <path
                  d="M12 5v14M5 12l7 7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="px-2 text-center clay-body-sm text-clay-body">
                Thêm hoá chất
                <br />
                từ thư viện bên phải
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
