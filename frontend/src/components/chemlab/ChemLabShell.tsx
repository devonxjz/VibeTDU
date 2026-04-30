"use client";

import { useState, useEffect } from "react";
import { Toolbar } from "@/components/chemlab/Toolbar";
import { ConditionPanel } from "@/components/chemlab/panels/ConditionPanel";
import { ChemicalLibrary } from "@/components/chemlab/panels/ChemicalLibrary";
import { Board } from "@/components/chemlab/Board";
import { useLabStore } from "@/stores/lab-store";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { ReactionResultCard } from "@/components/chemlab/scene/ReactionResultCard";



/* ─── ChemLabShell ────────────────────────────────────────────────── */

export function ChemLabShell() {
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const undoLastChemical = useLabStore((s) => s.undoLastChemical);
  const clearBeaker = useLabStore((s) => s.clearBeaker);
  const runReaction = useLabStore((s) => s.runReaction);
  const isLoading = useLabStore((s) => s.isLoading);
  const vessels = useLabStore((s) => s.vessels);
  const lastReaction = useLabStore((s) => s.lastReaction);

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
        clearBeaker();
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
  }, [centerBeakerId, vessels, isLoading, undoLastChemical, clearBeaker, runReaction]);

  return (
    <>
      {/* ── True 3-column layout — lab scene stays in center column ── */}
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        {/* Top toolbar */}
        <Toolbar />

        {/* Main content row */}
        <div className="flex min-h-0 flex-1">
          {/* Left panel */}
          <div className="hidden lg:block w-60 shrink-0 bg-white border-r border-border">
            <ConditionPanel />
          </div>

          {/* Center — lab canvas & results */}
          <div className="relative min-w-0 flex-1 bg-slate-100 flex flex-col h-full overflow-hidden">
            {/* Top Zone (The Stage) — Beaker focus */}
            <div className="flex-1 relative flex items-center justify-center min-h-[50%] transition-all duration-500">
              <Board />
            </div>

            {/* Bottom Zone (The Result) — Accordion slide-up block */}
            <ReactionResultCard />
          </div>

          {/* Right panel */}
          <div className="hidden md:flex w-72 shrink-0 flex-col bg-white border-l border-border overflow-y-auto">
            <ChemicalLibrary />
          </div>
        </div>
      </div>

      <ChatbotWidget />
    </>
  );
}
