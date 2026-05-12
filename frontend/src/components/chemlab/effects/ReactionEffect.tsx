"use client";

import { motion, AnimatePresence } from "framer-motion";

import type { ActiveEffect } from "@/types/lab";
import { GasBubbleEffect } from "./GasBubbleEffect";
import { PrecipitateEffect } from "./PrecipitateEffect";
import { ColorChangeEffect } from "./ColorChangeEffect";
import { HeatEffect } from "./HeatEffect";
import { ExplosionEffect } from "./ExplosionEffect";

interface ReactionEffectProps {
  effect: ActiveEffect | null;
}

const SHAKE_BY_EFFECT: Partial<Record<ActiveEffect["type"], { x: number[]; y: number[] }>> = {
  HEAT: { x: [0, 0.6, -0.4, 0.2, 0], y: [0, -0.6, 0.3, -0.2, 0] },
  EXPLOSION: { x: [0, -6, 5, -4, 3, -2, 0], y: [0, 3, -4, 2, -1, 1, 0] },
};

export function ReactionEffect({ effect }: ReactionEffectProps) {
  const shake = effect ? SHAKE_BY_EFFECT[effect.type] : undefined;

  return (
    <AnimatePresence mode="wait">
      {effect && (
        <motion.div
          key={`${effect.type}-${effect.vesselId}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: shake?.x ?? 0,
            y: shake?.y ?? 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.24 },
            x: shake ? { duration: effect.type === "EXPLOSION" ? 0.42 : 0.8, ease: "easeInOut" } : undefined,
            y: shake ? { duration: effect.type === "EXPLOSION" ? 0.42 : 0.8, ease: "easeInOut" } : undefined,
          }}
          className="pointer-events-none absolute inset-0 z-30"
        >
          {effect.type === "GAS_BUBBLE" && <GasBubbleEffect gasFormula={effect.gasFormula} />}
          {effect.type === "PRECIPITATE" && (
            <PrecipitateEffect color={effect.precipitateColor} />
          )}
          {effect.type === "COLOR_CHANGE" && (
            <ColorChangeEffect color={effect.color} />
          )}
          {effect.type === "HEAT" && <HeatEffect />}
          {effect.type === "EXPLOSION" && <ExplosionEffect />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
