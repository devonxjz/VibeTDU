"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Check,
  ChevronDown,
  FlaskConical
} from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import {
  CATEGORY_GROUPS,
  CATEGORY_UI_COLORS,
  getBottleColor,
  type Chemical,
  type CategoryGroup,
} from "@/constants/chemicals";
import { Formula } from "@/components/chemlab/Formula";
import { cn } from "@/utils/cn";

/* ─── Chemical Card ─────────────────────────────────────────────────── */

function ChemicalCard({
  chemical,
  group,
}: {
  chemical: Chemical;
  group: CategoryGroup;
}) {
  const addToBeaker = useLabStore((s) => s.addToBeaker);
  const vessel = useLabStore((s) => s.centerBeakerId ? s.vessels[s.centerBeakerId] : null);

  // Check if chemical is already in the beaker
  const isAdded = vessel?.contents.some((c) => c.formula === chemical.formula) ?? false;
  const substanceColor = getBottleColor(chemical.id, chemical.formula);
  const uiColor = CATEGORY_UI_COLORS[group.key];

  return (
    <motion.button
      whileTap={isAdded ? undefined : { scale: 0.95 }}
      onClick={() => {
        if (!isAdded) {
          addToBeaker({
            name: chemical.name,
            formula: chemical.formula,
            category: chemical.category,
            chemicalId: chemical.id,
          });
        }
      }}
      disabled={isAdded}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-all duration-200 ease-out",
        isAdded
          ? "cursor-not-allowed border-border bg-surface opacity-70"
          : "bg-card hover:shadow-[var(--shadow-card)] active:bg-control-bg-hover"
      )}
      style={{
        borderColor: isAdded ? undefined : uiColor.border,
        background: isAdded ? undefined : `linear-gradient(90deg, ${uiColor.softBg} 0%, #ffffff 62%)`,
      }}
    >
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-inner"
        style={{
          background: `linear-gradient(145deg, ${uiColor.bg}, #ffffff)`,
          borderColor: uiColor.border,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.82), 0 6px 14px ${uiColor.accent}1f`,
        }}
      >
        <FlaskConical className="h-5 w-5" style={{ color: uiColor.accent }} strokeWidth={2.4} />
        <span
          className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: substanceColor }}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Formula
            formula={chemical.formula}
            className="truncate font-display text-sm font-extrabold text-foreground"
          />
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
            style={{ backgroundColor: uiColor.bg, color: uiColor.text }}
          >
            {chemical.category}
          </span>
        </div>
        <div className="truncate text-xs font-semibold text-muted-foreground">
          {chemical.name}
        </div>
      </div>

      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-transparent">
        {isAdded && <Check className="h-4 w-4 text-emerald-500" />}
      </div>
    </motion.button>
  );
}

/* ─── Category Section ──────────────────────────────────────────────── */

function CategorySection({
  group,
  defaultOpen,
}: {
  group: CategoryGroup;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  if (group.chemicals.length === 0) return null;
  const uiColor = CATEGORY_UI_COLORS[group.key];

  return (
    <div
      className="overflow-hidden rounded-lg border bg-surface-overlay"
      style={{ borderColor: uiColor.border }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-control-bg"
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-sm leading-none"
            style={{ backgroundColor: uiColor.bg, color: uiColor.accent }}
          >
            {group.emoji}
          </span>
          <span className="text-xs font-extrabold" style={{ color: uiColor.text }}>
            {group.label}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums"
            style={{ backgroundColor: uiColor.bg, color: uiColor.text }}
          >
            {group.chemicals.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-1.5 p-2 pt-0">
            {group.chemicals.map((c) => (
                <ChemicalCard key={c.id} chemical={c} group={group} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ChemicalLibrary Panel ────────────────────────────────────── */

export function ChemicalLibrary() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const q = query.toLowerCase();

  // Filter chemicals
  const filteredGroups = CATEGORY_GROUPS.map((g) => {
    // If a specific tab is selected (not "all") and it doesn't match this category, hide all
    if (activeTab !== "all" && g.key !== activeTab) {
      return { ...g, chemicals: [] };
    }
    // Filter by search query
    const filteredChems = g.chemicals.filter(
      (c) =>
        c.formula.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
    return { ...g, chemicals: filteredChems };
  }).filter((g) => g.chemicals.length > 0);

  const hasResults = filteredGroups.length > 0;
  const categoryTabs = CATEGORY_GROUPS.map((g) => {
    const uiColor = CATEGORY_UI_COLORS[g.key];
    const active = activeTab === g.key;

    return { group: g, uiColor, active };
  });

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-surface-overlay px-4 py-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-foreground">
            Thư viện hoá chất
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {CATEGORY_GROUPS.reduce((s, g) => s + g.chemicals.length, 0)} chất
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm công thức, tên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-mint focus:ring-2 focus:ring-mint/30"
          />
        </div>

        {/* Filter Tabs */}
        <div className="thin-scroll -mx-2 flex gap-1.5 overflow-x-auto px-2 pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors",
              activeTab === "all"
                ? "bg-[#D84315] text-white shadow-sm"
                : "bg-surface text-muted-foreground hover:bg-control-bg hover:text-foreground"
            )}
          >
            Tất cả
          </button>
          {categoryTabs.map(({ group, uiColor, active }) => (
            <button
              key={group.key}
              onClick={() => setActiveTab(group.key)}
              className="flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-extrabold transition-colors"
              style={{
                backgroundColor: active ? uiColor.accent : uiColor.bg,
                borderColor: active ? uiColor.accent : uiColor.border,
                color: active ? "#ffffff" : uiColor.text,
                boxShadow: active ? `0 6px 14px ${uiColor.accent}33` : undefined,
              }}
            >
              <span>{group.emoji}</span>
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="thin-scroll flex-1 overflow-y-auto px-3 py-3">
        {!hasResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Không tìm thấy hoá chất
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Thử tìm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGroups.map((g) => (
              <CategorySection
                key={g.key}
                group={g}
                defaultOpen={query.length > 0 || activeTab === g.key}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
