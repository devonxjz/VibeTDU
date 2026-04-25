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

/**
 * Renders the appropriate visual reaction effect
 * based on the effectType from the API response.
 */
export function ReactionEffect({ effect }: ReactionEffectProps) {
  return (
    <AnimatePresence>
      {effect && (
        <motion.div
          key={effect.type + effect.vesselId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 z-30"
        >
          {effect.type === "GAS_BUBBLE" && <GasBubbleEffect />}
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
