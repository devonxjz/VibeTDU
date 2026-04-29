"use client";

import {
  Settings2,
  Trash2,
  Undo2,
  Play,
  RotateCcw,
  FlaskConical,
  AlertTriangle,
  Info,
  Zap,
  ChevronDown,
  FlaskRound,
  Plus,
} from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import { ReactionFormula, Formula } from "./Formula";
import { PresetSelector } from "./PresetSelector";
import { ExplanationPanel } from "./panels/ExplanationPanel";
import { ExperimentTimeline } from "./timeline/ExperimentTimeline";
import { cn } from "@/utils/cn";

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon: Icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-1.5 rounded-xl bg-lavender-soft px-3 py-3.5",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.03] hover:bg-lavender/40 hover:shadow-[var(--shadow-soft)]",
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/80 text-navy shadow-[var(--shadow-soft)] transition-colors group-hover:text-navy">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-medium text-navy">{label}</span>
    </button>
  );
}

/* ─── Center Beaker Contents Tray ───────────────────────────────────── */

function BeakerTray() {
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const vessel = useLabStore((s) => s.centerBeakerId ? s.vessels[s.centerBeakerId] : null);

  if (!vessel) return null;

  const contents = vessel.contents.filter((c) => c.formula);

  return (
    <section className="px-4 py-3">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
        <FlaskRound className="h-3.5 w-3.5" />
        Bình phản ứng
      </h3>

      {/* Beaker mini preview */}
      <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-card/80 p-2.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-inner border border-white/40"
          style={{ backgroundColor: vessel.displayColor || "rgba(180,220,255,0.4)" }}
        >
          <FlaskConical className="h-5 w-5 text-white/80" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          {contents.length === 0 ? (
            <p className="text-xs text-navy-soft italic">Bình trống — kéo hoá chất vào</p>
          ) : (
            <>
              <Formula formula={vessel.label} className="text-sm font-bold text-navy truncate" />
              <p className="text-[11px] text-navy-soft">{contents.length} chất · {contents[0]?.amountMl ?? 10} mL</p>
            </>
          )}
        </div>
      </div>

      {/* Chemical chips */}
      {contents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contents.map((c, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-mint-soft/60 px-2.5 py-1 text-[11px] font-semibold text-navy"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: vessel.displayColor }} />
              <Formula formula={c.formula} className="text-[11px] font-semibold text-navy" />
            </span>
          ))}
          <span className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-navy-soft">
            <Plus className="h-3 w-3" /> Kéo thêm
          </span>
        </div>
      )}

      {contents.length >= 2 && (
        <p className="mt-2 text-[11px] text-mint font-medium">
          ▶ Nhấn Play để chạy phản ứng
        </p>
      )}
    </section>
  );
}

/* ─── Reaction Result ────────────────────────────────────────────────── */

function ReactionResultPanel() {
  const reaction = useLabStore((s) => s.lastReaction);
  if (!reaction) return null;

  const reactionTypeName: Record<string, string> = {
    GAS_BUBBLE: "Phản ứng tạo khí",
    PRECIPITATE: "Phản ứng kết tủa",
    COLOR_CHANGE: "Phản ứng đổi màu",
    HEAT: "Phản ứng toả nhiệt",
    EXPLOSION: "Phản ứng nổ",
    NONE: "Không có phản ứng",
  };

  return (
    <section className="px-4 py-3">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        Kết quả phản ứng
      </h3>

      <div className="space-y-2">
        {/* Reaction equation box — styled like the reference image */}
        {reaction.equation && (
          <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-soft">
                Phương trình
              </span>
              {reaction.effectType && reaction.effectType !== "NONE" && (
                <span className="rounded-full bg-mint/20 px-2 py-0.5 text-[10px] font-semibold text-navy">
                  {reactionTypeName[reaction.effectType] ?? reaction.effectType}
                </span>
              )}
            </div>
            <ReactionFormula
              formula={reaction.equation}
              className="text-sm font-bold leading-relaxed text-navy"
            />
            {reaction.effectType && reaction.effectType !== "NONE" && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-xs text-navy-soft">Loại:</span>
                <span className="text-xs font-semibold text-navy">
                  {reaction.effectType === "GAS_BUBBLE" && "🫧 Sủi bọt khí"}
                  {reaction.effectType === "PRECIPITATE" && "⬇️ Kết tủa"}
                  {reaction.effectType === "COLOR_CHANGE" && "🎨 Đổi màu"}
                  {reaction.effectType === "HEAT" && "🔥 Toả nhiệt"}
                  {reaction.effectType === "EXPLOSION" && "💥 Nổ"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Observation */}
        {reaction.messageVi && (
          <div className="flex items-start gap-2 rounded-xl bg-baby-soft/60 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-soft" />
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-soft">Hiện tượng quan sát</p>
              <p className="text-xs leading-relaxed text-navy">{reaction.messageVi}</p>
            </div>
          </div>
        )}

        {/* Explanation — expandable (replaced by ExplanationPanel) */}
        <ExplanationPanel />

        {/* Safety note */}
        {reaction.safetyNoteVi && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600">Lưu ý an toàn</p>
              <p className="text-xs leading-relaxed text-rose-700">{reaction.safetyNoteVi}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Main PropertiesPanel ──────────────────────────────────────────── */

export function PropertiesPanel() {
  const resetBoard = useLabStore((s) => s.resetBoard);
  const undoLastChemical = useLabStore((s) => s.undoLastChemical);
  const runReaction = useLabStore((s) => s.runReaction);
  const isLoading = useLabStore((s) => s.isLoading);
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const centerVessel = useLabStore((s) => s.centerBeakerId ? s.vessels[s.centerBeakerId] : null);
  const error = useLabStore((s) => s.error);

  const canPlay = !isLoading && !!centerBeakerId && (centerVessel?.contents.filter(c => c.formula).length ?? 0) >= 2;

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <div>
          <h2 className="font-display text-sm font-bold text-navy">Bảng điều khiển</h2>
          <p className="text-[11px] text-navy-soft">Quản lý thí nghiệm</p>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-soft transition-colors hover:bg-muted hover:text-navy">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto">
        {/* Error display */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <section className="px-4 py-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
            Thao tác nhanh
          </h3>

          {/* Primary action — Play */}
          <button
            disabled={!canPlay}
            onClick={async () => {
              if (!canPlay || !centerBeakerId) return;
              await runReaction(centerBeakerId);
            }}
            className={cn(
              "mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
              canPlay
                ? "bg-gradient-to-r from-mint to-baby text-navy shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:scale-[1.02] active:scale-[0.98]"
                : "bg-muted/60 text-navy-soft cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <RotateCcw className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Play className="h-4.5 w-4.5" />
            )}
            {isLoading ? "Đang phản ứng…" : "Chạy phản ứng"}
          </button>

          <div className="grid grid-cols-3 gap-2">
            <QuickAction icon={Trash2} label="Xoá board" onClick={() => resetBoard()} />
            <QuickAction icon={RotateCcw} label="Đặt lại" onClick={() => resetBoard()} />
            <QuickAction icon={Undo2} label="Hoàn tác" onClick={() => undoLastChemical()} />
          </div>
        </section>

        <div className="mx-4 h-px bg-border/60" />

        {/* Preset Selector */}
        <PresetSelector />

        <div className="mx-4 h-px bg-border/60" />

        {/* Center Beaker Tray */}
        <BeakerTray />

        <div className="mx-4 h-px bg-border/60" />

        {/* Reaction Result */}
        <ReactionResultPanel />
      </div>

      <ExperimentTimeline />
    </aside>
  );
}
