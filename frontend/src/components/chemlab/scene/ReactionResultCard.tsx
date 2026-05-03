"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { ReactionFormula } from "@/components/chemlab/Formula";
import { Info, Zap, AlertTriangle, XCircle } from "lucide-react";
import { ExplanationPanel } from "@/components/chemlab/panels/ExplanationPanel";

export function ReactionResultCard() {
  const reaction = useLabStore((s) => s.lastReaction);

  const reactionTypeName: Record<string, string> = {
    GAS_BUBBLE: "Tạo khí 🫧",
    PRECIPITATE: "Kết tủa ⬇️",
    COLOR_CHANGE: "Đổi màu 🎨",
    HEAT: "Toả nhiệt 🔥",
    EXPLOSION: "Nổ 💥",
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
          className="w-full bg-card border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] shrink-0 max-h-[45%] overflow-hidden flex flex-col"
        >
          <div className="overflow-y-auto p-4 sm:p-6">
            {/* No-reaction state */}
            {!reaction.hasReaction ? (
              <div className="flex items-start gap-3 rounded-xl bg-surface border border-border p-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Không có phản ứng
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {reaction.messageVi || "Các chất này không phản ứng với nhau trong điều kiện hiện tại."}
                  </p>
                  {reaction.explanationVi && (
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {reaction.explanationVi}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Header & Equation */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Kết quả phản ứng
                      </span>
                      {reaction.effectType && reaction.effectType !== "NONE" && (
                        <span className="ml-2 rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {reactionTypeName[reaction.effectType] ?? reaction.effectType}
                        </span>
                      )}
                    </div>
                    {reaction.equation && (
                      <ReactionFormula
                        formula={reaction.equation}
                        className="text-base font-bold text-foreground"
                      />
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Observation */}
                  {reaction.messageVi && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-surface p-3 border border-border">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Hiện tượng
                        </p>
                        <p className="text-sm leading-relaxed text-foreground">
                          {reaction.messageVi}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Safety */}
                  {reaction.safetyNoteVi && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3 border border-destructive/20">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive-foreground" />
                      <div>
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-destructive-foreground/70">
                          An toàn
                        </p>
                        <p className="text-sm leading-relaxed text-foreground">
                          {reaction.safetyNoteVi}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border w-full mb-4" />

                {/* Integrated Explanation Panel */}
                <ExplanationPanel />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
