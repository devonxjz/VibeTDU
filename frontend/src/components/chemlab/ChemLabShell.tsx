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
import { useState, useCallback, useEffect } from "react";
import { Toolbar } from "@/components/chemlab/Toolbar";
import { PropertiesPanel } from "@/components/chemlab/PropertiesPanel";
import { SearchPanel } from "@/components/chemlab/SearchPanel";
import { Board } from "@/components/chemlab/Board";
import { useLabStore } from "@/stores/lab-store";
import { chemLabCollisionDetection } from "@/utils/collision";
import { PouringAnimation } from "@/components/chemlab/PouringAnimation";
import { getBottleColor } from "@/constants/chemicals";
import { Formula } from "@/components/chemlab/Formula";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

interface DraggedChemical {
  name: string;
  formula: string;
  category: string;
  chemicalId: string;
  color?: string;
}

/* ─── Drag Overlay — only the bottle, no card ────────────────────── */

function DragOverlayBottle({
  chemical,
}: {
  chemical: DraggedChemical;
}) {
  const bottleColor = getBottleColor(chemical.chemicalId);

  return (
    <div
      className="flex flex-col items-center pointer-events-none"
      style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.35))" }}
    >
      <svg width="52" height="64" viewBox="0 0 40 50" fill="none">
        {/* Cap */}
        <rect x="14" y="1" width="12" height="5" rx="2" fill="#546E7A" />
        <rect x="15" y="0" width="10" height="3" rx="1.5" fill="#78909C" />
        {/* Neck */}
        <rect x="16" y="6" width="8" height="7" rx="1"
          fill="rgba(200,230,255,0.35)" stroke="rgba(120,160,200,0.3)" strokeWidth="0.6" />
        {/* Body */}
        <path
          d="M16 13 L12 19 Q10 22 10 25 L10 40 Q10 44 14 44 L26 44 Q30 44 30 40 L30 25 Q30 22 28 19 L24 13 Z"
          fill="rgba(200,230,255,0.22)"
          stroke="rgba(120,160,200,0.4)"
          strokeWidth="0.8"
        />
        {/* Liquid */}
        <path
          d="M11 24 L11 40 Q11 43 14 43 L26 43 Q29 43 29 40 L29 24 Z"
          fill={bottleColor}
          opacity="0.9"
        />
        {/* Glass shine */}
        <path d="M13 19 L13 38 Q13 40 14 40"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Label */}
        <rect x="14" y="28" width="12" height="9" rx="1.5" fill="rgba(255,255,255,0.85)" />
        <text x="20" y="34.5" textAnchor="middle" fontSize="6" fontWeight="800"
          fill="#1a2340" fontFamily="system-ui, sans-serif">
          {chemical.formula.length > 5 ? chemical.formula.slice(0, 4) + "…" : chemical.formula}
        </text>
      </svg>
    </div>
  );
}

/* ─── ChemLabShell ────────────────────────────────────────────────── */

export function ChemLabShell() {
  const addVessel = useLabStore((s) => s.addVessel);
  const addChemicalToVessel = useLabStore((s) => s.addChemicalToVessel);
  const mixVessels = useLabStore((s) => s.mixVessels);
  const moveVessel = useLabStore((s) => s.moveVessel);
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const undoLastChemical = useLabStore((s) => s.undoLastChemical);
  const resetBoard = useLabStore((s) => s.resetBoard);
  const runReaction = useLabStore((s) => s.runReaction);
  const isLoading = useLabStore((s) => s.isLoading);
  const vessels = useLabStore((s) => s.vessels);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Z or Ctrl+Z or Cmd+Z
      if (e.key.toLowerCase() === "z" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        undoLastChemical();
        return;
      }

      // Reset: R
      if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        resetBoard();
        return;
      }

      // Play: Space or Enter
      if (e.key === " " || e.key === "Enter") {
        if (e.key === " ") {
          e.preventDefault(); // Prevent page scroll
        }
        
        const centerVessel = centerBeakerId ? vessels[centerBeakerId] : null;
        const contentsCount = centerVessel?.contents.filter(c => c.formula).length || 0;
        const canPlay = contentsCount >= 2 && !isLoading;
        
        if (canPlay && centerBeakerId) {
          runReaction(centerBeakerId);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [centerBeakerId, vessels, isLoading, undoLastChemical, resetBoard, runReaction]);

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

      // Case 2: Chemical dropped on BeakerHero — queue pour animation
      if (activeData?.type === "chemical" && overData?.type === "vessel-target") {
        const targetVesselId = (overData.vesselId as string) || centerBeakerId;
        if (targetVesselId) {
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
      }

      // Case 2b: Chemical dropped directly on board canvas — add to center beaker
      if (activeData?.type === "chemical" && overData?.type === "board" && centerBeakerId) {
        setPouringChemical({
          chemical: {
            name: activeData.name as string,
            formula: activeData.formula as string,
            category: activeData.category as string,
            chemicalId: activeData.chemicalId as string,
            color: activeData.color as string | undefined,
          },
          targetVesselId: centerBeakerId,
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
    [addVessel, moveVessel, mixVessels, centerBeakerId],
  );

  const handlePourAnimationComplete = useCallback(() => {
    if (!pouringChemical) return;
    // Add chemical locally — NO API call. User presses Play to run simulation.
    addChemicalToVessel(
      {
        inputName: pouringChemical.chemical.name,
        formula: pouringChemical.chemical.formula,
        amountMl: 10,
        category: pouringChemical.chemical.category,
        chemicalId: pouringChemical.chemical.chemicalId,
      },
      pouringChemical.targetVesselId
    );
    setPouringChemical(null);
  }, [pouringChemical, addChemicalToVessel]);

  return (
    <DndContext
      id="chemlab-dnd"
      sensors={sensors}
      collisionDetection={chemLabCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ── True 3-column layout — lab scene stays in center column ── */}
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        {/* Top toolbar */}
        <Toolbar />

        {/* Main content row */}
        <div className="flex min-h-0 flex-1">
          {/* Left panel */}
          <div className="w-72 shrink-0 overflow-hidden border-r border-border bg-card/60 backdrop-blur-sm">
            <PropertiesPanel />
          </div>

          {/* Center — lab canvas */}
          <div className="relative min-w-0 flex-1">
            <Board />
          </div>

          {/* Right panel */}
          <div className="w-80 shrink-0 overflow-hidden border-l border-border bg-card/60 backdrop-blur-sm">
            <SearchPanel />
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

      <ChatbotWidget />
    </DndContext>
  );
}
