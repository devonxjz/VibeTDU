"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { ReactionFormula } from "@/components/chemlab/Formula";
import { Info, Zap, AlertTriangle, XCircle, Save, CheckCircle2 } from "lucide-react";
import { ExplanationPanel } from "@/components/chemlab/panels/ExplanationPanel";
import { ClayPill, ClayActionButton } from "@/components/ui/clay-primitives";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { saveJournal } from "@/api/client/journal";
import { toast } from "sonner";

const EFFECT_PILL: Record<string, "pink" | "teal" | "lavender" | "peach" | "ochre" | "neutral"> = {
  GAS_BUBBLE: "teal",
  PRECIPITATE: "lavender",
  COLOR_CHANGE: "peach",
  HEAT: "ochre",
  EXPLOSION: "pink",
  NONE: "neutral",
};

export function ReactionResultCard() {
  const reaction = useLabStore((state) => state.lastReaction);
  const centerBeakerId = useLabStore((state) => state.centerBeakerId);
  const vessels = useLabStore((state) => state.vessels);
  const { isLoggedIn, login } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(false);
    setIsSaving(false);
  }, [reaction]);

  const reactionTypeName: Record<string, string> = {
    GAS_BUBBLE: "Tạo khí",
    PRECIPITATE: "Kết tủa",
    COLOR_CHANGE: "Đổi màu",
    HEAT: "Toả nhiệt",
    EXPLOSION: "Nổ mạnh",
    NONE: "Không có hiệu ứng",
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      toast("Vui lòng đăng nhập để lưu", {
        action: { label: "Đăng nhập", onClick: () => login() },
      });
      return;
    }

    if (!reaction || !centerBeakerId) return;
    const vessel = vessels[centerBeakerId];
    if (!vessel) return;

    setIsSaving(true);
    const experimentData = JSON.stringify({
      version: 1,
      timestamp: new Date().toISOString(),
      contents: vessel.contents,
      reaction,
    });

    const result = await saveJournal("Thí nghiệm Mới", experimentData);
    setIsSaving(false);

    if (result.success) {
      setIsSaved(true);
      toast.success("Đã lưu vào Sổ tay Hóa học");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AnimatePresence>
      {reaction != null && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="flex max-h-[48%] w-full shrink-0 flex-col overflow-hidden border-t border-clay-hairline bg-clay-surface-soft"
        >
          <div className="thin-scroll overflow-y-auto p-4 sm:p-5">
            {!reaction.hasReaction ? (
              <div className="rounded-[var(--clay-rounded-xl)] border border-clay-hairline bg-clay-surface-card p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-clay-surface-card">
                    <XCircle className="h-5 w-5 text-clay-muted" />
                  </div>
                  <div>
                    <p className="clay-caption-uppercase text-clay-muted">Kết quả phản ứng</p>
                    <p className="clay-title-sm text-clay-ink">Không có phản ứng xảy ra</p>
                  </div>
                </div>
                <p className="clay-body-md text-clay-body">
                  {reaction.messageVi || "Các chất này không phản ứng với nhau trong điều kiện hiện tại."}
                </p>
                {reaction.explanationVi && (
                  <p className="mt-3 clay-body-sm text-clay-muted">{reaction.explanationVi}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[var(--clay-rounded-xl)] border border-clay-hairline bg-clay-surface-card p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-clay-brand-ochre/22">
                          <Zap className="h-5 w-5 text-clay-ink" />
                        </div>
                        <div>
                          <p className="clay-caption-uppercase text-clay-muted">Kết quả phản ứng</p>
                          <p className="clay-title-md text-clay-ink">Phản ứng đã được mô phỏng</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        {reaction.effectType && reaction.effectType !== "NONE" && (
                          <ClayPill tone={EFFECT_PILL[reaction.effectType] ?? "neutral"}>
                            {reactionTypeName[reaction.effectType] ?? reaction.effectType}
                          </ClayPill>
                        )}
                        <ClayActionButton
                          variant="ghost"
                          onClick={handleSave}
                          disabled={isSaving || isSaved}
                          className="text-sm h-8"
                        >
                          {isSaving ? "Đang lưu..." : isSaved ? <><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Đã lưu</> : <><Save className="w-4 h-4 mr-1" /> Lưu vào Sổ tay</>}
                        </ClayActionButton>
                      </div>

                      {reaction.equation && (
                        <ReactionFormula
                          formula={reaction.equation}
                          className="break-words text-[28px] font-medium leading-[1.15] tracking-[-0.6px] text-clay-ink md:text-[40px] md:tracking-[-1px]"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {reaction.messageVi && (
                      <div className="rounded-[var(--clay-rounded-lg)] border border-clay-hairline bg-clay-canvas p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-clay-brand-teal" />
                          <p className="clay-caption-uppercase text-clay-muted">Hiện tượng</p>
                        </div>
                        <p className="clay-body-md text-clay-body">{reaction.messageVi}</p>
                      </div>
                    )}

                    {reaction.safetyNoteVi && (
                      <div className="rounded-[var(--clay-rounded-lg)] border border-clay-brand-pink/35 bg-clay-brand-pink/10 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-clay-brand-pink" />
                          <p className="clay-caption-uppercase text-clay-brand-pink">An toàn</p>
                        </div>
                        <p className="clay-body-md text-clay-ink">{reaction.safetyNoteVi}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[var(--clay-rounded-xl)] border border-clay-hairline bg-clay-surface-card p-5">
                  <div className="mb-4">
                    <p className="clay-caption-uppercase text-clay-muted">Giải thích</p>
                    <p className="clay-title-md text-clay-ink">Phân tích phản ứng</p>
                  </div>
                  <ExplanationPanel />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
