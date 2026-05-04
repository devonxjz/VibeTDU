"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Check, ChevronDown, FlaskConical } from "lucide-react";

import { useLabStore } from "@/stores/lab-store";
import {
  CATEGORY_GROUPS,
  getBottleColor,
  type Chemical,
  type CategoryGroup,
} from "@/constants/chemicals";
import { Formula } from "@/components/chemlab/Formula";
import { cn } from "@/utils/cn";
import {
  ClayFieldShell,
  ClayPanelShell,
  ClayPill,
} from "@/components/ui/clay-primitives";

const CLAY_CATEGORY_MAP: Record<string, { bg: string; text: string; pill: string }> = {
  acid: {
    bg: "bg-clay-brand-pink/12",
    text: "text-clay-brand-pink",
    pill: "bg-clay-brand-pink text-clay-on-primary",
  },
  base: {
    bg: "bg-clay-brand-teal/14",
    text: "text-clay-brand-teal",
    pill: "bg-clay-brand-teal text-clay-on-primary",
  },
  salt: {
    bg: "bg-clay-brand-lavender/22",
    text: "text-clay-ink",
    pill: "bg-clay-brand-lavender text-clay-ink",
  },
  metal: {
    bg: "bg-clay-brand-peach/22",
    text: "text-clay-ink",
    pill: "bg-clay-brand-peach text-clay-ink",
  },
  nonmetal: {
    bg: "bg-clay-brand-ochre/22",
    text: "text-clay-ink",
    pill: "bg-clay-brand-ochre text-clay-ink",
  },
  organic: {
    bg: "bg-clay-surface-card",
    text: "text-clay-ink",
    pill: "bg-clay-primary text-clay-on-primary",
  },
  api: {
    bg: "bg-sky-500/12",
    text: "text-sky-700 dark:text-sky-300",
    pill: "bg-sky-600 text-white",
  },
};

function ChemicalCard({
  chemical,
  group,
}: {
  chemical: Chemical;
  group: CategoryGroup;
}) {
  const addToBeaker = useLabStore((state) => state.addToBeaker);
  const vessel = useLabStore((state) =>
    state.centerBeakerId ? state.vessels[state.centerBeakerId] : null,
  );

  const isAdded = vessel?.contents.some((content) => content.formula === chemical.formula) ?? false;
  const substanceColor = getBottleColor(chemical.id, chemical.formula);
  const clayStyle = CLAY_CATEGORY_MAP[group.key] || CLAY_CATEGORY_MAP.organic;

  return (
    <motion.button
      whileTap={isAdded ? undefined : { scale: 0.98 }}
      type="button"
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
        "group flex w-full items-center gap-4 rounded-[var(--clay-rounded-lg)] border p-4 text-left transition-colors duration-200",
        isAdded
          ? "cursor-not-allowed border-clay-hairline bg-clay-surface-soft opacity-65"
          : "border-clay-hairline bg-clay-canvas hover:bg-clay-surface-card",
      )}
    >
      <span
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]",
          clayStyle.bg,
        )}
      >
        <FlaskConical className={cn("h-6 w-6", clayStyle.text)} strokeWidth={2} />
        <span
          className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: substanceColor }}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Formula formula={chemical.formula} className="truncate clay-title-sm text-clay-ink" />
          <span className={cn("rounded-full px-2 py-0.5 clay-caption", clayStyle.pill)}>
            {chemical.category}
          </span>
        </div>
        <div className="truncate clay-body-sm text-clay-muted">{chemical.name}</div>
      </div>

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-transparent">
        {isAdded && <Check className="h-5 w-5 text-clay-ink" />}
      </div>
    </motion.button>
  );
}

function CategorySection({
  group,
  defaultOpen,
}: {
  group: CategoryGroup;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  if (group.chemicals.length === 0) return null;

  const clayStyle = CLAY_CATEGORY_MAP[group.key] || CLAY_CATEGORY_MAP.organic;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--clay-rounded-xl)] border border-clay-hairline transition-colors",
        open ? clayStyle.bg : "bg-clay-surface-card",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{group.emoji}</span>
          <span className={cn("clay-title-md", open ? clayStyle.text : "text-clay-ink")}>
            {group.label}
          </span>
          <ClayPill tone="neutral" className={open ? "border-transparent bg-black/8 text-current dark:bg-white/10" : ""}>
            {group.chemicals.length}
          </ClayPill>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-300",
            open ? clayStyle.text : "text-clay-muted",
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
          <div className="space-y-3 p-4 pt-0">
            {group.chemicals.map((chemical) => (
              <ChemicalCard key={chemical.id} chemical={chemical} group={group} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChemicalLibrary() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const q = query.toLowerCase();

  const filteredGroups = CATEGORY_GROUPS.map((group) => {
    if (activeTab !== "all" && group.key !== activeTab) {
      return { ...group, chemicals: [] };
    }

    const chemicals = group.chemicals.filter(
      (chemical) =>
        chemical.formula.toLowerCase().includes(q) ||
        chemical.name.toLowerCase().includes(q),
    );

    return { ...group, chemicals };
  }).filter((group) => group.chemicals.length > 0);

  const hasResults = filteredGroups.length > 0;

  return (
    <ClayPanelShell className="flex h-full w-full flex-col rounded-none border-0 bg-clay-surface-soft px-4 py-4">
      <div className="mb-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="clay-display-sm text-clay-ink">Thư viện hoá chất</h2>
            <p className="clay-body-sm text-clay-muted">
              Tìm chất, lọc theo nhóm và thêm trực tiếp vào bình trung tâm.
            </p>
          </div>
          <ClayPill tone="neutral">
            {CATEGORY_GROUPS.reduce((sum, group) => sum + group.chemicals.length, 0)} chất
          </ClayPill>
        </div>

        <ClayFieldShell className="mb-4 h-[52px] bg-clay-canvas">
          <Search className="h-5 w-5 text-clay-muted" />
          <input
            type="text"
            placeholder="Tìm công thức, tên..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-full w-full bg-transparent clay-body-md text-clay-ink outline-none placeholder:text-clay-muted-soft"
          />
        </ClayFieldShell>

        <div className="thin-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 clay-caption transition-colors",
              activeTab === "all"
                ? "bg-clay-ink text-clay-canvas"
                : "bg-clay-canvas text-clay-muted hover:bg-clay-surface-card hover:text-clay-ink",
            )}
          >
            Tất cả
          </button>
          {CATEGORY_GROUPS.map((group) => {
            const active = activeTab === group.key;
            const clayStyle = CLAY_CATEGORY_MAP[group.key] || CLAY_CATEGORY_MAP.organic;

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setActiveTab(group.key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 clay-caption transition-colors",
                  active ? clayStyle.pill : "bg-clay-canvas text-clay-muted hover:bg-clay-surface-card hover:text-clay-ink",
                )}
              >
                <span className="mr-1.5">{group.emoji}</span>
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto pr-1">
        {!hasResults ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[var(--clay-rounded-xl)] border border-dashed border-clay-hairline bg-clay-surface-card px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clay-canvas">
              <Search className="h-5 w-5 text-clay-muted" />
            </div>
            <p className="clay-title-sm text-clay-ink">Không tìm thấy hoá chất</p>
            <p className="mt-1 clay-body-sm text-clay-muted">
              Thử lại với công thức hoặc tên khác.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <CategorySection
                key={group.key}
                group={group}
                defaultOpen={query.length > 0 || activeTab === group.key}
              />
            ))}
          </div>
        )}
      </div>
    </ClayPanelShell>
  );
}
