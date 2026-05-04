"use client";

import type { ComponentType, ReactNode } from "react";
import {
  FlaskConical,
  Trash2,
  Thermometer,
  Gauge,
  Sparkles,
  Bot,
  UserCircle2,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/utils/cn";
import { useLabStore } from "@/stores/lab-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ClayActionButton,
  ClayFieldShell,
  ClayPanelShell,
  ClayPill,
} from "@/components/ui/clay-primitives";
import { LabJournalModal } from "./panels/LabJournalModal";

interface IconButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

function IconButton({
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[var(--clay-rounded-md)] border border-transparent transition-colors",
        active
          ? "bg-clay-primary text-clay-on-primary"
          : "bg-transparent text-clay-muted hover:border-clay-hairline hover:bg-clay-surface-card hover:text-clay-ink",
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

function ToolbarCluster({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <ClayFieldShell
      className={cn(
        "min-h-[56px] gap-2 bg-clay-surface-card/90 px-3 py-2 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </ClayFieldShell>
  );
}

function SliderControl({
  icon: Icon,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  accentClassName,
  onChange,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  accentClassName?: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex min-w-[180px] items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-clay-canvas">
        <Icon className={cn("h-4.5 w-4.5 text-clay-muted", accentClassName)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="clay-caption-uppercase text-clay-muted">{label}</span>
          <span className="clay-caption text-clay-ink">
            {value}
            {unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-clay-hairline accent-clay-primary"
        />
      </div>
    </div>
  );
}

export function Toolbar() {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  
  const vesselCount = useLabStore((s) => Object.keys(s.vessels).length);
  const temperature = useLabStore((s) => s.temperature);
  const pressure = useLabStore((s) => s.pressure);
  const catalyst = useLabStore((s) => s.catalyst);
  const setEnvironment = useLabStore((s) => s.setEnvironment);
  const resetBoard = useLabStore((s) => s.resetBoard);

  const toggleChatbotPanel = useChatbotStore((s) => s.togglePanel);
  const isChatbotOpen = useChatbotStore((s) => s.isOpen);

  const pressureOptions = [
    { value: 0.5, label: "0.5 atm" },
    { value: 1, label: "1 atm" },
    { value: 2, label: "2 atm" },
    { value: 5, label: "5 atm" },
  ];

  return (
    <>
      <header className="border-b border-clay-hairline bg-clay-canvas/95 px-3 py-3 backdrop-blur-md md:px-4">
        <div className="flex flex-wrap items-center gap-3">
        <ClayPanelShell
          tone="card"
          className="flex min-h-[56px] items-center gap-3 rounded-[var(--clay-rounded-lg)] px-3 py-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-clay-primary text-clay-on-primary">
            <FlaskConical className="h-5 w-5" strokeWidth={2.1} />
          </div>
          <div>
            <div className="clay-title-md text-clay-ink">ChemLab</div>
            <div className="clay-caption text-clay-muted">
              Bàn thí nghiệm tương tác
            </div>
          </div>
          <ClayPill tone="neutral">{vesselCount} bình</ClayPill>
        </ClayPanelShell>

        <ToolbarCluster className="flex-1 flex-wrap justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SliderControl
              icon={Thermometer}
              label="Nhiệt độ"
              value={temperature}
              min={0}
              max={500}
              step={5}
              unit="°C"
              accentClassName="text-rose-500 dark:text-rose-300"
              onChange={(next) => setEnvironment({ temperature: next })}
            />
            <div className="hidden h-8 w-px bg-clay-hairline lg:block" />
            <div className="flex min-w-[220px] items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-clay-canvas">
                <Gauge className="h-4.5 w-4.5 text-sky-600 dark:text-sky-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="clay-caption-uppercase text-clay-muted">Áp suất</span>
                  <span className="clay-caption text-clay-ink">{pressure} atm</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pressureOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEnvironment({ pressure: option.value })}
                      className={cn(
                        "rounded-full px-2.5 py-1 clay-caption transition-colors",
                        pressure === option.value
                          ? "bg-clay-primary text-clay-on-primary"
                          : "bg-clay-canvas text-clay-muted hover:bg-clay-surface-soft hover:text-clay-ink",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-clay-hairline xl:block" />
            <div className="hidden min-w-[240px] items-center gap-3 xl:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-clay-canvas">
                <Sparkles className="h-4.5 w-4.5 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="clay-caption-uppercase text-clay-muted">Xúc tác</span>
                  <span className="clay-caption text-clay-ink">{catalyst}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Không", "MnO₂", "Fe", "Pt", "Ni", "V₂O₅"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setEnvironment({ catalyst: option })}
                      className={cn(
                        "rounded-full px-2.5 py-1 clay-caption transition-colors",
                        catalyst === option
                          ? "bg-clay-brand-ochre text-clay-ink"
                          : "bg-clay-canvas text-clay-muted hover:bg-clay-surface-soft hover:text-clay-ink",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ClayActionButton
              variant="secondary"
              size="icon"
              onClick={() => resetBoard()}
              disabled={vesselCount === 0}
              aria-label="Xoá tất cả"
              title="Xoá tất cả"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </ClayActionButton>
            <ThemeToggle />
            <IconButton
              icon={BookOpen}
              label="Sổ tay Hóa học"
              active={isJournalOpen}
              onClick={() => setIsJournalOpen(true)}
            />
            <IconButton
              icon={Bot}
              label="Trợ lý hoá học"
              active={isChatbotOpen}
              onClick={toggleChatbotPanel}
            />
            <IconButton
              icon={UserCircle2}
              label="Đăng nhập"
              onClick={() => {
                // TODO: wire to login flow
              }}
            />
          </div>
        </ToolbarCluster>
      </div>
    </header>
    <LabJournalModal isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} />
    </>
  );
}
