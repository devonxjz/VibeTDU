"use client";

import { motion } from "framer-motion";

interface PrecipitateEffectProps {
  color?: string;
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 25 + ((i * 23) % 51),
  size: 3 + (i % 6),
  delay: (i % 10) * 0.18,
  duration: 1.5 + (i % 5) * 0.28,
  driftA: ((i * 11) % 21) - 10,
  driftB: ((i * 7) % 13) - 6,
}));

/**
 * PRECIPITATE — Hạt kết tủa rơi xuống đáy dung dịch.
 * Particles drift downward and accumulate at the bottom.
 */
export function PrecipitateEffect({ color }: PrecipitateEffectProps) {
  const precipitateColor = color ?? "#e0e0e0";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: "30%",
            width: p.size,
            height: p.size,
            background: precipitateColor,
            filter: "blur(0.5px)",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, 80, 160],
            opacity: [0, 0.8, 0.5],
            x: [0, p.driftA, p.driftB],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeIn",
          }}
        />
      ))}
      {/* Sediment layer at bottom */}
      <motion.div
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 rounded-b-xl"
        style={{
          width: 100,
          height: 16,
          background: `linear-gradient(180deg, transparent, ${precipitateColor})`,
        }}
        initial={{ opacity: 0, scaleX: 0.5 }}
        animate={{ opacity: [0, 0.7, 0.9], scaleX: [0.5, 0.8, 1] }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
    </div>
  );
}
