"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { FlaskConical, X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Vessel as VesselType } from "@/types/lab";
import { useLabStore } from "@/stores/lab-store";
import { Formula } from "./Formula";

interface VesselProps {
  vessel: VesselType;
}

/**
 * Interactive vessel on the board.
 * - Draggable (to reposition or pour into another vessel)
 * - Droppable (to receive another vessel poured into it)
 * - Clickable to select and show details in PropertiesPanel
 */
export function VesselComponent({ vessel }: VesselProps) {
  const { selectVessel, selectedVesselId, removeVessel } = useLabStore();
  const isSelected = selectedVesselId === vessel.id;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: vessel.id,
    data: { type: "vessel", vesselId: vessel.id },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${vessel.id}`,
    data: { type: "vessel-target", vesselId: vessel.id },
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <motion.div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      className={cn(
        "group absolute flex cursor-grab flex-col items-center",
        isDragging && "z-50 cursor-grabbing opacity-70",
        isOver && "scale-105",
      )}
      style={{
        left: vessel.position.x,
        top: vessel.position.y,
        ...style,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={(e) => {
        e.stopPropagation();
        selectVessel(vessel.id);
      }}
      {...attributes}
      {...listeners}
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

      {/* Vessel SVG */}
      <div
        className={cn(
          "relative flex h-20 w-14 flex-col items-center rounded-b-xl rounded-t-md border-2 transition-all duration-200",
          isSelected
            ? "border-mint shadow-[0_0_12px_oklch(0.85_0.15_170/0.4)]"
            : "border-white/60 shadow-[var(--shadow-card)]",
          isOver && "border-mint ring-2 ring-mint/40",
        )}
        style={{
          background: `linear-gradient(180deg, oklch(1 0 0 / 0.1) 0%, oklch(1 0 0 / 0.05) 30%, ${vessel.displayColor}60 30%, ${vessel.displayColor} 100%)`,
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Glass neck */}
        <div className="h-2 w-6 rounded-t-sm border-x-2 border-t-2 border-white/50 bg-white/10" />

        {/* Liquid fill */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-b-xl transition-all duration-500"
          style={{
            height: "60%",
            background: `linear-gradient(180deg, ${vessel.displayColor}80, ${vessel.displayColor})`,
          }}
        />

        {/* Glass highlight */}
        <div className="absolute left-1 top-3 h-8 w-1 rounded-full bg-white/40" />

        {/* Flask icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FlaskConical
            className="h-6 w-6 text-white/30"
            strokeWidth={1.2}
          />
        </div>
      </div>

      {/* Label */}
      <div
        className={cn(
          "mt-1.5 rounded-md px-2 py-0.5 text-center transition-colors",
          isSelected ? "bg-mint/20" : "bg-card/80",
        )}
      >
        <Formula
          formula={vessel.label}
          className="text-[11px] font-semibold text-navy"
        />
        {vessel.contents.length > 0 && (
          <div className="text-[9px] text-navy-soft">
            {vessel.contents[0].amountMl ?? 10} mL
          </div>
        )}
      </div>
    </motion.div>
  );
}
