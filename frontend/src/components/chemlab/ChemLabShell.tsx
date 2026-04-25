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

interface DraggedChemical {
  name: string;
  formula: string;
}

export function ChemLabShell() {
  const addVessel = useLabStore((s) => s.addVessel);
  const mixVessels = useLabStore((s) => s.mixVessels);
  const [draggedChemical, setDraggedChemical] = useState<DraggedChemical | null>(null);

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
      });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggedChemical(null);
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Case 1: Chemical dragged from SearchPanel → Board drop zone
      if (activeData?.type === "chemical" && overData?.type === "board") {
        const boardRect = over.rect;
        const x = boardRect.width * 0.3 + Math.random() * boardRect.width * 0.4;
        const y = boardRect.height * 0.5 + Math.random() * boardRect.height * 0.2;

        addVessel(
          {
            name: activeData.name as string,
            formula: activeData.formula as string,
            category: activeData.category as string | undefined,
          },
          { x, y },
        );
      }

      // Case 2: Chemical dragged from SearchPanel → existing Vessel
      if (activeData?.type === "chemical" && overData?.type === "vessel-target") {
        const targetVesselId = overData.vesselId as string;
        const vessels = useLabStore.getState().vessels;
        const target = vessels[targetVesselId];
        if (target) {
          const newId = addVessel(
            {
              name: activeData.name as string,
              formula: activeData.formula as string,
              category: activeData.category as string | undefined,
            },
            { x: target.position.x + 80, y: target.position.y },
          );
          mixVessels(newId, targetVesselId);
        }
      }

      // Case 3: Vessel dragged onto another Vessel → mix
      if (activeData?.type === "vessel" && overData?.type === "vessel-target") {
        const sourceId = activeData.vesselId as string;
        const targetId = overData.vesselId as string;
        if (sourceId !== targetId) {
          mixVessels(sourceId, targetId);
        }
      }
    },
    [addVessel, mixVessels],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        <Toolbar />
        <div className="flex min-h-0 flex-1">
          <PropertiesPanel />
          <Board />
          <SearchPanel />
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
    </DndContext>
  );
}
