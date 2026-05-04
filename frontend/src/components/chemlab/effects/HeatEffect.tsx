"use client";

import { motion } from "framer-motion";

const HEAT_COLUMNS = Array.from({ length: 7 }, (_, index) => ({
  id: index,
  left: 35 + index * 5.5,
  height: 44 + (index % 3) * 16,
  delay: index * 0.16,
}));

export function HeatEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 68%, rgba(255,161,78,0.12) 0%, rgba(255,122,69,0.08) 28%, transparent 64%)",
        }}
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[18%] left-1/2 h-16 w-[168px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,189,108,0.32) 0%, rgba(255,122,69,0.14) 38%, transparent 76%)",
          filter: "blur(10px)",
        }}
        animate={{ opacity: [0.22, 0.42, 0.22], scaleX: [0.92, 1.04, 0.92] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />

      {HEAT_COLUMNS.map((wave) => (
        <motion.div
          key={wave.id}
          className="absolute bottom-[24%] rounded-full"
          style={{
            left: `${wave.left}%`,
            width: 4,
            height: wave.height,
            background:
              "linear-gradient(180deg, rgba(255,220,160,0) 0%, rgba(255,208,143,0.3) 22%, rgba(255,158,94,0.18) 62%, rgba(255,158,94,0) 100%)",
            filter: "blur(0.6px)",
          }}
          initial={{ opacity: 0, y: 8, scaleY: 0.7 }}
          animate={{
            opacity: [0, 0.42, 0],
            y: [10, -18, -54],
            x: [0, 2.5, -2],
            scaleY: [0.7, 1.05, 0.78],
          }}
          transition={{
            duration: 1.8,
            delay: wave.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
