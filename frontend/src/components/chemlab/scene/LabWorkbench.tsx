"use client";

import { LabEquipment2D } from "./LabEquipment2D";

/* ─── LabWorkbench ─────────────────────────────────────────────────────
 * High-tech Dark Workbench — deep slate wall, dark tech table surface.
 * Makes the beaker and chemical reactions visually pop.
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
        background: "var(--lab-bg)",
      }}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, var(--toolbar-muted) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, transparent 80%)",
        }}
      />
      
      {/* Subtle blue ambient light behind beaker */}
      <div
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--lab-glow) 0%, transparent 60%)",
        }}
      />

      {/* Horizontal line where wall meets table */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: "60%",
          height: 1,
          background: "linear-gradient(90deg, transparent 3%, var(--lab-border) 15%, var(--lab-border) 85%, transparent 97%)",
        }}
      />

      {/* Workbench surface — dark tech table */}
      <div
        className="absolute left-[4%] right-[4%] rounded-t-[16px] rounded-b-lg"
        style={{
          top: "60%",
          bottom: "3%",
          background: "linear-gradient(180deg, var(--lab-table-top) 0%, var(--lab-table) 100%)",
          borderTop: "1px solid var(--lab-border)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
        aria-label="Mặt bàn thí nghiệm"
      >
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-[16px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, var(--lab-glow), transparent)",
          }}
        />
        {/* Subtle high-tech surface texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 rounded-t-[16px]"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)",
          }}
        />
      </div>

      {/* Lab equipment — left side */}
      <div className="absolute" style={{ bottom: "5%", left: "5%", zIndex: 6 }}>
        <LabEquipment2D />
      </div>

      {/* Main content slot (BeakerHero) */}
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
