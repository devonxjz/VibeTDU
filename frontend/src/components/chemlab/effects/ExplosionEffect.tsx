"use client";

import { motion } from "framer-motion";

const SPARKS = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2;
  const ring = i % 3;
  const distance = 110 + ring * 32 + ((i * 17) % 28);

  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.78,
    size: 3 + (i % 5),
    delay: (i % 6) * 0.018,
    duration: 0.72 + (i % 4) * 0.08,
  };
});

/**
 * EXPLOSION — Nổ: flash trắng + screen shake + particle burst + safety warning.
 */
export function ExplosionEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden z-50 pointer-events-none">
      {/* Inject global screen shake while this component is mounted */}
      <style>{`
        body {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      {/* White flash overlay using the flash keyframe */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ animation: "flash 0.7s ease-out forwards" }}
      />

      {/* Shockwaves */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border-2"
          style={{
            width: 96,
            height: 96,
            marginLeft: -48,
            marginTop: -48,
            borderColor: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(251,146,60,0.65)",
            boxShadow: "0 0 24px rgba(251,146,60,0.45)",
          }}
          initial={{ scale: 0.15, opacity: 0.9 }}
          animate={{ scale: 4.6 + i * 0.7, opacity: 0 }}
          transition={{ duration: 0.9 + i * 0.18, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}

      {/* Fireball */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 60,
          height: 60,
          background:
            "radial-gradient(circle, #fff7ad 0%, #ffd166 20%, #ff7043 44%, rgba(190,24,93,0.45) 65%, transparent 76%)",
          filter: "blur(0.2px) saturate(1.35)",
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3.1, 4.4], opacity: [1, 0.82, 0] }}
        transition={{ duration: 0.92, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Sparks */}
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: s.id % 2 === 0 ? "#fff7ad" : "#ff8a3d",
            boxShadow: "0 0 12px rgba(255,214,102,0.9)",
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
            willChange: "transform, opacity",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: [0, s.x],
            y: [0, s.y],
            opacity: [1, 0],
            scale: [1, 0.3],
          }}
          transition={{ duration: s.duration, delay: s.delay, ease: "easeOut" }}
        />
      ))}

      {/* Smoke cloud */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, rgba(71,85,105,0.34), rgba(15,23,42,0.22), transparent 70%)",
          filter: "blur(12px)",
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 2.4], opacity: [0, 0.62, 0] }}
        transition={{ duration: 2.1, delay: 0.32, ease: "easeOut" }}
      />

      {/* Safety warning */}
      <motion.div
        className="absolute bottom-8 left-1/2 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-lg border border-red-200 bg-red-700 px-4 py-2 text-center text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(127,29,29,0.36)] backdrop-blur-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
      >
        Phản ứng nguy hiểm!
      </motion.div>
    </div>
  );
}
