"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBottleColor, CHEMICAL_COLORS } from "@/constants/chemicals";

interface PouringAnimationProps {
  chemicalName: string;
  chemicalCategory: string;
  chemicalId: string;
  targetVesselId?: string;
  onComplete: () => void;
}

export function PouringAnimation({
  chemicalName,
  chemicalCategory,
  chemicalId,
  targetVesselId,
  onComplete,
}: PouringAnimationProps) {
  const bottleColor = getBottleColor(chemicalId);
  const liquidColor = CHEMICAL_COLORS[chemicalId] ?? "rgba(180, 200, 220, 0.7)";
  
  const [targetPos, setTargetPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (targetVesselId) {
      const el = document.getElementById(targetVesselId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 20,
        });
      }
    } else {
      setTargetPos({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }, [targetVesselId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!targetPos) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <div 
        className="absolute"
        style={{ left: targetPos.x, top: targetPos.y }}
      >
        {/* The animated bottle tilting and pouring */}
        <motion.div
          className="absolute left-0 bottom-0 origin-bottom"
          initial={{ rotate: 0, y: -120, x: -60, scale: 0.8, opacity: 0 }}
          animate={{
            rotate: [0, -50, -60, -60, -20, 0],
            y: [-120, -70, -70, -70, -90, -120],
            x: [-60, -20, -20, -20, -40, -60],
            scale: [0.8, 1.2, 1.2, 1.2, 1, 0.8],
            opacity: [0, 1, 1, 1, 1, 0],
          }}
          transition={{ duration: 1.8, times: [0, 0.15, 0.3, 0.7, 0.85, 1], ease: "easeInOut" }}
        >
          {/* Bottle glow effect */}
          <div className="relative">
            <motion.div 
               className="absolute inset-0 blur-[20px] rounded-full"
               style={{ background: bottleColor }}
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 0.6, 0] }}
               transition={{ duration: 1.8, times: [0, 0.3, 1] }}
            />
            <svg width="80" height="90" viewBox="0 0 60 70" fill="none" className="relative z-10 drop-shadow-2xl">
              {/* Cap */}
              <rect x="20" y="2" width="20" height="8" rx="3" fill="#455A64" />
              <rect x="22" y="0" width="16" height="5" rx="2.5" fill="#607D8B" />
              {/* Neck */}
              <rect x="23" y="10" width="14" height="10" rx="2" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              {/* Body */}
              <path
                d="M23 20 L16 28 Q13 32 13 36 L13 58 Q13 63 18 63 L42 63 Q47 63 47 58 L47 36 Q47 32 44 28 L37 20 Z"
                fill="rgba(255,255,255,0.25)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.5"
              />
              {/* Liquid */}
              <path
                d="M14 36 L14 58 Q14 62 18 62 L42 62 Q46 62 46 58 L46 36 Z"
                fill={bottleColor}
                opacity="0.95"
              />
              {/* Glass shine */}
              <path
                d="M17 28 L17 56 Q17 58 18 58"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
              <path
                d="M43 36 L43 54"
                stroke="white"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              {/* Label */}
              <rect x="19" y="40" width="22" height="14" rx="3" fill="rgba(255,255,255,0.95)" />
              <text x="30" y="50" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#263238">
                {chemicalName.length > 7 ? chemicalName.slice(0, 7) : chemicalName}
              </text>
            </svg>
          </div>
        </motion.div>

        {/* The liquid stream pouring */}
        <motion.div
          className="absolute rounded-full shadow-lg"
          style={{
            background: liquidColor,
            width: 8,
            left: -4,
            transformOrigin: "top center",
            filter: "blur(0.5px)",
            boxShadow: `0 0 15px ${liquidColor}, 0 0 30px ${liquidColor}`,
          }}
          initial={{ scaleY: 0, opacity: 0, y: -30, height: 110 }}
          animate={{
            scaleY: [0, 1, 1, 1, 0],
            opacity: [0, 0.95, 0.95, 0.95, 0],
            y: [-30, -15, -15, -15, -30],
          }}
          transition={{ duration: 1.2, delay: 0.3, times: [0, 0.15, 0.5, 0.8, 1] }}
        />

        {/* Splashes at the bottom */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 5,
              height: 3 + Math.random() * 5,
              background: liquidColor,
              filter: "blur(0.5px)",
              boxShadow: `0 0 8px ${liquidColor}`,
            }}
            initial={{ opacity: 0, y: 70, x: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [70, 45 - Math.random() * 45, 90],
              x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 50],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 0.7,
              delay: 0.45 + Math.random() * 0.4,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
