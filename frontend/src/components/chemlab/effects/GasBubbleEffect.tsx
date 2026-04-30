"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { Formula } from "@/components/chemlab/Formula";

interface Bubble {
  id: string;
  x: number; // 20 - 80%
  size: number; // 8 - 16px
  duration: number; // 1.5 - 3s
  delay: number;
}

export function GasBubbleEffect() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const activeEffect = useLabStore((s) => s.activeEffect);
  const getEffectSpeed = useLabStore((s) => s.getEffectSpeed);

  useEffect(() => {
    // If not gas bubble, just in case (though parent unmounts it)
    if (activeEffect?.type !== "GAS_BUBBLE") return;

    const speed = getEffectSpeed();
    const intervalMs = Math.max(20, 200 / speed); // limit to 20ms fastest

    const interval = setInterval(() => {
      setBubbles((prev) => {
        // Keep max 40 bubbles to avoid performance issues
        if (prev.length > 40) return prev.slice(1);
        
        return [
          ...prev,
          {
            id: `bubble-${Date.now()}-${Math.random()}`,
            x: 20 + Math.random() * 60,
            size: 8 + Math.random() * 8,
            duration: (1.5 + Math.random() * 1.5) / Math.max(0.5, speed * 0.5),
            delay: 0,
          },
        ];
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeEffect, getEffectSpeed]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -250, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: b.duration, ease: "easeOut" }}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: `${b.x}%`,
              bottom: "15%",
            }}
            onAnimationComplete={() => {
              setBubbles((prev) => prev.filter((bub) => bub.id !== b.id));
            }}
          >
            {/* SVG Circle */}
            <svg width={b.size} height={b.size} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="5"
              />
              <circle
                cx="30"
                cy="30"
                r="10"
                fill="rgba(255,255,255,0.6)"
              />
            </svg>

            {/* Optional formula label */}
            {activeEffect?.gasFormula && b.size > 12 && (
              <Formula
                formula={activeEffect.gasFormula}
                className="text-[8px] font-bold text-white/80 absolute -top-4 drop-shadow-sm"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Fizz glow at the reaction zone */}
      <motion.div
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: 140,
          height: 30,
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.4), transparent 70%)",
        }}
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 1 / Math.max(0.5, getEffectSpeed()), repeat: Infinity }}
      />
    </div>
  );
}
