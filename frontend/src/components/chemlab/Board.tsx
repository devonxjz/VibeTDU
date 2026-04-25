"use client";

import {
  TestTube,
  Beaker,
  ArrowRight,
  FlaskConical,
  Loader2,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { VesselComponent } from "./Vessel";
import { ReactionEffect } from "./effects/ReactionEffect";

/* -----------------------------------------------------------
 * Decorative shelf items — lọ hoá chất pastel với chiều sâu
 * --------------------------------------------------------- */
function ShelfBottle({
  color,
  height = 44,
  width = 22,
  label,
}: {
  color: string;
  height?: number;
  width?: number;
  label?: string;
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-end"
      style={{ height, width }}
    >
      {/* nút chai */}
      <div
        className="rounded-t-sm"
        style={{
          width: width * 0.55,
          height: 5,
          background: "oklch(0.55 0.04 265)",
        }}
      />
      <div
        className="rounded-sm"
        style={{
          width: width * 0.4,
          height: 3,
          background: "oklch(0.7 0.03 265)",
        }}
      />
      {/* thân chai */}
      <div
        className="relative w-full rounded-md"
        style={{
          height: height - 10,
          background: `linear-gradient(180deg, ${color} 0%, color-mix(in oklab, ${color} 70%, oklch(0.45 0.05 260)) 100%)`,
          boxShadow:
            "inset -3px 0 4px oklch(0.3 0.05 250 / 0.18), inset 3px 0 3px oklch(1 0 0 / 0.35), 0 2px 4px oklch(0.3 0.05 250 / 0.15)",
        }}
      >
        {/* highlight phản chiếu */}
        <div
          className="absolute left-1 top-1 rounded-full"
          style={{
            width: 2,
            height: height * 0.45,
            background: "oklch(1 0 0 / 0.55)",
          }}
        />
        {/* nhãn */}
        {label && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-white/90 px-1 py-px text-[7px] font-bold tracking-tight text-navy"
            style={{ minWidth: width * 0.7, textAlign: "center" }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

function BackShelf({
  className,
  bottles,
}: {
  className?: string;
  bottles: Array<{ color: string; h?: number; w?: number; label?: string }>;
}) {
  return (
    <div className={"absolute " + className}>
      {/* lọ trên kệ */}
      <div className="relative flex h-full items-end justify-around gap-1 px-3 pb-[10px]">
        {bottles.map((b, i) => (
          <ShelfBottle key={i} color={b.color} height={b.h} width={b.w} label={b.label} />
        ))}
      </div>
      {/* mặt kệ */}
      <div className="lab-shelf absolute bottom-0 left-0 right-0" />
    </div>
  );
}

/* -----------------------------------------------------------
 * Background scene: tường + kệ + sàn bàn
 * --------------------------------------------------------- */
function LabScene() {
  return (
    <div className="lab-scene absolute inset-0 overflow-hidden">
      <div className="lab-wall" />

      {/* Kệ trên cùng — full chiều ngang */}
      <BackShelf
        className="left-[6%] right-[6%] top-[8%] h-[78px]"
        bottles={[
          { color: "oklch(0.86 0.1 175)", h: 50, w: 22, label: "H₂O" },
          { color: "oklch(0.88 0.1 60)", h: 56, w: 24, label: "HCl" },
          { color: "oklch(0.84 0.08 295)", h: 46, w: 20 },
          { color: "oklch(0.87 0.08 240)", h: 54, w: 24, label: "NaOH" },
          { color: "oklch(0.86 0.09 145)", h: 48, w: 22 },
          { color: "oklch(0.88 0.1 60)", h: 52, w: 22, label: "H₂SO₄" },
          { color: "oklch(0.86 0.1 175)", h: 56, w: 24 },
          { color: "oklch(0.84 0.08 295)", h: 50, w: 22, label: "NH₃" },
          { color: "oklch(0.87 0.08 240)", h: 46, w: 20 },
          { color: "oklch(0.86 0.09 145)", h: 54, w: 22, label: "C₂H₅OH" },
          { color: "oklch(0.88 0.1 60)", h: 48, w: 22 },
          { color: "oklch(0.86 0.1 175)", h: 52, w: 24, label: "KOH" },
        ]}
      />

      {/* Kệ giữa — 2 cụm trái phải */}
      <BackShelf
        className="left-[6%] top-[32%] h-[70px] w-[28%]"
        bottles={[
          { color: "oklch(0.86 0.1 175)", h: 44, w: 20 },
          { color: "oklch(0.88 0.1 60)", h: 50, w: 22, label: "HNO₃" },
          { color: "oklch(0.84 0.08 295)", h: 46, w: 20 },
          { color: "oklch(0.87 0.08 240)", h: 48, w: 22, label: "CuSO₄" },
          { color: "oklch(0.86 0.09 145)", h: 44, w: 20 },
        ]}
      />
      <BackShelf
        className="right-[6%] top-[32%] h-[70px] w-[28%]"
        bottles={[
          { color: "oklch(0.87 0.08 240)", h: 48, w: 22, label: "AgNO₃" },
          { color: "oklch(0.86 0.1 175)", h: 44, w: 20 },
          { color: "oklch(0.88 0.1 60)", h: 50, w: 22 },
          { color: "oklch(0.84 0.08 295)", h: 46, w: 22, label: "Cl₂" },
          { color: "oklch(0.86 0.09 145)", h: 44, w: 20 },
        ]}
      />

      {/* Khung tranh "công thức hoá học" */}
      <div className="absolute left-1/2 top-[32%] h-[70px] w-[180px] -translate-x-1/2 rounded-lg border-2 border-white/80 bg-gradient-to-br from-mint-soft via-baby-soft to-lavender-soft shadow-[var(--shadow-card)]">
        <div className="flex h-full flex-col items-center justify-center px-3">
          <span className="font-display text-[11px] font-bold tracking-wide text-navy">
            ChemLab
          </span>
          <span className="mt-0.5 text-[9px] font-medium text-navy-soft">
            2H₂ + O₂ → 2H₂O
          </span>
        </div>
        <div className="absolute -top-1.5 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-sm bg-navy-soft/40" />
      </div>

      {/* Sàn bàn perspective */}
      <div className="lab-floor" />
      <div className="lab-worktop" />
      <div className="lab-vignette" />
    </div>
  );
}

/* -----------------------------------------------------------
 * UI overlays
 * --------------------------------------------------------- */
function Minimap() {
  const vesselCount = useLabStore((s) => Object.keys(s.vessels).length);
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-20 h-28 w-40 overflow-hidden rounded-xl border border-border bg-card/90 shadow-[var(--shadow-card)] backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mint-soft via-card to-baby-soft">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,oklch(0.28_0.05_260/0.15)_1px,transparent_0)] [background-size:8px_8px]" />
        <div className="relative h-16 w-24 rounded-md border-2 border-mint bg-mint/10 shadow-[var(--shadow-soft)]">
          {/* Show vessel dots on minimap */}
          {vesselCount > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-navy">{vesselCount}</span>
            </div>
          )}
        </div>
      </div>
      <div className="absolute left-2 top-1.5 text-[9px] font-semibold uppercase tracking-wider text-navy-soft">
        Minimap
      </div>
    </div>
  );
}

function StatusBar() {
  const vesselCount = useLabStore((s) => Object.keys(s.vessels).length);
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex h-10 -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/95 px-2 shadow-[var(--shadow-card)] backdrop-blur-md">
      <StatusItem label="X" value="0" />
      <StatusItem label="Y" value="0" />
      <Sep />
      <StatusItem label="Zoom" value="100%" />
      <Sep />
      <StatusItem label="Chất" value={String(vesselCount)} highlight />
    </div>
  );
}

function StatusItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-navy-soft">
        {label}
      </span>
      <span
        className={
          "text-xs font-semibold tabular-nums " + (highlight ? "text-navy" : "text-navy")
        }
      >
        {value}
      </span>
    </div>
  );
}

function Sep() {
  return <div className="h-4 w-px bg-border" />;
}

function BoardEmptyState() {
  return (
    <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4 text-center">
      <div className="flex items-end gap-3 text-navy-soft/70">
        <Beaker className="h-14 w-14 drop-shadow-[0_4px_8px_oklch(0.3_0.05_250/0.15)]" strokeWidth={1.4} />
        <ArrowRight className="mb-3 h-6 w-6" strokeWidth={1.4} />
        <FlaskConical className="h-12 w-12 drop-shadow-[0_4px_8px_oklch(0.3_0.05_250/0.15)]" strokeWidth={1.4} />
        <ArrowRight className="mb-3 h-6 w-6" strokeWidth={1.4} />
        <TestTube className="h-12 w-12 drop-shadow-[0_4px_8px_oklch(0.3_0.05_250/0.15)]" strokeWidth={1.4} />
      </div>
      <div className="rounded-2xl bg-card/80 px-5 py-3 shadow-[var(--shadow-soft)] backdrop-blur-sm">
        <p className="font-display text-sm font-semibold text-navy/80">
          Bắt đầu thí nghiệm của bạn
        </p>
        <p className="mt-1 max-w-xs text-xs text-navy-soft">
          Kéo hoá chất từ thanh bên phải vào bàn để bắt đầu thí nghiệm
        </p>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
 * Board — Main canvas
 * --------------------------------------------------------- */
export function Board() {
  const vessels = useLabStore((s) => s.vessels);
  const activeEffect = useLabStore((s) => s.activeEffect);
  const isLoading = useLabStore((s) => s.isLoading);
  const selectVessel = useLabStore((s) => s.selectVessel);
  const vesselList = Object.values(vessels);

  const { setNodeRef, isOver } = useDroppable({
    id: "board-drop-zone",
    data: { type: "board" },
  });

  return (
    <main className="relative h-full flex-1 overflow-hidden p-4">
      <div
        ref={setNodeRef}
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-200 ${
          isOver ? "border-mint/60 bg-mint/5" : "border-border"
        }`}
        onClick={() => selectVessel(null)}
      >
        <LabScene />

        {/* Vessels rendered on the board */}
        <AnimatePresence>
          {vesselList.map((vessel) => (
            <VesselComponent key={vessel.id} vessel={vessel} />
          ))}
        </AnimatePresence>

        {/* Empty state (shown only when no vessels exist) */}
        {vesselList.length === 0 && (
          <div className="relative z-10 flex h-full w-full items-end justify-center pb-[18%]">
            <BoardEmptyState />
          </div>
        )}

        {/* Reaction effect overlay */}
        <ReactionEffect effect={activeEffect} />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-mint" />
              <span className="text-sm font-medium text-navy">
                Đang mô phỏng phản ứng...
              </span>
            </div>
          </div>
        )}

        <StatusBar />
        <Minimap />
      </div>
    </main>
  );
}
