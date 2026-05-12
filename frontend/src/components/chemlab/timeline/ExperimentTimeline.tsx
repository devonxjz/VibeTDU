"use client";

import { useEffect, useRef } from "react";
import { useLabStore } from "@/stores/lab-store";
import { FlaskConical, Zap, Undo2, RotateCcw, Sparkles } from "lucide-react";

import { cn } from "@/utils/cn";
import { ClayPill, ClaySectionCard } from "@/components/ui/clay-primitives";

const EVENT_STYLE = {
  ADD: {
    Icon: FlaskConical,
    card: "bg-clay-brand-teal/10 text-clay-ink",
    icon: "bg-clay-brand-teal text-clay-on-primary",
  },
  REACT: {
    Icon: Zap,
    card: "bg-clay-brand-ochre/18 text-clay-ink",
    icon: "bg-clay-brand-ochre text-clay-ink",
  },
  UNDO: {
    Icon: Undo2,
    card: "bg-clay-surface-soft text-clay-ink",
    icon: "bg-clay-primary text-clay-on-primary",
  },
  RESET: {
    Icon: RotateCcw,
    card: "bg-clay-brand-pink/12 text-clay-ink",
    icon: "bg-clay-brand-pink text-clay-on-primary",
  },
  PRESET: {
    Icon: Sparkles,
    card: "bg-clay-brand-lavender/22 text-clay-ink",
    icon: "bg-clay-brand-lavender text-clay-ink",
  },
} as const;

export function ExperimentTimeline() {
  const events = useLabStore((state) => state.timelineEvents);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events.length]);

  return (
    <ClaySectionCard className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="clay-caption-uppercase text-clay-muted">Lịch sử thao tác</div>
          <div className="clay-body-sm text-clay-muted">Theo dõi các bước vừa thực hiện</div>
        </div>
        <ClayPill tone="neutral">{events.length} bước</ClayPill>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[var(--clay-rounded-lg)] border border-dashed border-clay-hairline bg-clay-canvas px-4 py-5 text-center">
          <div className="clay-body-sm text-clay-muted">Chưa có thao tác nào</div>
        </div>
      ) : (
        <div ref={scrollRef} className="thin-scroll flex gap-2 overflow-x-auto pb-1 scroll-smooth">
          {events.map((event) => {
            const style = EVENT_STYLE[event.type];
            const Icon = style.Icon;

            return (
              <div
                key={event.id}
                className={cn(
                  "min-w-[156px] shrink-0 rounded-[var(--clay-rounded-lg)] border border-clay-hairline p-3",
                  style.card,
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-[12px]",
                      style.icon,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="clay-caption text-clay-muted">{event.timestamp}</div>
                </div>
                <div className="clay-body-sm text-clay-ink" title={event.description}>
                  {event.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ClaySectionCard>
  );
}
