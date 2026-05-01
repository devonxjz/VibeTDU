"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Check,
  ChevronDown,
  Loader2,
  Database,
  FlaskConical
} from "lucide-react";
import { useLabStore } from "@/stores/lab-store";
import {
  CATEGORY_GROUPS,
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
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const vessel = useLabStore((s) => s.centerBeakerId ? s.vessels[s.centerBeakerId] : null);

  // Check if chemical is already in the beaker
  const isAdded = vessel?.contents.some((c) => c.formula === chemical.formula) ?? false;
  const dotColor = getBottleColor(chemical.id, chemical.formula);

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
        "group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200 ease-out",
        isAdded
          ? "bg-[#2C2C2C]/40 opacity-60 cursor-not-allowed"
          : "bg-[#2C2C2C] hover:bg-[#3C3C3C]/80 hover:shadow-[var(--shadow-card)] active:bg-[#3C3C3C]/50"
      )}
    >
      {/* Color dot */}
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1C] shadow-inner"
      >
        <FlaskConical className="h-4 w-4" style={{ color: dotColor }} />
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Formula
            formula={chemical.formula}
            className="truncate font-display text-xs font-bold text-[#E0E0E0]"
          />
          {/* Badge */}
          <span className="shrink-0 rounded bg-[#3C3C3C] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
            {chemical.category}
          </span>
        </div>
        <div className="truncate text-[10px] font-medium text-gray-400">
          {chemical.name}
        </div>
      </div>

      {/* Status icon */}
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

  return (
    <div className="overflow-hidden rounded-xl bg-[#2C2C2C]/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[#3C3C3C]/40"
      >
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{group.emoji}</span>
          <span className="text-xs font-semibold text-[#E0E0E0]">{group.label}</span>
          <span className="rounded-full bg-[#3C3C3C] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-gray-400">
            {group.chemicals.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-300",
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

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#2C2C2C]/40 px-4 py-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-[#E0E0E0]">
            Thư viện hoá chất
          </h2>
          <span className="text-[11px] text-gray-400">
            {CATEGORY_GROUPS.reduce((s, g) => s + g.chemicals.length, 0)} chất
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm công thức, tên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#2C2C2C] py-2 pl-9 pr-3 text-xs text-[#E0E0E0] outline-none transition-all placeholder:text-gray-400/60 focus:border-mint focus:ring-2 focus:ring-mint/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="thin-scroll -mx-2 flex gap-1.5 overflow-x-auto px-2 pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
              activeTab === "all"
                ? "bg-[#FF8A65] text-white"
                : "bg-[#3C3C3C] text-gray-400 hover:bg-[#3C3C3C]/80 hover:text-[#E0E0E0]"
            )}
          >
            Tất cả
          </button>
          {CATEGORY_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveTab(g.key)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1",
                activeTab === g.key
                  ? "bg-[#FF8A65] text-white"
                  : "bg-[#3C3C3C] text-gray-400 hover:bg-[#3C3C3C]/80 hover:text-[#E0E0E0]"
              )}
            >
              <span>{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="thin-scroll flex-1 overflow-y-auto px-3 py-3">
        {!hasResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#3C3C3C]/60">
              <Search className="h-5 w-5 text-gray-400/60" />
            </div>
            <p className="text-xs font-semibold text-[#E0E0E0]">
              Không tìm thấy hoá chất
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
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
