"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Database
} from "lucide-react";
import {
  CATEGORY_GROUPS,
  getBottleColor,
  getChemicalColor,
  type Chemical,
  type CategoryGroup,
} from "@/constants/chemicals";
import { Formula } from "./Formula";
import { cn } from "@/utils/cn";

/* ─── Realistic Chemical Bottle SVG ───────────────────────────────── */

function ChemicalBottleSVG({
  liquidColor,
  size = 40,
}: {
  liquidColor: string;
  size?: number;
}) {
  const w = size;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 40 40" fill="none">
      {/* Bottle cap */}
      <rect x="14" y="2" width="12" height="5" rx="2" fill="#78909C" />
      <rect x="15" y="1" width="10" height="3" rx="1.5" fill="#90A4AE" />
      {/* Bottle neck */}
      <rect x="16" y="7" width="8" height="6" rx="1" fill="rgba(200,220,240,0.4)" stroke="rgba(120,160,200,0.3)" strokeWidth="0.5" />
      {/* Bottle body */}
      <path
        d="M16 13 L12 18 Q10 20 10 23 L10 34 Q10 37 13 37 L27 37 Q30 37 30 34 L30 23 Q30 20 28 18 L24 13 Z"
        fill="rgba(200,220,240,0.25)"
        stroke="rgba(120,160,200,0.35)"
        strokeWidth="0.7"
      />
      {/* Liquid inside */}
      <path
        d="M11 22 L11 34 Q11 36 13 36 L27 36 Q29 36 29 34 L29 22 Z"
        fill={liquidColor}
      />
      {/* Glass shine */}
      <path
        d="M13 18 L13 34 Q13 35 14 35"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Label area */}
      <rect x="14" y="25" width="12" height="7" rx="1" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

/* ─── Draggable Chemical Card ─────────────────────────────────────── */

function DraggableChemicalCard({
  chemical,
  group,
}: {
  chemical: Chemical;
  group: CategoryGroup;
}) {
  // Not draggable anymore

  const bottleColor = getBottleColor(chemical.id, chemical.formula);

  return (
    /* Card — static, not draggable */
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-transparent bg-card p-2.5",
        "transition-all duration-200 ease-out",
        "hover:shadow-[var(--shadow-card)]",
      )}
    >
      {/* ── Bottle icon ── */}
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          "transition-all duration-150",
        )}
        title={chemical.name}
      >
        <ChemicalBottleSVG liquidColor={bottleColor} size={44} />
      </div>

      {/* Info text — static */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-navy">
          {chemical.name}
        </div>
        <Formula
          formula={chemical.formula}
          className="font-display text-[11px] font-medium text-navy-soft"
        />
      </div>
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
  if (group.chemicals.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-transparent bg-card/40">
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
  const [dynamicChemicals, setDynamicChemicals] = useState<Chemical[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const searchAPI = async () => {
    if (!query.trim()) return;
    setIsSearchingApi(true);
    setApiError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/chemicals/resolve?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      if (data.status === "success" && data.data && data.data.source !== "FALLBACK") {
        const info = data.data;
        const newChem: Chemical = {
          id: `api_${info.canonicalFormula.toLowerCase()}_${Date.now()}`,
          name: info.canonicalName, // Capitalize or use as is
          formula: info.canonicalFormula,
          category: "api",
          color: getChemicalColor("dynamic", info.canonicalFormula),
        };

        setDynamicChemicals(prev => {
          // Avoid exact formula duplicates in dynamic list
          if (prev.some(c => c.formula.toUpperCase() === newChem.formula.toUpperCase())) return prev;
          return [newChem, ...prev];
        });
        setQuery(""); // Clear query on success
      } else {
        setApiError("Không tìm thấy chất này trên hệ thống.");
      }
    } catch (e) {
      setApiError("Lỗi kết nối máy chủ API.");
    } finally {
      setIsSearchingApi(false);
    }
  };

  const filtered = CATEGORY_GROUPS.map((g) => ({
    ...g,
    chemicals: g.chemicals.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.formula.toLowerCase().includes(query.toLowerCase()),
    ),
  }));

  // Append dynamic chemicals category
  if (dynamicChemicals.length > 0) {
    filtered.push({
      key: "api",
      label: "Từ cơ sở dữ liệu",
      emoji: "🌐",
      colorVar: "--cat-api",
      chemicals: dynamicChemicals.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.formula.toLowerCase().includes(query.toLowerCase()),
      )
    });
  }

  const totalFilteredCount = filtered.reduce((s, g) => s + g.chemicals.length, 0);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-card/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      {/* Header + search */}
      <div className="border-b border-white/10 px-4 py-3.5 bg-card/40">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-navy">
            Chemical Library
          </h2>
          <span className="text-[11px] text-navy-soft">
            {CATEGORY_GROUPS.reduce((s, g) => s + g.chemicals.length, 0) + dynamicChemicals.length} chất
          </span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchAPI();
            }}
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

        {/* Dynamic API Search Trigger */}
        {query.trim().length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl bg-blue-50/50 p-2 border border-blue-100/50">
            <button
              onClick={searchAPI}
              disabled={isSearchingApi}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-[13px] font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-600 hover:text-white disabled:opacity-50"
            >
              {isSearchingApi ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4 transition-transform group-hover:scale-110" />
              )}
              {isSearchingApi ? "Đang tra cứu..." : `Tìm "${query}" trên CSDL`}
            </button>
            {apiError && <p className="mt-2 text-center text-xs text-red-500 font-medium">{apiError}</p>}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto p-3">
        {totalFilteredCount === 0 && !isSearchingApi && (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <p className="text-sm text-navy-soft mb-2">Không có trong danh sách gốc.</p>
            <p className="text-xs text-navy-soft/70 max-w-[200px]">Hãy thử nhấn "Tìm trên CSDL" để tải về từ cơ sở dữ liệu lớn.</p>
          </div>
        )}
        
        {filtered.map((g, i) => (
          <CategorySection key={g.key} group={g} defaultOpen={i < 2 || g.key === "api"} />
        ))}
      </div>
    </aside>
  );
}
