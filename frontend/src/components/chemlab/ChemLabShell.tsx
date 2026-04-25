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
import { FlaskConical } from "lucide-react";
import { Toolbar } from "@/components/chemlab/Toolbar";
import { PropertiesPanel } from "@/components/chemlab/PropertiesPanel";
import { SearchPanel } from "@/components/chemlab/SearchPanel";
import { Board } from "@/components/chemlab/Board";
import { useLabStore } from "@/stores/lab-store";
import { chemLabCollisionDetection } from "@/utils/collision";
import { PouringAnimation } from "@/components/chemlab/PouringAnimation";

interface DraggedChemical {
  name: string;
  formula: string;
}

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

      <DragOverlay>
        {draggedChemical && (
          <div className="flex items-center gap-2 rounded-xl border border-mint bg-card px-3 py-2 shadow-lg backdrop-blur-sm">
            <FlaskConical className="h-5 w-5 text-mint" strokeWidth={1.8} />
            <div>
              <div className="text-xs font-semibold text-navy">
                {draggedChemical.name}
              </div>
              <div className="text-[11px] text-navy-soft">
                {draggedChemical.formula}
              </div>
            </div>
          </div>
        )}
      </DragOverlay>

      {pouringChemical && (
        <PouringAnimation
          chemicalName={pouringChemical.chemical.name}
          chemicalCategory={pouringChemical.chemical.category}
          onComplete={handlePourAnimationComplete}
        />
      )}
    </DndContext>
  );
}
