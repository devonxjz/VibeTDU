"use client";

import { motion } from "framer-motion";

import { useLabStore } from "@/stores/lab-store";
import { Formula } from "@/components/chemlab/Formula";

const BUBBLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: 29 + ((index * 11) % 42),
  size: 8 + (index % 5) * 2.2,
  rise: 92 + (index % 6) * 24,
  drift: ((index * 7) % 18) - 9,
  delay: index * 0.14,
  duration: 1.4 + (index % 4) * 0.18,
}));

export function GasBubbleEffect({ gasFormula }: { gasFormula?: string }) {
  const speed = useLabStore((state) => state.getEffectSpeed());
  const cycleScale = Math.max(0.55, Math.min(1.15, 1 / Math.max(0.7, speed * 0.72)));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute bottom-[18%] left-1/2 h-12 w-[180px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.24) 0%, rgba(210,243,255,0.18) 28%, transparent 72%)",
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.18, 0.36, 0.18], scaleX: [0.95, 1.06, 0.95] }}
        transition={{ duration: 1.2 * cycleScale, repeat: Infinity, ease: "easeInOut" }}
      />

      {BUBBLES.map((bubble, index) => (
        <motion.div
          key={bubble.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${bubble.left}%`,
            bottom: "19%",
            width: bubble.size,
            height: bubble.size,
          }}
          initial={{ opacity: 0, y: 4, x: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.85, 0.4, 0],
            y: [0, -bubble.rise * 0.3, -bubble.rise * 0.7, -bubble.rise],
            x: [0, bubble.drift * 0.5, bubble.drift, bubble.drift * 0.35],
            scale: [0.55, 1, 1.06, 0.82],
          }}
          transition={{
            duration: bubble.duration * cycleScale,
            delay: bubble.delay * cycleScale,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 24%, rgba(182,224,255,0.16) 58%, rgba(255,255,255,0.06) 100%)",
              border: "1px solid rgba(255,255,255,0.65)",
              boxShadow: "0 0 16px rgba(190, 235, 255, 0.14)",
            }}
          />
          <span
            className="absolute rounded-full bg-white/75"
            style={{
              top: "20%",
              left: "24%",
              width: bubble.size * 0.18,
              height: bubble.size * 0.18,
              filter: "blur(0.25px)",
            }}
          />
          {gasFormula && index === 5 && (
            <Formula
              formula={gasFormula}
              className="absolute -top-5 whitespace-nowrap text-[9px] font-bold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
