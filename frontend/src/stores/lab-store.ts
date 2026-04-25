"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Vessel, ActiveEffect, Position } from "@/types/lab";
import type { MixResponse, ReactionResult, VesselContent } from "@/types/api";
import { mixChemicals } from "@/api/client/lab";
import { resetSession as apiResetSession } from "@/api/client/lab";

// ─── Color map by chemical category ─────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  acid: "oklch(0.75 0.15 25)",       // warm red-orange
  base: "oklch(0.78 0.12 260)",      // soft blue
  salt: "oklch(0.82 0.08 90)",       // warm amber
  metal: "oklch(0.70 0.05 250)",     // steel gray-blue
  nonmetal: "oklch(0.80 0.10 170)",  // teal green
  organic: "oklch(0.78 0.12 140)",   // green
};

function getDefaultColor(formula: string): string {
  // Simple heuristic based on common formulas
  const lower = formula.toLowerCase();
  if (lower.startsWith("h") && lower.includes("o")) return CATEGORY_COLORS.acid;
  if (lower.includes("oh")) return CATEGORY_COLORS.base;
  return "oklch(0.78 0.10 220)";
}

// ─── Store Interface ────────────────────────────────────────────────

interface LabStore {
  // State
  vessels: Record<string, Vessel>;
  selectedVesselId: string | null;
  activeEffect: ActiveEffect | null;
  lastReaction: ReactionResult | null;
  sessionCode: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  addVessel: (chemical: { name: string; formula: string; category?: string }, position: Position) => string;
  removeVessel: (id: string) => void;
  selectVessel: (id: string | null) => void;
  moveVessel: (id: string, position: Position) => void;
  mixVessels: (sourceId: string, targetId: string) => Promise<void>;
  resetBoard: () => Promise<void>;
  clearEffect: () => void;
  setError: (error: string | null) => void;
}

// ─── Effect Duration Map ────────────────────────────────────────────

const EFFECT_DURATION: Record<string, number> = {
  NONE: 0,
  GAS_BUBBLE: 3000,
  PRECIPITATE: 2500,
  COLOR_CHANGE: 2000,
  HEAT: 3000,
  EXPLOSION: 4000,
};

export const useLabStore = create<LabStore>((set, get) => ({
  // Initial state
  vessels: {},
  selectedVesselId: null,
  activeEffect: null,
  lastReaction: null,
  sessionCode: `session-${nanoid(8)}`,
  isLoading: false,
  error: null,

  addVessel: (chemical, position) => {
    const id = `vessel-${nanoid(8)}`;
    const vessel: Vessel = {
      id,
      position,
      contents: [
        { inputName: chemical.name, formula: chemical.formula, amountMl: 10 },
      ],
      displayColor: chemical.category
        ? (CATEGORY_COLORS[chemical.category] ?? getDefaultColor(chemical.formula))
        : getDefaultColor(chemical.formula),
      label: chemical.formula,
    };
    set((state) => ({
      vessels: { ...state.vessels, [id]: vessel },
    }));
    return id;
  },

  removeVessel: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.vessels;
      return {
        vessels: rest,
        selectedVesselId: state.selectedVesselId === id ? null : state.selectedVesselId,
      };
    });
  },

  selectVessel: (id) => set({ selectedVesselId: id }),

  moveVessel: (id, position) => {
    set((state) => {
      const vessel = state.vessels[id];
      if (!vessel) return state;
      return {
        vessels: {
          ...state.vessels,
          [id]: { ...vessel, position },
        },
      };
    });
  },

  mixVessels: async (sourceId, targetId) => {
    const state = get();
    const source = state.vessels[sourceId];
    const target = state.vessels[targetId];
    if (!source || !target) return;

    set({ isLoading: true, error: null });

    try {
      const response: MixResponse = await mixChemicals({
        sessionCode: state.sessionCode,
        sourceVesselId: sourceId,
        targetVesselId: targetId,
        sourceContents: source.contents,
        targetContents: target.contents,
      });

      const result = response.result;
      const effectType = result?.effectType ?? "NONE";

      // Update target vessel with new state from API
      const updatedTarget: Vessel = {
        ...target,
        displayColor: response.newTargetVesselState?.displayColor ?? target.displayColor,
        contents: response.newTargetVesselState?.contents?.map((p) => ({
          inputName: p.formula,
          formula: p.formula,
        })) as VesselContent[] ?? [
          ...target.contents,
          ...source.contents,
        ],
        label: result?.productFormula ?? target.label,
      };

      // Remove source vessel (it was "poured" into target)
      const { [sourceId]: _, ...remainingVessels } = state.vessels;

      set({
        vessels: { ...remainingVessels, [targetId]: updatedTarget },
        lastReaction: result ?? null,
        activeEffect:
          effectType !== "NONE"
            ? {
                type: effectType,
                vesselId: targetId,
                color: result?.effectColor,
                precipitateColor: result?.precipitateColor,
                gasFormula: result?.gasFormula,
              }
            : null,
        isLoading: false,
      });

      // Auto-clear effect after animation
      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => {
          get().clearEffect();
        }, duration);
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Lỗi không xác định",
      });
    }
  },

  resetBoard: async () => {
    const { sessionCode } = get();
    try {
      await apiResetSession(sessionCode);
    } catch {
      // Reset locally even if API fails
    }
    set({
      vessels: {},
      selectedVesselId: null,
      activeEffect: null,
      lastReaction: null,
      sessionCode: `session-${nanoid(8)}`,
      isLoading: false,
      error: null,
    });
  },

  clearEffect: () => set({ activeEffect: null }),

  setError: (error) => set({ error }),
}));
