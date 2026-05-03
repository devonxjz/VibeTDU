"use client";

import { useEffect, useRef } from "react";
import { useLabStore } from "@/stores/lab-store";
import { FlaskConical, Zap, Undo2, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

export function ExperimentTimeline() {
  const events = useLabStore((s) => s.timelineEvents);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events.length]);

  return (
    <section className="bg-surface-overlay border-b px-4 py-3 shrink-0">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Lịch sử thao tác
      </h3>
      
      {events.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">Chưa có thao tác nào</p>
      ) : (
        <div 
          ref={scrollRef}
          className="thin-scroll flex gap-2 overflow-x-auto pb-1 scroll-smooth"
        >
          {events.map((event) => {
            let Icon = FlaskConical;
            let iconClass = "";
            let bgClass = "bg-card";
            
            switch (event.type) {
              case "ADD":
                Icon = FlaskConical;
                iconClass = "text-emerald-400";
                bgClass = "bg-emerald-500/10 border-emerald-500/20";
                break;
              case "REACT":
                Icon = Zap;
                iconClass = "text-amber-400";
                bgClass = "bg-amber-500/10 border-amber-500/20";
                break;
              case "UNDO":
                Icon = Undo2;
                iconClass = "text-slate-300";
                bgClass = "bg-slate-500/10 border-slate-500/20";
                break;
              case "RESET":
                Icon = RotateCcw;
                iconClass = "text-rose-400";
                bgClass = "bg-rose-500/10 border-rose-500/20";
                break;
              case "PRESET":
                Icon = Sparkles;
                iconClass = "text-purple-400";
                bgClass = "bg-purple-500/10 border-purple-500/20";
                break;
            }

            return (
              <div 
                key={event.id}
                className={cn(
                  "flex min-w-[140px] shrink-0 items-center gap-2 rounded-lg border p-2",
                  bgClass
                )}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-card shadow-sm border">
                  <Icon className={cn("h-3.5 w-3.5", iconClass)} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-[11px] font-semibold text-foreground" title={event.description}>
                    {event.description}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{event.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
