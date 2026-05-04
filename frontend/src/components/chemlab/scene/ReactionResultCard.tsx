"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { ReactionFormula } from "@/components/chemlab/Formula";
import { Info, Zap, AlertTriangle, XCircle } from "lucide-react";
import { ExplanationPanel } from "@/components/chemlab/panels/ExplanationPanel";

export function ReactionResultCard() {
  const reaction = useLabStore((s) => s.lastReaction);

  const reactionTypeName: Record<string, string> = {
    GAS_BUBBLE: "Tạo khí",
    PRECIPITATE: "Kết tủa",
    COLOR_CHANGE: "Đổi màu",
    HEAT: "Toả nhiệt",
    EXPLOSION: "Nổ mạnh",
    NONE: "Không có hiệu ứng",
  };

  return (
    <AnimatePresence>
      {reaction != null && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="flex max-h-[48%] w-full shrink-0 flex-col overflow-hidden border-t border-panel-border bg-card shadow-[0_-18px_44px_-22px_rgba(15,23,42,0.35)]"
        >
          <div className="thin-scroll overflow-y-auto p-4 sm:p-5">
            {!reaction.hasReaction ? (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-600 dark:text-slate-300" />
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    Không có phản ứng
                  </p>
                  <p className="text-sm font-medium leading-6 text-foreground">
                    {reaction.messageVi || "Các chất này không phản ứng với nhau trong điều kiện hiện tại."}
                  </p>
                  {reaction.explanationVi && (
                    <p className="mt-2 text-sm leading-6 text-foreground/85">
                      {reaction.explanationVi}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                        <Zap className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                        Kết quả phản ứng
                      </span>
                      {reaction.effectType && reaction.effectType !== "NONE" && (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-100">
                          {reactionTypeName[reaction.effectType] ?? reaction.effectType}
                        </span>
                      )}
                    </div>
                    {reaction.equation && (
                      <ReactionFormula
                        formula={reaction.equation}
                        className="break-words text-base font-extrabold leading-7 text-foreground sm:text-lg"
                      />
                    )}
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {reaction.messageVi && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface p-3.5">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                          Hiện tượng
                        </p>
                        <p className="text-sm font-medium leading-6 text-foreground">
                          {reaction.messageVi}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {reaction.safetyNoteVi && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-red-300 bg-red-50 p-3.5 dark:border-red-400/30 dark:bg-red-950/40">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-200" />
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-red-800 dark:text-red-100">
                          An toàn
                        </p>
                        <p className="text-sm font-bold leading-6 text-red-950 dark:text-red-50">
                          {reaction.safetyNoteVi}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4 h-px w-full bg-border" />
                <ExplanationPanel />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
