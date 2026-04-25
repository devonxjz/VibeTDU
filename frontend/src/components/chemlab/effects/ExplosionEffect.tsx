"use client";

import { motion } from "framer-motion";

/**
 * EXPLOSION — Nổ: flash trắng + screen shake + particle burst + safety warning.
 */
export function ExplosionEffect() {
  const sparks = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    return {
      id: i,
      x: Math.cos(angle) * (80 + Math.random() * 60),
      y: Math.sin(angle) * (80 + Math.random() * 60),
      size: 3 + Math.random() * 5,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* White flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: [0.9, 0] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Fireball */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 60,
          height: 60,
          background:
            "radial-gradient(circle, oklch(0.9 0.2 60), oklch(0.7 0.25 30), oklch(0.4 0.2 20 / 0))",
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3, 4], opacity: [1, 0.7, 0] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Sparks */}
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: "oklch(0.9 0.2 50)",
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: [0, s.x],
            y: [0, s.y],
            opacity: [1, 0],
            scale: [1, 0.3],
          }}
          transition={{ duration: 0.6 + Math.random() * 0.3, ease: "easeOut" }}
        />
      ))}

      {/* Smoke cloud */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, oklch(0.5 0.02 250 / 0.3), transparent)",
          filter: "blur(10px)",
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 2], opacity: [0, 0.6, 0] }}
        transition={{ duration: 2, delay: 0.4, ease: "easeOut" }}
      />

      {/* Safety warning */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-xl bg-red-500/90 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        ⚠️ Cảnh báo: Phản ứng nguy hiểm!
      </motion.div>
    </div>
  );
}
