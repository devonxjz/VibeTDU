"use client";

import {
  FlaskConical,
  Trash2,
  Thermometer,
  Gauge,
  Sparkles,
  ChevronDown,
  Bot,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useLabStore } from "@/stores/lab-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  variant?: "default" | "primary";
  disabled?: boolean;
}

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
  variant = "default",
  disabled,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={cn(
        "group relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.04]",
        disabled && "cursor-not-allowed opacity-40",
        variant === "primary" &&
          "h-10 w-10 bg-mint text-navy shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
        variant === "default" &&
          (active
            ? "bg-mint-soft text-navy ring-1 ring-mint"
            : "text-navy-soft hover:bg-mint-soft/60 hover:text-navy"),
      )}
    >
      <Icon className={cn(variant === "primary" ? "h-5 w-5" : "h-[18px] w-[18px]")} />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

interface SliderControlProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderControl({
  icon: Icon,
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: SliderControlProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5">
      <Icon className="h-4 w-4 text-navy-soft" />
      <span className="text-[11px] font-medium text-navy-soft">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-border accent-mint"
      />
      <span className="min-w-[38px] text-right text-xs font-semibold tabular-nums text-navy">
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-navy-soft">
          {unit}
        </span>
      </span>
    </div>
  );
}

export function Toolbar() {
  const vesselCount = useLabStore((s) => Object.keys(s.vessels).length);
  const temperature = useLabStore((s) => s.temperature);
  const pressure = useLabStore((s) => s.pressure);
  const catalyst = useLabStore((s) => s.catalyst);
  const setEnvironment = useLabStore((s) => s.setEnvironment);
  const resetBoard = useLabStore((s) => s.resetBoard);

  const toggleChatbotPanel = useChatbotStore((s) => s.togglePanel);
  const isChatbotOpen = useChatbotStore((s) => s.isOpen);

  return (
    <div className="flex h-14 w-full items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-mint to-baby shadow-[var(--shadow-soft)]">
          <FlaskConical className="h-4.5 w-4.5 text-navy" strokeWidth={2.2} />
        </div>
        <div className="font-display text-base font-bold tracking-tight text-navy">
          ChemLab
        </div>
      </div>

      <Divider />

      {/* Quick actions */}
      <div className="flex items-center gap-0.5">
        <ToolButton
          icon={Trash2}
          label="Xoá tất cả"
          onClick={() => resetBoard()}
          disabled={vesselCount === 0}
        />
      </div>

      <Divider />

      {/* Reaction conditions */}
      <div className="flex items-center gap-2">
        {/* Temperature */}
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 px-3 py-1.5 shadow-sm">
          <Thermometer className="h-4 w-4 text-rose-400" />
          <span className="text-[11px] font-semibold text-navy-soft">Nhiệt độ</span>
          <input
            type="range"
            min={0}
            max={500}
            step={5}
            value={temperature}
            onChange={(e) => setEnvironment({ temperature: Number(e.target.value) })}
            className="w-20 accent-rose-400"
          />
          <span className="rounded bg-card px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-navy shadow-sm min-w-[36px] text-center border border-border/50">
            {temperature}°C
          </span>
        </div>

        {/* Pressure */}
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 px-3 py-1.5 shadow-sm">
          <Gauge className="h-4 w-4 text-blue-400" />
          <span className="text-[11px] font-semibold text-navy-soft">Áp suất</span>
          <div className="flex gap-1 ml-0.5">
            {[
              { value: 0.5, label: "0.5" },
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 5, label: "5atm" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEnvironment({ pressure: opt.value })}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[11px] font-semibold transition-all",
                  pressure === opt.value
                    ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-border/60 bg-card/60 text-navy-soft hover:bg-card hover:text-navy"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalyst */}
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 px-3 py-1.5 shadow-sm hidden xl:flex">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-[11px] font-semibold text-navy-soft">Xúc tác</span>
          <div className="flex gap-1 ml-0.5">
            {["Không", "MnO₂", "Fe", "Pt", "Ni", "V₂O₅"].map((opt) => (
              <button
                key={opt}
                onClick={() => setEnvironment({ catalyst: opt })}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[11px] font-semibold transition-all",
                  catalyst === opt
                    ? "border-amber-300 bg-amber-50 text-amber-700 shadow-sm"
                    : "border-border/60 bg-card/60 text-navy-soft hover:bg-card hover:text-navy"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side — Chatbot + User */}
      <div className="flex items-center gap-1.5">
        <ToolButton
          icon={Bot}
          label="Trợ lý hoá học"
          active={isChatbotOpen}
          onClick={toggleChatbotPanel}
        />
        <Divider />
        <ToolButton
          icon={UserCircle2}
          label="Đăng nhập"
          onClick={() => {
            // TODO: wire to login flow
          }}
        />
      </div>
    </div>
  );
}
