"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Vessel as VesselType } from "@/types/lab";
import { useLabStore } from "@/stores/lab-store";
import { Formula } from "./Formula";

interface VesselProps {
  vessel: VesselType;
}

/**
 * Interactive vessel (beaker) on the board.
 * - Draggable (to reposition or pour into another vessel)
 * - Droppable (to receive another vessel poured into it)
 * - Clickable to select and show details in PropertiesPanel
 */
export function VesselComponent({ vessel }: VesselProps) {
  const { selectVessel, selectedVesselId, removeVessel } = useLabStore();
  const isSelected = selectedVesselId === vessel.id;



  const totalAmount = vessel.contents.reduce((sum, c) => sum + (c.amountMl || 10), 0);
  const fillRatio = Math.min(0.85, Math.max(0.15, totalAmount / 50));

  const isLoading = useLabStore((s) => s.isLoading);
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const isReacting = isLoading && vessel.id === centerBeakerId;

  // Determine a good display color - use vessel's displayColor
  const liquidColor = vessel.displayColor;

  return (
    <motion.div
      id={vessel.id}
      className={cn(
        "group absolute flex flex-col items-center",
      )}
      style={{
        left: vessel.position.x,
        top: vessel.position.y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isReacting 
          ? { x: [-3, 3, -3, 3, 0], scale: 1, opacity: 1, transition: { repeat: Infinity, duration: 0.4 } } 
          : { x: 0, scale: 1, opacity: 1 }
      }
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={(e) => {
        e.stopPropagation();
        selectVessel(vessel.id);
      }}
    >
      {/* Delete button */}
      <button
        className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          removeVessel(vessel.id);
        }}
      >
        <X className="h-3 w-3" />
      </button>

      {/* Beaker SVG */}
      <div
        className={cn(
          "relative transition-all duration-200",
          isSelected && "drop-shadow-[0_0_12px_oklch(0.85_0.15_170/0.4)]",
        )}
      >
        <svg width="64" height="80" viewBox="0 0 64 80" fill="none">
          {/* Beaker body - glass outline */}
          <path
            d="M12 10 L12 62 Q12 70 20 70 L44 70 Q52 70 52 62 L52 10"
            fill="rgba(200, 220, 240, 0.12)"
            stroke={isSelected ? "oklch(0.85 0.15 170)" : "rgba(120, 160, 200, 0.45)"}
            strokeWidth={isSelected ? "2" : "1.5"}
          />
          
          {/* Beaker rim */}
          <path
            d="M8 10 L56 10"
            stroke="rgba(120, 160, 200, 0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Pour spout left */}
          <path
            d="M8 10 L12 10 L10 6"
            stroke="rgba(120, 160, 200, 0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Measurement lines */}
          {[25, 35, 45, 55].map((y, i) => (
            <g key={i}>
              <line x1="14" y1={y} x2="22" y2={y} stroke="rgba(120, 160, 200, 0.25)" strokeWidth="0.8" />
              <text x="24" y={y + 3} fontSize="5" fill="rgba(120, 160, 200, 0.35)">
                {(4 - i) * 25}
              </text>
            </g>
          ))}

          {/* Liquid fill - animated */}
          <defs>
            <clipPath id={`liquid-clip-${vessel.id}`}>
              <rect x="13" y={70 - 58 * fillRatio} width="38" height={58 * fillRatio} rx="4" />
            </clipPath>
          </defs>
          
          <g clipPath={`url(#liquid-clip-${vessel.id})`}>
            {/* Main liquid body */}
            <rect x="13" y="12" width="38" height="57" rx="4" fill={liquidColor} opacity="0.85" />
            
            {/* Liquid surface wave */}
            <motion.path
              d={`M13 ${70 - 58 * fillRatio} Q22 ${68 - 58 * fillRatio} 32 ${70 - 58 * fillRatio} Q42 ${72 - 58 * fillRatio} 51 ${70 - 58 * fillRatio} L51 70 L13 70 Z`}
              fill={liquidColor}
              opacity="0.6"
              animate={{
                d: [
                  `M13 ${70 - 58 * fillRatio} Q22 ${68 - 58 * fillRatio} 32 ${70 - 58 * fillRatio} Q42 ${72 - 58 * fillRatio} 51 ${70 - 58 * fillRatio} L51 70 L13 70 Z`,
                  `M13 ${70 - 58 * fillRatio} Q22 ${72 - 58 * fillRatio} 32 ${70 - 58 * fillRatio} Q42 ${68 - 58 * fillRatio} 51 ${70 - 58 * fillRatio} L51 70 L13 70 Z`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>

          {/* Glass highlights */}
          <line x1="16" y1="15" x2="16" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="19" y1="20" x2="19" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      </div>

      {/* Label */}
      <div
        className={cn(
          "mt-1 rounded-md px-2 py-0.5 text-center transition-colors",
          isSelected ? "bg-mint/20 shadow-sm" : "bg-card/80",
        )}
      >
        <Formula
          formula={vessel.label}
          className="text-[11px] font-semibold text-navy"
        />
        {vessel.contents.length > 0 && (
          <div className="text-[9px] text-navy-soft">
            {vessel.contents.reduce((sum, c) => sum + (c.amountMl ?? 10), 0)} mL
          </div>
        )}
      </div>
    </motion.div>
  );
}
