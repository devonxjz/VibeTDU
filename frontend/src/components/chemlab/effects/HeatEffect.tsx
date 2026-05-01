"use client";

import { motion } from "framer-motion";

/**
 * HEAT — Toả nhiệt: hơi nóng bốc lên, ánh sáng cam đỏ.
 * Heat distortion waves + warm glow overlay.
 */
export function HeatEffect() {
  const waves = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    delay: i * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Warm glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 70%, oklch(0.7 0.2 30 / 0.25), transparent 60%)",
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Rising heat waves */}
      {waves.map((w) => (
        <motion.div
          key={w.id}
          className="absolute"
          style={{
            left: `${w.x}%`,
            bottom: "25%",
            width: 3,
            height: 30,
            background:
              "linear-gradient(180deg, oklch(0.8 0.15 40 / 0), oklch(0.8 0.15 40 / 0.3), oklch(0.8 0.15 40 / 0))",
            borderRadius: 2,
          }}
          initial={{ y: 0, opacity: 0, scaleY: 0.5 }}
          animate={{
            y: [0, -60, -120],
            opacity: [0, 0.6, 0],
            scaleY: [0.5, 1, 0.3],
            scaleX: [1, 1.5, 0.8],
          }}
          transition={{
            duration: 2,
            delay: w.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Pulsing red-orange border glow */}
      <motion.div
        className="absolute inset-4 rounded-2xl"
        style={{
          boxShadow: "inset 0 0 30px oklch(0.65 0.2 25 / 0.2)",
        }}
        animate={{
          boxShadow: [
            "inset 0 0 30px oklch(0.65 0.2 25 / 0.1)",
            "inset 0 0 50px oklch(0.65 0.2 25 / 0.3)",
            "inset 0 0 30px oklch(0.65 0.2 25 / 0.1)",
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}
