"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  FlaskConical,
  GripVertical,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import {
  CATEGORY_GROUPS,
  type Chemical,
  type CategoryGroup,
} from "@/constants/chemicals";
import { Formula } from "./Formula";
import { cn } from "@/utils/cn";

function DraggableChemicalCard({
  chemical,
  group,
}: {
  chemical: Chemical;
  group: CategoryGroup;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `chemical-${chemical.id}`,
      data: {
        type: "chemical",
        chemicalId: chemical.id,
        name: chemical.name,
        formula: chemical.formula,
        category: chemical.category,
      },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 100,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={cn(
        "group flex cursor-grab items-center gap-3 rounded-xl border border-border bg-card p-2.5",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-transparent hover:shadow-[var(--shadow-card)]",
        "active:cursor-grabbing active:scale-[0.98]",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-[var(--shadow-soft)]"
        style={{ backgroundColor: `var(${group.colorVar})` }}
      >
        <FlaskConical className="h-5 w-5 text-navy" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-navy">
          {chemical.name}
        </div>
        <Formula
          formula={chemical.formula}
          className="font-display text-[11px] font-medium text-navy-soft"
        />
      </div>
      <GripVertical className="h-4 w-4 shrink-0 text-navy-soft/40 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function CategorySection({
  group,
  defaultOpen,
}: {
  group: CategoryGroup;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{group.emoji}</span>
          <span className="text-sm font-semibold text-navy">{group.label}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-navy-soft">
            {group.chemicals.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-navy-soft transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-1.5 p-2 pt-0">
            {group.chemicals.map((c) => (
              <DraggableChemicalCard key={c.id} chemical={c} group={group} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchPanel() {
  const [query, setQuery] = useState("");

  const filtered = CATEGORY_GROUPS.map((g) => ({
    ...g,
    chemicals: g.chemicals.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.formula.toLowerCase().includes(query.toLowerCase()),
    ),
  }));

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-card/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      {/* Header + search */}
      <div className="border-b border-white/10 px-4 py-3.5 bg-card/40">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-navy">
            Thư viện hoá chất
          </h2>
          <span className="text-[11px] text-navy-soft">
            {CATEGORY_GROUPS.reduce((s, g) => s + g.chemicals.length, 0)} chất
          </span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hoá chất, công thức…"
            className={cn(
              "h-10 w-full rounded-xl border border-border bg-card pl-9 pr-10 text-sm text-navy",
              "placeholder:text-navy-soft/70",
              "transition-all duration-200",
              "focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30",
            )}
          />
          <button className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-navy-soft transition-colors hover:bg-muted hover:text-navy">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto p-3">
        {filtered.map((g, i) => (
          <CategorySection key={g.key} group={g} defaultOpen={i < 2} />
        ))}
      </div>
    </aside>
  );
}
