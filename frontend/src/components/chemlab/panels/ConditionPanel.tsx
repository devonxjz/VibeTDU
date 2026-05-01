"use client";

import { useState } from "react";
import {
  Play,
  Undo2,
  Trash2,
  X,
  Thermometer,
  Gauge,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import { Formula } from "@/components/chemlab/Formula";
import { cn } from "@/utils/cn";
import { getBottleColor } from "@/constants/chemicals";
import { PresetSelector } from "@/components/chemlab/PresetSelector";
import { ExperimentTimeline } from "@/components/chemlab/timeline/ExperimentTimeline";

/* ─── Constants ─────────────────────────────────────────────────────── */

const PRESSURE_OPTIONS = [
  { value: 0.5, label: "0.5 atm" },
  { value: 1, label: "1 atm" },
  { value: 2, label: "2 atm" },
  { value: 5, label: "5 atm" },
];

const CATALYST_OPTIONS = [
  { value: "Không", label: "Không" },
  { value: "MnO₂", label: "MnO₂" },
  { value: "Fe", label: "Fe" },
  { value: "Pt", label: "Pt" },
  { value: "Ni", label: "Ni" },
  { value: "V₂O₅", label: "V₂O₅" },
];

/* ─── ConditionPanel ────────────────────────────────────────────────── */

export function ConditionPanel() {
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const vessel = useLabStore((s) =>
    s.centerBeakerId ? s.vessels[s.centerBeakerId] : null
  );
  const isLoading = useLabStore((s) => s.isLoading);
  const temperature = useLabStore((s) => s.temperature);
  const pressure = useLabStore((s) => s.pressure);
  const catalyst = useLabStore((s) => s.catalyst);
  const setEnvironment = useLabStore((s) => s.setEnvironment);
  const removeFromBeaker = useLabStore((s) => s.removeFromBeaker);
  const undoLastChemical = useLabStore((s) => s.undoLastChemical);
  const clearBeaker = useLabStore((s) => s.clearBeaker);
  const runReaction = useLabStore((s) => s.runReaction);
  const getCanPlay = useLabStore((s) => s.getCanPlay);

  const contents = vessel?.contents.filter((c) => c.formula) ?? [];
  const canPlay = getCanPlay();

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5">
        <h2 className="font-display text-sm font-bold text-[#E0E0E0]">
          Điều kiện thí nghiệm
        </h2>
        <p className="text-[11px] text-gray-400">
          Thiết lập và kiểm soát phản ứng
        </p>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto">
        <PresetSelector />

        {/* ── Beaker Contents ────────────────────────────────────────── */}
        <section className="px-4 py-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            <FlaskConical className="h-3.5 w-3.5" />
            Hoá chất trong bình
            {contents.length > 0 && (
              <span className="ml-auto rounded-full bg-mint-soft px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#E0E0E0]">
                {contents.length}
              </span>
            )}
          </h3>

          {contents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl py-6 text-center">
              <FlaskConical className="mb-2 h-6 w-6 text-gray-400/40" />
              <p className="text-xs text-gray-400">Chưa có hoá chất</p>
              <p className="mt-0.5 text-[10px] text-gray-400/70">
                Chọn từ thư viện bên phải
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {contents.map((c, i) => (
                <div
                  key={`${c.formula}-${i}`}
                  className="group flex items-center gap-2.5 rounded-lg bg-[#2C2C2C]/60 px-3 py-2 transition-colors hover:bg-[#2C2C2C]"
                >
                  {/* Color dot */}
                  <span
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{
                      backgroundColor: getBottleColor(
                        c.formula.toLowerCase().replace(/[₂₃₄₅₆₇₈₉()]/g, ""),
                        c.formula
                      ),
                    }}
                  />
                  {/* Formula */}
                  <Formula
                    formula={c.formula}
                    className="flex-1 text-xs font-semibold text-[#E0E0E0]"
                  />
                  {/* Amount */}
                  <span className="text-[10px] tabular-nums text-gray-400">
                    {c.amountMl ?? 10} mL
                  </span>
                  {/* Delete */}
                  <button
                    onClick={() => removeFromBeaker(c.formula)}
                    className="flex h-5 w-5 items-center justify-center rounded-md text-gray-400/50 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                    title={`Bỏ ${c.formula}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>



        {/* ── Environment Conditions moved to Toolbar ── */}

      </div>
      
      <ExperimentTimeline />

      {/* ── Bottom Action Bar ───────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-2">
        {/* Play button */}
        <button
          disabled={!canPlay}
          onClick={async () => {
            if (!canPlay || !centerBeakerId) return;
            await runReaction(centerBeakerId);
          }}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200",
            canPlay
              ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:shadow-lg active:scale-[0.98]"
              : "bg-[#3C3C3C]/60 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <RotateCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isLoading ? "Đang phản ứng…" : "Chạy phản ứng"}
        </button>

        {/* Undo + Clear row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => undoLastChemical()}
            disabled={contents.length === 0}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors",
              contents.length > 0
                ? "bg-[#3C3C3C]/60 text-[#E0E0E0] hover:bg-[#4C4C4C]/80"
                : "bg-[#2C2C2C]/40 text-gray-400/30 cursor-not-allowed"
            )}
          >
            <Undo2 className="h-3.5 w-3.5" />
            Hoàn tác
          </button>
          <button
            onClick={() => clearBeaker()}
            disabled={contents.length === 0}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors",
              contents.length > 0
                ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                : "bg-[#2C2C2C]/40 text-gray-400/30 cursor-not-allowed"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa tất cả
          </button>
        </div>
      </div>
    </aside>
  );
}
