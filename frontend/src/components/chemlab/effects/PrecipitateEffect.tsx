"use client";

import { motion } from "framer-motion";

interface PrecipitateEffectProps {
  color?: string;
}

const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: 31 + ((index * 9) % 38),
  size: 2.6 + (index % 4) * 1.5,
  fall: 88 + (index % 5) * 18,
  drift: ((index * 5) % 16) - 8,
  delay: index * 0.12,
  duration: 1.35 + (index % 4) * 0.16,
}));

export function PrecipitateEffect({ color }: PrecipitateEffectProps) {
  const precipitateColor = color ?? "#e0e0e0";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.left}%`,
            top: "34%",
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, rgba(255,255,255,0.85) 0%, ${precipitateColor} 58%, ${precipitateColor} 100%)`,
            boxShadow: `0 0 6px ${precipitateColor}25`,
          }}
          initial={{ y: -6, x: 0, opacity: 0 }}
          animate={{
            y: [0, particle.fall * 0.5, particle.fall],
            x: [0, particle.drift * 0.5, particle.drift],
            opacity: [0, 0.82, 0.52],
            scale: [0.7, 1, 0.86],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 0.12,
            ease: "easeIn",
          }}
        />
      ))}

      <motion.div
        className="absolute bottom-[16.5%] left-1/2 h-[22px] w-[116px] -translate-x-1/2 rounded-[999px]"
        style={{
          background: `radial-gradient(ellipse at 50% 42%, ${precipitateColor}ee 0%, ${precipitateColor}b6 46%, transparent 100%)`,
          filter: "blur(1.2px)",
        }}
        initial={{ opacity: 0, scaleX: 0.38, scaleY: 0.65 }}
        animate={{ opacity: [0, 0.72, 0.92], scaleX: [0.38, 0.72, 1], scaleY: [0.65, 0.9, 1] }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
