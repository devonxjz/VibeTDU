"use client";

import type { ReactNode } from "react";
import { LabEquipment2D } from "./LabEquipment2D";

interface LabWorkbenchProps {
  children?: ReactNode;
}

export function LabWorkbench({ children }: LabWorkbenchProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-label="Bàn thí nghiệm"
      style={{
        background: `
          radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--clay-brand-lavender) 10%, transparent) 0%, transparent 34%),
          radial-gradient(circle at 50% 38%, var(--lab-glow) 0%, transparent 42%),
          linear-gradient(180deg, color-mix(in srgb, var(--clay-canvas) 88%, var(--lab-bg)) 0%, var(--lab-bg) 62%, color-mix(in srgb, var(--lab-table-top) 78%, var(--lab-bg)) 100%)
        `,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--clay-muted-soft) 45%, transparent) 0.8px, transparent 0.8px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 78%)",
        }}
      />

      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{
          top: "61%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent 4%, color-mix(in srgb, var(--clay-hairline) 80%, var(--lab-border)) 18%, color-mix(in srgb, var(--clay-hairline) 80%, var(--lab-border)) 82%, transparent 96%)",
        }}
      />

      <div
        className="absolute left-[4%] right-[4%] rounded-t-[24px] rounded-b-[18px]"
        style={{
          top: "61%",
          bottom: "4%",
          background: `linear-gradient(
            180deg,
            color-mix(in srgb, var(--lab-table-top) 84%, var(--clay-surface-card)) 0%,
            color-mix(in srgb, var(--lab-table) 90%, var(--clay-surface-soft)) 100%
          )`,
          borderTop: "1px solid color-mix(in srgb, var(--clay-hairline) 65%, var(--lab-border))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
        aria-label="Mặt bàn thí nghiệm"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[24px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--clay-brand-teal) 22%, transparent), transparent)",
          }}
        />
      </div>

      <div className="absolute bottom-[5%] left-[5%] z-[6] scale-[0.98] opacity-90">
        <LabEquipment2D />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-6">
        <div className="my-auto flex min-h-[180px] md:min-h-[240px] w-full max-w-full items-center justify-center">{children}</div>
      </div>
    </div>
  );
}
