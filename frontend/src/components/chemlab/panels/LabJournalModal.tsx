"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Lock, Play } from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import { ClayPanelShell, ClayActionButton, ClayPill } from "@/components/ui/clay-primitives";
import { cn } from "@/utils/cn";

import { getJournals } from "@/api/client/journal";
import type { JournalSummary, ExperimentData } from "@/types/journal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
  const [journals, setJournals] = React.useState<(JournalSummary & { parsedData: ExperimentData | null })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      getJournals().then(res => {
        if (res.success) {
          const parsedJournals = res.data.map(j => {
            let parsedData: ExperimentData | null = null;
            try {
              parsedData = JSON.parse(j.experimentData);
            } catch (e) {
              console.error("Failed to parse journal data", e);
            }
            return { ...j, parsedData };
          });
          setJournals(parsedJournals);
        } else {
          setError(res.error);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen]);

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
                      Đã lưu: <span className="font-bold text-clay-ink">{journals.length}</span> thí nghiệm
                    </p>
                  </div>
                </div>
                <ClayActionButton variant="ghost" size="icon" onClick={onClose} aria-label="Đóng sổ tay">
                  <X className="h-6 w-6" />
                </ClayActionButton>
              </div>

              {/* Grid Content */}
              <div className="thin-scroll flex-1 overflow-y-auto p-6 sm:p-8 bg-clay-canvas">
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="clay-body-md text-clay-muted">Đang tải sổ tay...</p>
                  </div>
                ) : error ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="clay-body-md text-clay-brand-pink">{error}</p>
                  </div>
                ) : journals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <BookOpen className="w-16 h-16 mb-4 text-clay-muted" />
                    <p className="clay-title-md text-clay-ink">Chưa có thí nghiệm nào</p>
                    <p className="clay-body-md text-clay-muted">Hãy thực hiện phản ứng và lưu lại để xem tại đây</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {journals.map((entry) => {
                      const reaction = entry.parsedData?.reaction;
                      const hasReaction = reaction?.hasReaction;
                      const effectType = reaction?.effectType || "NONE";
                      
                      // Map effect to color theme
                      const colorMap: Record<string, string> = {
                        GAS_BUBBLE: "teal",
                        PRECIPITATE: "lavender",
                        COLOR_CHANGE: "peach",
                        HEAT: "ochre",
                        EXPLOSION: "pink",
                        NONE: "cream"
                      };
                      
                      const theme = CARD_COLORS[colorMap[effectType]] || CARD_COLORS.cream;
                      const dateStr = format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", { locale: vi });

                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "group relative flex h-40 flex-col justify-between overflow-hidden rounded-[var(--clay-rounded-lg)] p-5 transition-transform hover:-translate-y-1 shadow-sm border border-clay-hairline",
                            theme.bg
                          )}
                        >
                          <div className="relative z-10">
                            <ClayPill tone="neutral" className="mb-3 border-none bg-white/20 text-current backdrop-blur-md">
                              {dateStr}
                            </ClayPill>
                            <h3 className="clay-title-md line-clamp-2">
                              {entry.title}
                            </h3>
                          </div>
                          
                          <div className="relative z-10 flex items-center justify-between mt-auto">
                            <p className={cn("clay-body-sm font-mono truncate", theme.subtitle)}>
                              {reaction?.equation || (hasReaction ? "Phản ứng đã xảy ra" : "Không có phản ứng")}
                            </p>
                            <button
                              onClick={() => {
                                if (entry.parsedData) {
                                  useLabStore.getState().loadExperiment(entry.parsedData);
                                  onClose();
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-current transition-colors"
                              title="Xem lại mô phỏng phản ứng"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Decorative background element */}
                          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ClayPanelShell>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
