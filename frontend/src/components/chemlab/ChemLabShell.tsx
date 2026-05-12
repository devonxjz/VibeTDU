"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useCallback } from "react";

import { Toolbar } from "@/components/chemlab/Toolbar";
import { ConditionPanel } from "@/components/chemlab/panels/ConditionPanel";
import { ChemicalLibrary } from "@/components/chemlab/panels/ChemicalLibrary";
import { Board } from "@/components/chemlab/Board";
import { useLabStore } from "@/stores/lab-store";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { ReactionResultCard } from "@/components/chemlab/scene/ReactionResultCard";


const LEFT_DEFAULT = 320;
const LEFT_MIN = 240;
const LEFT_MAX = 460;

export function ChemLabShell() {
  const centerBeakerId = useLabStore((state) => state.centerBeakerId);
  const undoLastChemical = useLabStore((state) => state.undoLastChemical);
  const clearBeaker = useLabStore((state) => state.clearBeaker);
  const runReaction = useLabStore((state) => state.runReaction);
  const isLoading = useLabStore((state) => state.isLoading);
  const vessels = useLabStore((state) => state.vessels);

  const leftColRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    (event.target as HTMLDivElement).setPointerCapture(event.pointerId);

    const column = leftColRef.current;
    if (!column) return;

    dragging.current = true;
    startX.current = event.clientX;
    startW.current = column.getBoundingClientRect().width;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const column = leftColRef.current;
    if (!column) return;

    const delta = event.clientX - startX.current;
    const next = Math.max(LEFT_MIN, Math.min(LEFT_MAX, startW.current + delta));

    column.style.setProperty("--left-col-w", `${Math.round(next)}px`);
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    (event.target as HTMLDivElement).releasePointerCapture(event.pointerId);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        event.key.toLowerCase() === "z" ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z")
      ) {
        event.preventDefault();
        undoLastChemical();
        return;
      }

      if (event.key.toLowerCase() === "r" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        clearBeaker();
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        if (event.key === " ") event.preventDefault();
        const vessel = centerBeakerId ? vessels[centerBeakerId] : null;
        const count = vessel?.contents.filter((content) => content.formula).length ?? 0;

        if (count >= 2 && !isLoading && centerBeakerId) {
          runReaction(centerBeakerId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [centerBeakerId, vessels, isLoading, undoLastChemical, clearBeaker, runReaction]);

  return (
    <>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-clay-canvas text-clay-ink">
        <Toolbar />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row gap-3 p-2 md:gap-4 md:p-4 overflow-y-auto lg:overflow-hidden overflow-x-hidden thin-scroll">
          <div
            ref={leftColRef}
            className="flex w-full shrink-0 flex-col overflow-hidden rounded-[20px] md:rounded-[28px] border border-clay-hairline bg-clay-surface-soft lg:!w-[var(--left-col-w)] lg:min-w-[240px] lg:max-w-[460px] min-h-[300px] lg:min-h-0"
            style={{ "--left-col-w": `${LEFT_DEFAULT}px` } as React.CSSProperties}
          >
            <ConditionPanel />
          </div>

          <div
            className="relative hidden shrink-0 lg:block"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ width: 12, cursor: "col-resize", touchAction: "none" }}
          >
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-clay-hairline" />
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 rounded-full border border-clay-hairline bg-clay-surface-card px-1.5 py-2 hover:bg-clay-surface-soft transition-colors">
              {[0, 1, 2, 3].map((dot) => (
                <span key={dot} className="h-1 w-1 rounded-full bg-clay-muted-soft" />
              ))}
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col h-[50vh] min-h-[400px] lg:h-full lg:w-auto">
            <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[20px] md:rounded-[32px] border border-clay-hairline bg-clay-surface-soft">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent dark:from-white/4 pointer-events-none z-10" />
              <div className="relative flex-1 h-full w-full">
                <Board />
              </div>
              <ReactionResultCard />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-[20px] md:rounded-[28px] border border-clay-hairline bg-clay-surface-soft lg:w-[360px] min-h-[400px] lg:min-h-0">
            <ChemicalLibrary />
          </div>
        </div>
      </div>

      <ChatbotWidget />

    </>
  );
}
