"use client";

import {
  Play,
  Undo2,
  Trash2,
  X,
  FlaskConical,
  RotateCcw,
} from "lucide-react";

import { useLabStore } from "@/stores/lab-store";
import { Formula } from "@/components/chemlab/Formula";
import { getBottleColor } from "@/constants/chemicals";
import { PresetSelector } from "@/components/chemlab/PresetSelector";
import { ExperimentTimeline } from "@/components/chemlab/timeline/ExperimentTimeline";
import {
  ClayActionButton,
  ClayPanelShell,
  ClayPill,
  ClaySectionCard,
} from "@/components/ui/clay-primitives";

export function ConditionPanel() {
  const centerBeakerId = useLabStore((state) => state.centerBeakerId);
  const vessel = useLabStore((state) =>
    state.centerBeakerId ? state.vessels[state.centerBeakerId] : null,
  );
  const isLoading = useLabStore((state) => state.isLoading);
  const removeFromBeaker = useLabStore((state) => state.removeFromBeaker);
  const undoLastChemical = useLabStore((state) => state.undoLastChemical);
  const clearBeaker = useLabStore((state) => state.clearBeaker);
  const runReaction = useLabStore((state) => state.runReaction);
  const getCanPlay = useLabStore((state) => state.getCanPlay);
  const appliedConditions = useLabStore((state) => state.appliedConditions);

  const contents = vessel?.contents.filter((content) => content.formula) ?? [];
  const canPlay = getCanPlay();

  return (
    <ClayPanelShell className="flex h-full w-full flex-col rounded-none border-0 bg-clay-surface-soft px-4 py-4">
      <div className="mb-4">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <h2 className="clay-display-sm text-clay-ink">Điều kiện thí nghiệm</h2>
            <p className="clay-body-sm text-clay-muted">
              Thiết lập phản ứng, theo dõi bình chính và chạy mô phỏng.
            </p>
          </div>
          <ClayPill tone="neutral">{contents.length} chất</ClayPill>
        </div>
      </div>

      <div className="thin-scroll flex-1 space-y-4 overflow-y-auto pr-1">
        <PresetSelector />

        <ClaySectionCard className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-clay-primary text-clay-on-primary">
              <FlaskConical className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="clay-caption-uppercase text-clay-muted">Bình trung tâm</div>
              <div className="clay-title-sm text-clay-ink">Hóa chất trong bình</div>
            </div>
          </div>

          {contents.length === 0 ? (
            <div className="rounded-[var(--clay-rounded-lg)] border border-dashed border-clay-hairline bg-clay-canvas px-5 py-8 text-center">
              <FlaskConical className="mx-auto mb-3 h-6 w-6 text-clay-muted" />
              <p className="clay-title-sm text-clay-ink">Chưa có hoá chất</p>
              <p className="clay-body-sm mt-1 text-clay-muted">
                Chọn từ thư viện bên phải để bắt đầu.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contents.map((content, index) => (
                <div
                  key={`${content.formula}-${index}`}
                  className="group flex items-center gap-3 rounded-[var(--clay-rounded-lg)] border border-clay-hairline bg-clay-canvas px-3 py-3"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/70 shadow-sm"
                    style={{
                      backgroundColor: getBottleColor(
                        content.formula.toLowerCase().replace(/[₂₃₄₅₆₇₈₉()]/g, ""),
                        content.formula,
                      ),
                    }}
                  />
                  <Formula
                    formula={content.formula}
                    className="min-w-0 flex-1 break-words clay-title-sm text-clay-ink"
                  />
                  <span className="clay-caption shrink-0 text-clay-muted">
                    {content.amountMl ?? 10} mL
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromBeaker(content.formula)}
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] text-clay-muted opacity-0 transition-all hover:bg-clay-surface-soft hover:text-clay-ink group-hover:opacity-100"
                    title={`Bỏ ${content.formula}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ClaySectionCard>

        <ExperimentTimeline />

        {appliedConditions?.autoAdjusted && (
          <div className="mt-3 rounded-[var(--clay-rounded-lg)] bg-amber-50 border border-amber-200 p-3">
             <div className="clay-title-sm text-amber-800">Tự động áp dụng điều kiện</div>
             <div className="clay-body-sm text-amber-700">{appliedConditions.reasonVi}</div>
          </div>
        )}
      </div>

      <ClaySectionCard className="mt-4 space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="clay-caption-uppercase text-clay-muted">Thao tác</div>
            <div className="clay-title-sm text-clay-ink">Điều khiển phản ứng</div>
          </div>
          <ClayPill tone={canPlay ? "teal" : "neutral"}>
            {canPlay ? "Sẵn sàng" : "Chờ đủ chất"}
          </ClayPill>
        </div>

        <ClayActionButton
          variant="primary"
          className="w-full justify-center"
          disabled={!canPlay}
          onClick={async () => {
            if (!canPlay || !centerBeakerId) return;
            await runReaction(centerBeakerId);
          }}
        >
          {isLoading ? (
            <RotateCcw className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Play className="h-4.5 w-4.5" />
          )}
          {isLoading ? "Đang mô phỏng phản ứng" : "Chạy phản ứng"}
        </ClayActionButton>

        <div className="grid grid-cols-2 gap-2">
          <ClayActionButton
            variant="secondary"
            disabled={contents.length === 0}
            onClick={() => undoLastChemical()}
            className="justify-center"
          >
            <Undo2 className="h-4 w-4" />
            Hoàn tác
          </ClayActionButton>
          <ClayActionButton
            variant="secondary"
            disabled={contents.length === 0}
            onClick={() => clearBeaker()}
            className="justify-center text-clay-brand-pink hover:bg-clay-brand-pink/10"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tất cả
          </ClayActionButton>
        </div>
      </ClaySectionCard>
    </ClayPanelShell>
  );
}
