"use client";

import {
  Settings2,
  Trash2,
  Save,
  Image as ImageIcon,
  Share2,
  History,
  FlaskConical,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import { ReactionFormula, Formula } from "./Formula";
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

function VesselDetail() {
  const selectedId = useLabStore((s) => s.selectedVesselId);
  const vessel = useLabStore((s) =>
    s.selectedVesselId ? s.vessels[s.selectedVesselId] : null,
  );

  if (!vessel) return null;

  return (
    <section className="px-4 py-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
        Ống nghiệm đang chọn
      </h3>
      <div className="rounded-xl border border-mint/40 bg-mint-soft/30 p-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-[var(--shadow-soft)]"
            style={{ backgroundColor: vessel.displayColor }}
          >
            <FlaskConical className="h-5 w-5 text-white/80" strokeWidth={1.8} />
          </div>
          <div>
            <Formula
              formula={vessel.label}
              className="text-sm font-bold text-navy"
            />
            <div className="text-[11px] text-navy-soft">
              {vessel.contents.length} chất · {vessel.contents[0]?.amountMl ?? 10} mL
            </div>
          </div>
        </div>
        {vessel.contents.length > 0 && (
          <div className="mt-2 space-y-1">
            {vessel.contents.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-card/60 px-2 py-1"
              >
                <span className="text-xs text-navy">{c.inputName}</span>
                <Formula
                  formula={c.formula}
                  className="text-[11px] font-medium text-navy-soft"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReactionResultPanel() {
  const reaction = useLabStore((s) => s.lastReaction);
  if (!reaction) return null;

  return (
    <section className="px-4 py-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
        <History className="h-3.5 w-3.5" />
        Phản ứng gần nhất
      </h3>
      <div className="space-y-2">
        {/* Equation */}
        {reaction.equation && (
          <div className="rounded-xl border border-border bg-card p-3">
            <ReactionFormula
              formula={reaction.equation}
              className="text-sm font-semibold text-navy"
            />
          </div>
        )}

        {/* Message */}
        {reaction.messageVi && (
          <div className="flex items-start gap-2 rounded-xl bg-baby-soft/40 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-soft" />
            <p className="text-xs leading-relaxed text-navy">
              {reaction.messageVi}
            </p>
          </div>
        )}

        {/* Safety note */}
        {reaction.safetyNoteVi && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p className="text-xs leading-relaxed text-rose-700">
              {reaction.safetyNoteVi}
            </p>
          </div>
        )}

        {/* Explanation */}
        {reaction.explanationVi && (
          <details className="group rounded-xl border border-border bg-card">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-navy">
              Giải thích chi tiết
            </summary>
            <p className="border-t border-border px-3 py-2 text-xs leading-relaxed text-navy-soft">
              {reaction.explanationVi}
            </p>
          </details>
        )}

        {/* Effect badge */}
        {reaction.effectType && reaction.effectType !== "NONE" && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-mint/20 px-2.5 py-1 text-[10px] font-semibold text-navy">
              {reaction.effectType === "GAS_BUBBLE" && "🫧 Sủi bọt khí"}
              {reaction.effectType === "PRECIPITATE" && "⬇️ Kết tủa"}
              {reaction.effectType === "COLOR_CHANGE" && "🎨 Đổi màu"}
              {reaction.effectType === "HEAT" && "🔥 Toả nhiệt"}
              {reaction.effectType === "EXPLOSION" && "💥 Nổ"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export function PropertiesPanel() {
  const resetBoard = useLabStore((s) => s.resetBoard);
  const error = useLabStore((s) => s.error);

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div>
          <h2 className="font-display text-sm font-bold text-navy">
            Bảng điều khiển
          </h2>
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
          <div className="grid grid-cols-2 gap-2">
            <QuickAction
              icon={Trash2}
              label="Xoá board"
              onClick={() => resetBoard()}
            />
            <QuickAction icon={Save} label="Lưu thí nghiệm" />
            <QuickAction icon={ImageIcon} label="Xuất ảnh" />
            <QuickAction icon={Share2} label="Chia sẻ" />
          </div>
        </section>

        <div className="mx-4 h-px bg-border" />

        {/* Selected Vessel Detail */}
        <VesselDetail />

        <div className="mx-4 h-px bg-border" />

        {/* Latest Reaction Result */}
        <ReactionResultPanel />
      </div>
    </aside>
  );
}
