"use client";

import { motion } from "framer-motion";

interface ColorChangeEffectProps {
  color?: string;
}

/**
 * COLOR_CHANGE — Dung dịch đổi màu dần.
 * A sweeping color wash across the vessel area.
 */
export function ColorChangeEffect({ color }: ColorChangeEffectProps) {
  const targetColor = color ?? "oklch(0.72 0.18 30)";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${targetColor}80, transparent 70%)`,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.6, 0.8], scale: [0.8, 1.1, 1] }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Ink-drop spreading animation */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 20,
          height: 20,
          background: targetColor,
          filter: "blur(20px)",
        }}
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: [0, 6, 8], opacity: [0.9, 0.4, 0] }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
    </div>
  );
}
