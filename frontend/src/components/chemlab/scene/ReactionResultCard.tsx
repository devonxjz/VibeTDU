"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { ReactionFormula } from "@/components/chemlab/Formula";
import { Info, Zap, AlertTriangle } from "lucide-react";
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
      {reaction?.hasReaction && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="w-full bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] shrink-0 max-h-[45%] overflow-hidden flex flex-col"
        >
          <div className="overflow-y-auto p-4 sm:p-6">
            {/* Header & Equation */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-soft">
                    Kết quả phản ứng
                  </span>
                  {reaction.effectType && reaction.effectType !== "NONE" && (
                    <span className="ml-2 rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-bold text-navy">
                      {reactionTypeName[reaction.effectType] ?? reaction.effectType}
                    </span>
                  )}
                </div>
                {reaction.equation && (
                  <ReactionFormula
                    formula={reaction.equation}
                    className="text-base font-bold text-navy"
                  />
                )}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Observation */}
              {reaction.messageVi && (
                <div className="flex items-start gap-2.5 rounded-xl bg-baby-soft/30 p-3 border border-baby-soft/50">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-soft" />
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-navy-soft/70">
                      Hiện tượng
                    </p>
                    <p className="text-sm leading-relaxed text-navy">
                      {reaction.messageVi}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Safety */}
              {reaction.safetyNoteVi && (
                <div className="flex items-start gap-2.5 rounded-xl bg-rose-50/50 p-3 border border-rose-100/50">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-rose-600/70">
                      An toàn
                    </p>
                    <p className="text-sm leading-relaxed text-rose-700">
                      {reaction.safetyNoteVi}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 w-full mb-4" />

            {/* Integrated Explanation Panel */}
            <ExplanationPanel />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
