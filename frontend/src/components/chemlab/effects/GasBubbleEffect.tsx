"use client";

import { motion } from "framer-motion";

/**
 * GAS_BUBBLE — Bọt khí nổi lên từ dung dịch.
 * Creates multiple animated bubbles rising upward.
 */
export function GasBubbleEffect() {
  const bubbles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,  // 30%-70% horizontal
    size: 4 + Math.random() * 10,
    delay: Math.random() * 1.5,
    duration: 1.2 + Math.random() * 1.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            bottom: "20%",
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.7), oklch(0.85 0.08 200 / 0.4))",
            boxShadow: "inset 0 -1px 2px oklch(0.8 0.06 200 / 0.3)",
            willChange: "transform, opacity",
          }}
          initial={{ y: 0, opacity: 0, scale: 0.3 }}
          animate={{
            y: [0, -120, -250],
            opacity: [0, 0.9, 0],
            scale: [0.3, 1, 0.6],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Fizz glow at the reaction zone */}
      <motion.div
        className="absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: 120,
          height: 40,
          background:
            "radial-gradient(ellipse, oklch(0.9 0.1 180 / 0.3), transparent 70%)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}
