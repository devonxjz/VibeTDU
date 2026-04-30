"use client";

import { LabEquipment2D } from "./LabEquipment2D";

/* ─── LabWorkbench ─────────────────────────────────────────────────────
 * Premium Warm workbench — warm taupe wall, rich wood/bronze table.
 * Highlights white chemicals perfectly without being flat or too dark.
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
        background: "linear-gradient(180deg, #fdf8f4 0%, #f4e9e0 40%, #e8d5c4 100%)",
      }}
    >
      {/* Subtle warm dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(168,122,93,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, transparent 80%)",
        }}
      />

      {/* Overhead warm spotlight */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
        style={{
          width: 500,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,248,235,0.8) 0%, rgba(255,230,200,0.3) 40%, transparent 70%)",
        }}
      />

      {/* Workbench surface — rich warm wood / bronze table */}
      <div
        className="absolute left-[5%] right-[5%] rounded-t-[20px] rounded-b-lg"
        style={{
          top: "52%",
          bottom: "4%",
          background: "linear-gradient(180deg, #c48b63 0%, #a36640 40%, #824726 100%)",
          borderTop: "2px solid rgba(255,225,190,0.4)",
          borderLeft: "1px solid rgba(255,225,190,0.2)",
          borderRight: "1px solid rgba(255,225,190,0.2)",
          boxShadow:
            "0 -2px 10px rgba(168,102,64,0.3), " +
            "0 12px 32px rgba(90,40,15,0.4), " +
            "inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
        aria-label="Mặt bàn thí nghiệm"
      >
        {/* Table edge reflection */}
        <div
          className="absolute inset-x-0 top-0 h-1.5 pointer-events-none rounded-t-[20px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
          }}
        />
        
        {/* Subtle table texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.05) 50%)",
            backgroundSize: "4px 100%",
          }}
        />
      </div>

      {/* Lab equipment — left side */}
      <div className="absolute" style={{ bottom: "6%", left: "6%", zIndex: 6 }}>
        <LabEquipment2D />
      </div>

      {/* Main content slot (BeakerHero) — centered on the workbench */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <div className="my-auto min-h-[200px] flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(90,40,15,0.25)]">
          {children}
        </div>
      </div>
    </div>
  );
}
