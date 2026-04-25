"use client";

import { motion } from "framer-motion";

interface PrecipitateEffectProps {
  color?: string;
}

/**
 * PRECIPITATE — Hạt kết tủa rơi xuống đáy dung dịch.
 * Particles drift downward and accumulate at the bottom.
 */
export function PrecipitateEffect({ color }: PrecipitateEffectProps) {
  const precipitateColor = color ?? "oklch(0.85 0.12 250)";

  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: 25 + Math.random() * 50,
    size: 3 + Math.random() * 6,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
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
            x: [0, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10],
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
