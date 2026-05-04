"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Lock } from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import { ClayPanelShell, ClayActionButton, ClayPill } from "@/components/ui/clay-primitives";
import { cn } from "@/utils/cn";

const MOCK_JOURNAL_ENTRIES = [
  { id: "hcl+naoh", title: "Phản ứng trung hòa", equation: "HCl + NaOH → NaCl + H₂O", color: "pink" },
  { id: "bacl2+h2so4", title: "Kết tủa trắng bari", equation: "BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl", color: "lavender" },
  { id: "agno3+nacl", title: "Kết tủa trắng bạc", equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃", color: "lavender" },
  { id: "cuso4+naoh", title: "Kết tủa xanh đồng", equation: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄", color: "teal" },
  { id: "hcl+zn", title: "Điều chế hydro (Zn)", equation: "Zn + 2HCl → ZnCl₂ + H₂↑", color: "peach" },
  { id: "hcl+na2co3", title: "Sủi bọt CO₂", equation: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑", color: "peach" },
  { id: "h2so4+kmno4", title: "Môi trường oxy hóa", equation: "2KMnO₄ + H₂SO₄ → (Môi trường)", color: "ochre" },
  { id: "fe+hcl", title: "Sắt và axit", equation: "Fe + 2HCl → FeCl₂ + H₂↑", color: "peach" },
  { id: "ca+h2o", title: "Canxi và nước", equation: "Ca + 2H₂O → Ca(OH)₂ + H₂↑", color: "teal" },
  { id: "hcl+mg", title: "Điều chế hydro (Mg)", equation: "Mg + 2HCl → MgCl₂ + H₂↑", color: "peach" },
];

const CARD_COLORS: Record<string, { bg: string; subtitle: string }> = {
  pink: { bg: "bg-clay-brand-pink text-clay-on-primary", subtitle: "text-clay-on-primary/90" },
  teal: { bg: "bg-clay-brand-teal text-clay-on-primary", subtitle: "text-clay-on-primary/90" },
  lavender: { bg: "bg-clay-brand-lavender text-clay-ink", subtitle: "text-clay-ink/80" },
  peach: { bg: "bg-clay-brand-peach text-clay-ink", subtitle: "text-clay-ink/80" },
  ochre: { bg: "bg-clay-brand-ochre text-clay-ink", subtitle: "text-clay-ink/80" },
  cream: { bg: "bg-clay-surface-card text-clay-ink", subtitle: "text-clay-muted" },
};

interface LabJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LabJournalModal({ isOpen, onClose }: LabJournalModalProps) {
  const unlockedReactions = useLabStore((s) => s.unlockedReactions);

  // Focus lock and escape key handling
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative flex h-full max-h-[800px] w-full max-w-5xl flex-col overflow-hidden"
          >
            <ClayPanelShell tone="canvas" className="flex h-full flex-col p-0 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-clay-hairline px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--clay-rounded-lg)] bg-clay-surface-card">
                    <BookOpen className="h-6 w-6 text-clay-ink" />
                  </div>
                  <div>
                    <h2 className="clay-display-sm text-clay-ink">Sổ tay Hóa học</h2>
                    <p className="clay-body-sm text-clay-muted mt-1">
                      Đã khám phá: <span className="font-bold text-clay-ink">{unlockedReactions.length}</span> / {MOCK_JOURNAL_ENTRIES.length} phản ứng
                    </p>
                  </div>
                </div>
                <ClayActionButton variant="ghost" size="icon" onClick={onClose} aria-label="Đóng sổ tay">
                  <X className="h-6 w-6" />
                </ClayActionButton>
              </div>

              {/* Grid Content */}
              <div className="thin-scroll flex-1 overflow-y-auto p-6 sm:p-8 bg-clay-canvas">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {MOCK_JOURNAL_ENTRIES.map((entry) => {
                    const isUnlocked = unlockedReactions.includes(entry.id);

                    if (!isUnlocked) {
                      return (
                        <div
                          key={entry.id}
                          className="flex h-40 flex-col items-center justify-center gap-3 rounded-[var(--clay-rounded-lg)] border-2 border-dashed border-clay-hairline bg-clay-surface-soft p-5 text-center transition-all"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-canvas shadow-sm">
                            <Lock className="h-5 w-5 text-clay-muted-soft" />
                          </div>
                          <div>
                            <p className="clay-title-sm text-clay-muted">Chưa khám phá</p>
                            <p className="clay-caption mt-1 font-mono text-clay-muted-soft">??? + ??? → ???</p>
                          </div>
                        </div>
                      );
                    }

                    const theme = CARD_COLORS[entry.color] || CARD_COLORS.cream;

                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "group relative flex h-40 flex-col justify-between overflow-hidden rounded-[var(--clay-rounded-lg)] p-5 transition-transform hover:-translate-y-1 shadow-sm",
                          theme.bg
                        )}
                      >
                        <div className="relative z-10">
                          <ClayPill tone="neutral" className="mb-3 border-none bg-white/20 text-current backdrop-blur-md">
                            Mới khám phá
                          </ClayPill>
                          <h3 className="clay-title-md line-clamp-2">
                            {entry.title}
                          </h3>
                        </div>
                        
                        <p className={cn("relative z-10 clay-body-sm font-mono truncate", theme.subtitle)}>
                          {entry.equation}
                        </p>
                        
                        {/* Decorative background element */}
                        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </ClayPanelShell>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
