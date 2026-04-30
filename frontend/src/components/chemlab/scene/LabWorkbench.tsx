"use client";

import { LabEquipment2D } from "./LabEquipment2D";

/* ─── LabWorkbench ─────────────────────────────────────────────────────
 * Modern workbench center — no shelves, clean surface with beaker zone.
 * Replaces the old LabScene2D shelves layout.
 * ──────────────────────────────────────────────────────────────────── */

interface LabWorkbenchProps {
  children?: React.ReactNode;
}

export function LabWorkbench({ children }: LabWorkbenchProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-label="Bàn thí nghiệm hiện đại"
      style={{
        background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 60%, #cbd5e1 100%)",
      }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Workbench surface — modern flat table */}
      <div
        className="absolute left-[5%] right-[5%] bg-slate-200/50 rounded-2xl shadow-lg"
        style={{
          top: "52%",
          bottom: "4%",
          boxShadow:
            "0 -2px 0 rgba(255,255,255,0.6), " +
            "0 4px 16px rgba(0,0,0,0.08), " +
            "0 12px 40px rgba(0,0,0,0.06), " +
            "inset 0 1px 0 rgba(255,255,255,0.8)",
          borderTop: "1px solid rgba(255,255,255,0.5)",
        }}
        aria-label="Mặt bàn thí nghiệm"
      >
        {/* Surface texture — subtle dot pattern */}
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.5) 0.5px, transparent 0.5px)",
            backgroundSize: "8px 8px",
          }}
        />
      </div>

      {/* Lab equipment — left side */}
      <div className="absolute" style={{ bottom: "6%", left: "6%", zIndex: 6 }}>
        <LabEquipment2D />
      </div>

      {/* Overhead light glow */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
        style={{
          width: 400,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(248,250,252,0.15) 40%, transparent 70%)",
        }}
      />

      {/* Main content slot (BeakerHero) — centered on the workbench */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <div className="my-auto min-h-[200px] flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
