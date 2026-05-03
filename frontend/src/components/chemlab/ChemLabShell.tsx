"use client";

import { useEffect, useRef, useCallback } from "react";
import { Toolbar } from "@/components/chemlab/Toolbar";
import { ConditionPanel } from "@/components/chemlab/panels/ConditionPanel";
import { ChemicalLibrary } from "@/components/chemlab/panels/ChemicalLibrary";
import { Board } from "@/components/chemlab/Board";
import { useLabStore } from "@/stores/lab-store";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { ReactionResultCard } from "@/components/chemlab/scene/ReactionResultCard";

/* ── Left sidebar width constraints ──────────────────────────────────── */
const LEFT_DEFAULT = 260;
const LEFT_MIN     = 200;
const LEFT_MAX     = 420;

/* ── ChemLabShell ─────────────────────────────────────────────────────── */
export function ChemLabShell() {
  const centerBeakerId   = useLabStore((s) => s.centerBeakerId);
  const undoLastChemical = useLabStore((s) => s.undoLastChemical);
  const clearBeaker      = useLabStore((s) => s.clearBeaker);
  const runReaction      = useLabStore((s) => s.runReaction);
  const isLoading        = useLabStore((s) => s.isLoading);
  const vessels          = useLabStore((s) => s.vessels);

  /* Drag refs — bypass React renders for 60fps smoothness */
  const leftColRef = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);
  const startX     = useRef(0);
  const startW     = useRef(0);

  /* ── Pointer handlers attached inline on the handle div ── */
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    
    const col = leftColRef.current;
    if (!col) return;

    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = col.getBoundingClientRect().width;
    
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const col = leftColRef.current;
    if (!col) return;

    const delta = e.clientX - startX.current;
    const next  = Math.max(LEFT_MIN, Math.min(LEFT_MAX, startW.current + delta));
    
    // Direct DOM mutation for zero-lag smoothness
    col.style.width = `${Math.round(next)}px`;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    document.body.style.cursor     = "";
    document.body.style.userSelect = "";
  }, []);

  /* ── Keyboard shortcuts (unchanged from original) ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;

      if (
        e.key.toLowerCase() === "z" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        undoLastChemical();
        return;
      }
      if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        clearBeaker();
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        if (e.key === " ") e.preventDefault();
        const vessel = centerBeakerId ? vessels[centerBeakerId] : null;
        const count  = vessel?.contents.filter((c) => c.formula).length ?? 0;
        if (count >= 2 && !isLoading && centerBeakerId)
          runReaction(centerBeakerId);
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [centerBeakerId, vessels, isLoading, undoLastChemical, clearBeaker, runReaction]);

  return (
    <>
      {/* ── True 3-column layout — lab scene stays in center column ── */}
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
        {/* Top toolbar */}
        <Toolbar />

        {/* Main content row */}
        <div className="flex min-h-0 flex-1">
          {/* ── Left panel — width controlled by drag ── */}
          <div
            ref={leftColRef}
            className="hidden lg:flex flex-col shrink-0 bg-panel border-r border-panel-border overflow-hidden z-10"
            style={{ width: LEFT_DEFAULT, minWidth: LEFT_MIN, maxWidth: LEFT_MAX }}
          >
            <ConditionPanel />
          </div>

          {/* ── Drag handle ── all pointer events on this single element ── */}
          <div
            className="hidden lg:block shrink-0"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              width: 6,
              cursor: "col-resize",
              position: "relative",
              userSelect: "none",
              touchAction: "none",
              flexShrink: 0,
              zIndex: 20,
              background: "transparent",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-control-active)";
              e.currentTarget.style.opacity = "0.2";
            }}
            onMouseLeave={(e) => {
              if (!dragging.current) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.opacity = "1";
              }
            }}
          >
            {/* Vertical line */}
            <div style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: "50%",
              width: 1,
              transform: "translateX(-50%)",
              background: "var(--color-panel-border)",
            }} />
            {/* Grip dots */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              pointerEvents: "none",
            }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{
                  width: 3, height: 3,
                  borderRadius: "50%",
                  background: "var(--color-toolbar-muted)",
                }} />
              ))}
            </div>
          </div>

          {/* Center — lab canvas & results */}
          <div
            className="relative min-w-0 flex-1 flex flex-col h-full overflow-hidden"
            style={{
              margin: 10,
              borderRadius: 20,
              background: "var(--lab-bg)",
              border: "1.5px solid var(--lab-border)",
              boxShadow: "var(--shadow-inset-board)",
            }}
          >
            {/* Top Zone (The Stage) — Beaker focus */}
            <div className="flex-1 relative flex items-center justify-center min-h-[50%] transition-all duration-500">
              <Board />
            </div>

            {/* Bottom Zone (The Result) — Accordion slide-up block */}
            <ReactionResultCard />
          </div>

          {/* Right panel */}
          <div className="hidden md:flex w-72 shrink-0 flex-col bg-panel border-l border-panel-border overflow-y-auto z-10">
            <ChemicalLibrary />
          </div>
        </div>
      </div>

      <ChatbotWidget />
    </>
  );
}
