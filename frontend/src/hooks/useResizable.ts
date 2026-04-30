"use client";

import { useCallback, useRef } from "react";

/* ─── Horizontal (height) resizer ───────────────────────────────────────── */
interface UseHResizeOptions {
  /** Ref to the TOP panel whose height we control */
  topPanelRef: React.RefObject<HTMLElement | null>;
  /** Ref to the BOTTOM panel so we can enforce its min-height */
  bottomPanelRef: React.RefObject<HTMLElement | null>;
  minTopPx: number;
  maxTopPx: number;
  minBottomPx: number;
}

/**
 * Returns onPointerDown for a HORIZONTAL drag handle that resizes
 * the height split between a top panel and a bottom panel.
 */
export function useHResizable({
  topPanelRef,
  bottomPanelRef,
  minTopPx,
  maxTopPx,
  minBottomPx,
}: UseHResizeOptions) {
  const startY = useRef(0);
  const startH = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);

      const top = topPanelRef.current;
      if (!top) return;

      startY.current = e.clientY;
      startH.current = top.getBoundingClientRect().height;

      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        const top = topPanelRef.current;
        const bot = bottomPanelRef.current;
        if (!top) return;

        const delta = ev.clientY - startY.current;
        let next = startH.current + delta;

        // Clamp top panel
        next = Math.max(minTopPx, Math.min(maxTopPx, next));

        // Protect bottom panel min-height
        if (bot) {
          const botH = bot.getBoundingClientRect().height;
          const botDelta = next - top.getBoundingClientRect().height;
          if (botH - botDelta < minBottomPx) {
            next = next - (minBottomPx - (botH - botDelta));
            next = Math.max(minTopPx, next);
          }
        }

        top.style.height = `${Math.round(next)}px`;
        top.style.maxHeight = `${Math.round(next)}px`;
      };

      const onUp = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        handle.releasePointerCapture(e.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [topPanelRef, bottomPanelRef, minTopPx, maxTopPx, minBottomPx]
  );

  return { onPointerDown };
}

/* ─── Vertical (width) resizer ──────────────────────────────────────────── */
interface UseVResizeOptions {
  side: "left" | "right";
  minPx: number;
  maxPx: number;
  panelRef: React.RefObject<HTMLElement | null>;
  boardRef: React.RefObject<HTMLElement | null>;
}

/**
 * Returns onPointerDown for a VERTICAL drag handle that resizes
 * the width of a left or right sidebar.
 */
export function useVResizable({
  side,
  minPx,
  maxPx,
  panelRef,
  boardRef,
}: UseVResizeOptions) {
  const startX = useRef(0);
  const startW = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);

      const panel = panelRef.current;
      if (!panel) return;

      startX.current = e.clientX;
      startW.current = panel.getBoundingClientRect().width;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        const panel = panelRef.current;
        const board = boardRef.current;
        if (!panel) return;

        const delta = ev.clientX - startX.current;
        const raw =
          side === "left"
            ? startW.current + delta
            : startW.current - delta;

        let next = Math.max(minPx, Math.min(maxPx, raw));

        if (board) {
          const boardW = board.getBoundingClientRect().width;
          const panelW = panel.getBoundingClientRect().width;
          const newBoardW = boardW - (next - panelW);
          if (newBoardW < 500) {
            next = next - (500 - newBoardW);
            next = Math.max(minPx, next);
          }
        }

        panel.style.width = `${Math.round(next)}px`;
        panel.style.minWidth = `${Math.round(next)}px`;
      };

      const onUp = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        handle.releasePointerCapture(e.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [side, minPx, maxPx, panelRef, boardRef]
  );

  return { onPointerDown };
}
