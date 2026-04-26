"use client";

import {
  FlaskConical,
  TestTube,
  Beaker,
  Flame,
  Filter,
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Gauge,
  Sparkles,
  ChevronDown,
  Bot,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { useLabStore } from "@/stores/lab-store";
import { useChatbotStore } from "@/stores/chatbot-store";

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
  const [activeCanvasTool, setActiveCanvasTool] = useState("select");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1x");

  const resetBoard = useLabStore((s) => s.resetBoard);
  const isLoading = useLabStore((s) => s.isLoading);
  const vesselCount = useLabStore((s) => Object.keys(s.vessels).length);
  const temperature = useLabStore((s) => s.temperature);
  const pressure = useLabStore((s) => s.pressure);
  const catalyst = useLabStore((s) => s.catalyst);
  const setEnvironment = useLabStore((s) => s.setEnvironment);

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

      {/* Canvas tools */}
      <div className="flex items-center gap-0.5">
        <ToolButton
          icon={MousePointer2}
          label="Chọn"
          active={activeCanvasTool === "select"}
          onClick={() => setActiveCanvasTool("select")}
        />
        <ToolButton
          icon={Hand}
          label="Di chuyển"
          active={activeCanvasTool === "pan"}
          onClick={() => setActiveCanvasTool("pan")}
        />
        <ToolButton icon={ZoomIn} label="Phóng to" />
        <ToolButton icon={ZoomOut} label="Thu nhỏ" />
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolButton icon={Undo2} label="Hoàn tác" />
        <ToolButton icon={Redo2} label="Làm lại" />
        <ToolButton
          icon={Trash2}
          label="Xoá tất cả"
          onClick={() => resetBoard()}
          disabled={vesselCount === 0}
        />
      </div>

      <Divider />

      {/* Lab tools */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Beaker} label="Cốc thuỷ tinh" />
        <ToolButton icon={TestTube} label="Ống nghiệm" />
        <ToolButton icon={FlaskConical} label="Bình cầu" />
        <ToolButton icon={Flame} label="Đèn cồn" />
        <ToolButton icon={Filter} label="Phễu lọc" />
      </div>

      <Divider />

      {/* Reaction conditions */}
      <div className="flex items-center gap-2">
        <SliderControl
          icon={Thermometer}
          label="T°"
          value={temperature}
          min={-20}
          max={500}
          unit="°C"
          onChange={(v) => setEnvironment({ temperature: v })}
        />
        <SliderControl
          icon={Gauge}
          label="P"
          value={pressure}
          min={1}
          max={10}
          unit="atm"
          onChange={(v) => setEnvironment({ pressure: v })}
        />
        <div className="relative">
          <button className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-muted">
            <Sparkles className="h-4 w-4 text-navy-soft" />
            <span className="text-[11px] text-navy-soft">Xúc tác</span>
            <span className="font-semibold">{catalyst}</span>
            <ChevronDown className="h-3 w-3 text-navy-soft" />
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Simulation controls */}
      <div className="flex items-center gap-1.5">
        <ToolButton
          icon={Bot}
          label="Trợ lý hoá học"
          active={isChatbotOpen}
          onClick={toggleChatbotPanel}
        />
        <ToolButton
          icon={RotateCcw}
          label="Đặt lại"
          onClick={() => resetBoard()}
          disabled={isLoading}
        />
        <ToolButton
          icon={playing ? Pause : Play}
          label={playing ? "Tạm dừng" : "Chạy mô phỏng"}
          variant="primary"
          onClick={() => setPlaying((p) => !p)}
          disabled={isLoading}
        />
        <div className="flex items-center rounded-lg bg-muted/60 p-0.5">
          {(["0.5x", "1x", "2x"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold transition-all",
                speed === s
                  ? "bg-card text-navy shadow-[var(--shadow-soft)]"
                  : "text-navy-soft hover:text-navy",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
