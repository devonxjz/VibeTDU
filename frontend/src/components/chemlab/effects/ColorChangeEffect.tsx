"use client";

import { motion } from "framer-motion";

interface ColorChangeEffectProps {
  color?: string;
}

export function ColorChangeEffect({ color }: ColorChangeEffectProps) {
  const targetColor = color ?? "oklch(0.72 0.18 30)";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 62%, color-mix(in srgb, ${targetColor} 72%, transparent) 0%, transparent 68%)`,
          filter: "blur(6px)",
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0, 0.28, 0.42], scale: [0.92, 1.04, 1] }}
        transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        className="absolute left-1/2 top-[56%] h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${targetColor} 0%, color-mix(in srgb, ${targetColor} 70%, transparent) 56%, transparent 100%)`,
          filter: "blur(22px)",
        }}
        initial={{ opacity: 0.24, scale: 0.18 }}
        animate={{ opacity: [0.24, 0.18, 0], scale: [0.18, 1.7, 2.35] }}
        transition={{ duration: 2.35, ease: "easeOut" }}
      />

      <motion.div
        className="absolute inset-x-[27%] bottom-[20%] h-[88px] rounded-[999px]"
        style={{
          background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${targetColor} 58%, transparent) 35%, color-mix(in srgb, ${targetColor} 78%, transparent) 100%)`,
          filter: "blur(8px)",
        }}
        initial={{ opacity: 0, scaleY: 0.65 }}
        animate={{ opacity: [0, 0.32, 0.48], scaleY: [0.65, 1.05, 1] }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
    </div>
  );
}
