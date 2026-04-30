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
    <section className="bg-[#1C1C1C]/60 px-4 py-3 shrink-0">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-navy-soft">
        Lịch sử thao tác
      </h3>
      
      {events.length === 0 ? (
        <p className="text-xs italic text-navy-soft">Chưa có thao tác nào</p>
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
                iconClass = "text-mint";
                bgClass = "bg-mint-soft/30 border-mint/20";
                break;
              case "REACT":
                Icon = Zap;
                iconClass = "text-amber-500";
                bgClass = "bg-amber-50 border-amber-200/50";
                break;
              case "UNDO":
                Icon = Undo2;
                iconClass = "text-slate-400";
                bgClass = "bg-slate-50 border-slate-200";
                break;
              case "RESET":
                Icon = RotateCcw;
                iconClass = "text-rose-400";
                bgClass = "bg-rose-50 border-rose-200/50";
                break;
              case "PRESET":
                Icon = Sparkles;
                iconClass = "text-purple-500";
                bgClass = "bg-purple-50 border-purple-200/50";
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
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
                  <Icon className={cn("h-3.5 w-3.5", iconClass)} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-[11px] font-semibold text-navy" title={event.description}>
                    {event.description}
                  </span>
                  <span className="text-[9px] text-navy-soft">{event.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
