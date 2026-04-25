"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState, useCallback } from "react";
import { Toolbar } from "@/components/chemlab/Toolbar";
import { PropertiesPanel } from "@/components/chemlab/PropertiesPanel";
import { SearchPanel } from "@/components/chemlab/SearchPanel";
import { Board } from "@/components/chemlab/Board";
import { useLabStore } from "@/stores/lab-store";
import { chemLabCollisionDetection } from "@/utils/collision";
import { PouringAnimation } from "@/components/chemlab/PouringAnimation";
import { getBottleColor } from "@/constants/chemicals";
import { Formula } from "@/components/chemlab/Formula";

interface DraggedChemical {
  name: string;
  formula: string;
  category: string;
  chemicalId: string;
  color?: string;
}

/* ─── Drag Overlay Bottle ─────────────────────────────────────────── */

function DragOverlayBottle({
  chemical,
}: {
  chemical: DraggedChemical;
}) {
  const bottleColor = getBottleColor(chemical.chemicalId);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-mint/30 bg-card/95 p-2.5 shadow-[var(--shadow-drag)] scale-105 backdrop-blur-sm">
      {/* Bottle SVG */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="14" y="2" width="12" height="5" rx="2" fill="#78909C" />
          <rect x="15" y="1" width="10" height="3" rx="1.5" fill="#90A4AE" />
          <rect x="16" y="7" width="8" height="6" rx="1" fill="rgba(200,220,240,0.4)" stroke="rgba(120,160,200,0.3)" strokeWidth="0.5" />
          <path
            d="M16 13 L12 18 Q10 20 10 23 L10 34 Q10 37 13 37 L27 37 Q30 37 30 34 L30 23 Q30 20 28 18 L24 13 Z"
            fill="rgba(200,220,240,0.25)"
            stroke="rgba(120,160,200,0.35)"
            strokeWidth="0.7"
          />
          <path
            d="M11 22 L11 34 Q11 36 13 36 L27 36 Q29 36 29 34 L29 22 Z"
            fill={bottleColor}
          />
          <path
            d="M13 18 L13 34 Q13 35 14 35"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-navy">
          {chemical.name}
        </div>
        <Formula
          formula={chemical.formula}
          className="font-display text-[11px] font-medium text-navy-soft"
        />
      </div>
    </div>
  );
}

/* ─── ChemLabShell ────────────────────────────────────────────────── */

export function ChemLabShell() {
  const addVessel = useLabStore((s) => s.addVessel);
  const mixVessels = useLabStore((s) => s.mixVessels);
  const moveVessel = useLabStore((s) => s.moveVessel);
  const [draggedChemical, setDraggedChemical] = useState<DraggedChemical | null>(null);

  const [pouringChemical, setPouringChemical] = useState<{
    chemical: DraggedChemical;
    targetVesselId: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "chemical") {
      setDraggedChemical({
        name: data.name as string,
        formula: data.formula as string,
        category: data.category as string,
        chemicalId: data.chemicalId as string,
        color: data.color as string | undefined,
      });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      
      const activeData = active.data.current;
      const overData = over?.data.current;

      // Case 1: Chemical dragged from SearchPanel → Board
      if (activeData?.type === "chemical" && overData?.type === "board") {
        const translated = active.rect.current.translated;
        addVessel(
          {
            name: activeData.name as string,
            formula: activeData.formula as string,
            category: activeData.category as string,
            chemicalId: activeData.chemicalId as string,
          },
          {
            x: translated ? translated.left : window.innerWidth / 2 - 40,
            y: translated ? translated.top : window.innerHeight / 2 - 40,
          }
        );
      }

      // Case 2: Chemical dragged from SearchPanel → existing Vessel (Center Beaker)
      if (activeData?.type === "chemical" && overData?.type === "vessel-target") {
        const targetVesselId = overData.vesselId as string;
        
        // Trigger pouring animation state instead of mixing immediately
        setPouringChemical({
          chemical: {
            name: activeData.name as string,
            formula: activeData.formula as string,
            category: activeData.category as string,
            chemicalId: activeData.chemicalId as string,
            color: activeData.color as string | undefined,
          },
          targetVesselId,
        });
      }

      // Case 3: Vessel dragged → Board (Move vessel)
      if (activeData?.type === "vessel" && overData?.type === "board") {
        const vesselId = activeData.vesselId as string;
        const translated = active.rect.current.translated;
        if (translated) {
          moveVessel(vesselId, { x: translated.left, y: translated.top });
        }
      }

      // Case 4: Vessel dragged → existing Vessel (Mix vessels)
      if (activeData?.type === "vessel" && overData?.type === "vessel-target") {
        const sourceVesselId = activeData.vesselId as string;
        const targetVesselId = overData.vesselId as string;
        if (sourceVesselId !== targetVesselId) {
          mixVessels(sourceVesselId, targetVesselId);
        }
      }

      setDraggedChemical(null);
    },
    [addVessel, moveVessel, mixVessels],
  );

  const mixChemicalIntoVessel = useLabStore((s) => s.mixChemicalIntoVessel);

  // Handle actual mixing after pouring animation
  const handlePourAnimationComplete = useCallback(async () => {
    if (!pouringChemical) return;
    
    // Mix directly without creating a temporary source vessel
    await mixChemicalIntoVessel(
      {
        inputName: pouringChemical.chemical.name,
        formula: pouringChemical.chemical.formula,
        amountMl: 10,
      },
      pouringChemical.targetVesselId
    );
    
    setPouringChemical(null);
  }, [pouringChemical, mixChemicalIntoVessel]);

  return (
    <DndContext
      id="chemlab-dnd"
      sensors={sensors}
      collisionDetection={chemLabCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-screen w-screen overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <Board />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
          <div className="pointer-events-auto">
            <Toolbar />
          </div>
          <div className="flex min-h-0 flex-1 items-start justify-between p-4 gap-4">
            <div className="pointer-events-auto h-full w-72">
              <PropertiesPanel />
            </div>
            <div className="pointer-events-auto h-full w-80">
              <SearchPanel />
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedChemical && (
          <DragOverlayBottle chemical={draggedChemical} />
        )}
      </DragOverlay>

      {pouringChemical && (
        <PouringAnimation
          chemicalName={pouringChemical.chemical.name}
          chemicalCategory={pouringChemical.chemical.category}
          chemicalId={pouringChemical.chemical.chemicalId}
          targetVesselId={pouringChemical.targetVesselId}
          onComplete={handlePourAnimationComplete}
        />
      )}
    </DndContext>
  );
}
