"use client";

import { motion } from "framer-motion";

const SPARKS = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2;
  const distance = 92 + (index % 4) * 18;

  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.72,
    size: 3 + (index % 4),
    delay: (index % 8) * 0.015,
    duration: 0.55 + (index % 3) * 0.08,
  };
});

export function ExplosionEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,245,206,0.92) 0%, rgba(255,205,96,0.6) 10%, rgba(255,127,80,0.22) 24%, transparent 42%)",
          mixBlendMode: "screen",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.15, 0] }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {[0, 1].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: 78,
            height: 78,
            marginLeft: -39,
            marginTop: -39,
            borderColor: ring === 0 ? "rgba(255,248,220,0.85)" : "rgba(255,146,84,0.58)",
            boxShadow: ring === 0 ? "0 0 26px rgba(255,208,122,0.28)" : "0 0 18px rgba(255,120,70,0.2)",
          }}
          initial={{ scale: 0.12, opacity: 0.95 }}
          animate={{ scale: 3.2 + ring * 0.9, opacity: 0 }}
          transition={{ duration: 0.82 + ring * 0.1, delay: ring * 0.06, ease: "easeOut" }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,247,186,1) 0%, rgba(255,214,107,0.92) 20%, rgba(255,132,71,0.68) 46%, rgba(225,68,53,0.28) 70%, transparent 82%)",
          filter: "blur(0.2px) saturate(1.18)",
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2.2, 3.3], opacity: [1, 0.62, 0] }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      />

      {SPARKS.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: spark.size,
            height: spark.size,
            marginLeft: -spark.size / 2,
            marginTop: -spark.size / 2,
            background: spark.id % 2 === 0 ? "#fff1a8" : "#ff9f57",
            boxShadow: "0 0 10px rgba(255,204,102,0.8)",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: [0, spark.x],
            y: [0, spark.y],
            opacity: [1, 0],
            scale: [1, 0.25],
          }}
          transition={{ duration: spark.duration, delay: spark.delay, ease: "easeOut" }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(91,91,91,0.28) 0%, rgba(34,34,34,0.18) 44%, transparent 74%)",
          filter: "blur(12px)",
        }}
        initial={{ scale: 0.42, opacity: 0 }}
        animate={{ scale: [0.42, 1.95], opacity: [0, 0.48, 0] }}
        transition={{ duration: 1.7, delay: 0.16, ease: "easeOut" }}
      />

      <motion.div
        className="absolute bottom-8 left-1/2 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full border border-clay-brand-pink/35 bg-clay-brand-pink px-4 py-2 text-center clay-caption text-clay-on-primary shadow-[0_10px_28px_rgba(179,46,94,0.25)]"
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: [14, 0, 0, -6], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, times: [0, 0.18, 0.72, 1] }}
      >
        Phản ứng nguy hiểm
      </motion.div>
    </div>
  );
}
