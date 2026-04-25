"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Vessel, ActiveEffect, Position } from "@/types/lab";
import type { MixResponse, ReactionResult, VesselContent } from "@/types/api";
import { mixChemicals } from "@/api/client/lab";
import { resetSession as apiResetSession } from "@/api/client/lab";
import { CHEMICAL_COLORS, getBottleColor } from "@/constants/chemicals";

// ─── Color map by chemical category ─────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  acid: "oklch(0.75 0.15 25)",       // warm red-orange
  base: "oklch(0.78 0.12 260)",      // soft blue
  salt: "oklch(0.82 0.08 90)",       // warm amber
  metal: "oklch(0.70 0.05 250)",     // steel gray-blue
  nonmetal: "oklch(0.80 0.10 170)",  // teal green
  organic: "oklch(0.78 0.12 140)",   // green
};

/**
 * Get a display color for a chemical.
 * Priority: specific chemical color > category color > fallback
 */
function getDisplayColor(chemicalId?: string, formula?: string, category?: string): string {
  // 1. Try specific chemical color from our database
  if (chemicalId && CHEMICAL_COLORS[chemicalId]) {
    return getBottleColor(chemicalId);
  }
  
  // 2. Try to match by formula (lowercase id)
  if (formula) {
    const normalizedId = formula.toLowerCase().replace(/[()]/g, "");
    if (CHEMICAL_COLORS[normalizedId]) {
      return getBottleColor(normalizedId);
    }
  }

  // 3. Fall back to category color
  if (category && CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }

  // 4. Default color
  return "oklch(0.78 0.10 220)";
}

/**
 * Common reaction product colors (for known products).
 */
const PRODUCT_COLORS: Record<string, string> = {
  "NaCl": "rgba(245, 245, 250, 0.9)",      // white (salt solution)
  "H2O": "rgba(200, 225, 250, 0.7)",       // clear/blue tint
  "NaCl + H2O": "rgba(220, 235, 250, 0.8)", // clear solution
  "CaCl2 + CO2 + H2O": "rgba(210, 230, 245, 0.8)", // clear + bubbles
  "Cu(OH)2 + Na2SO4": "#1565C0",            // blue precipitate
  "AgCl + NaNO3": "rgba(238, 238, 238, 0.95)", // white precipitate
  "ZnCl2 + H2": "rgba(220, 230, 240, 0.8)",  // clear solution
  "CaCl2": "rgba(230, 240, 248, 0.85)",     // clear
  "CO2": "rgba(210, 230, 250, 0.5)",         // colorless gas
  "Cu(OH)2": "#1565C0",                       // blue solid
  "AgCl": "rgba(235, 235, 240, 0.95)",       // white solid
  "Na2SO4": "rgba(245, 245, 250, 0.9)",      // white
  "NaNO3": "rgba(245, 245, 250, 0.9)",       // white
};

function getProductColor(productFormula?: string, effectColor?: string): string | null {
  if (effectColor) return effectColor;
  if (productFormula && PRODUCT_COLORS[productFormula]) {
    return PRODUCT_COLORS[productFormula];
  }
  return null;
}

// ─── Store Interface ────────────────────────────────────────────────

interface LabStore {
  // State
  vessels: Record<string, Vessel>;
  centerBeakerId: string | null;
  selectedVesselId: string | null;
  activeEffect: ActiveEffect | null;
  lastReaction: ReactionResult | null;
  sessionCode: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCenterBeaker: (id: string | null) => void;
  addVessel: (chemical: { name: string; formula: string; category?: string; chemicalId?: string }, position: Position) => string;
  removeVessel: (id: string) => void;
  selectVessel: (id: string | null) => void;
  moveVessel: (id: string, position: Position) => void;
  mixVessels: (sourceId: string, targetId: string) => Promise<void>;
  mixChemicalIntoVessel: (chemical: VesselContent, targetId: string) => Promise<void>;
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
  centerBeakerId: null,
  selectedVesselId: null,
  activeEffect: null,
  lastReaction: null,
  sessionCode: `session-${nanoid(8)}`,
  isLoading: false,
  error: null,

  setCenterBeaker: (id) => set({ centerBeakerId: id }),

  addVessel: (chemical, position) => {
    const id = `vessel-${nanoid(8)}`;
    const displayColor = getDisplayColor(
      chemical.chemicalId,
      chemical.formula,
      chemical.category
    );
    
    const vessel: Vessel = {
      id,
      position,
      contents: [
        { inputName: chemical.name, formula: chemical.formula, amountMl: 10 },
      ],
      displayColor,
      label: chemical.formula,
    };
    set((state) => {
      const isFirst = Object.keys(state.vessels).length === 0;
      return {
        vessels: { ...state.vessels, [id]: vessel },
        centerBeakerId: isFirst ? id : state.centerBeakerId,
      };
    });
    return id;
  },

  removeVessel: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.vessels;
      return {
        vessels: rest,
        selectedVesselId: state.selectedVesselId === id ? null : state.selectedVesselId,
        centerBeakerId: state.centerBeakerId === id ? null : state.centerBeakerId,
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

  mixChemicalIntoVessel: async (chemical, targetId) => {
    const state = get();
    const target = state.vessels[targetId];
    if (!target) return;

    set({ isLoading: true, error: null });

    try {
      const response: MixResponse = await mixChemicals({
        sessionCode: state.sessionCode,
        sourceVesselId: "temp-source",
        targetVesselId: targetId,
        sourceContents: [chemical],
        targetContents: target.contents,
      });

      const result = response.result;
      const effectType = result?.effectType ?? "NONE";

      // Determine the display color after the reaction
      let newColor = target.displayColor;
      if (response.newTargetVesselState?.displayColor) {
        newColor = response.newTargetVesselState.displayColor;
      } else if (result?.effectColor) {
        newColor = result.effectColor;
      } else if (result?.precipitateColor) {
        newColor = result.precipitateColor;
      } else {
        const productColor = getProductColor(result?.productFormula, result?.effectColor);
        if (productColor) newColor = productColor;
      }

      // Build proper label: show equation result, not just product formula
      let newLabel = target.label;
      if (result?.hasReaction && result?.productFormula) {
        newLabel = result.productFormula;
      } else {
        // No reaction: show both chemicals separated by "+"
        const existingFormulas = target.contents.map(c => c.formula);
        if (!existingFormulas.includes(chemical.formula)) {
          newLabel = [...existingFormulas, chemical.formula].join(" + ");
        }
      }

      const updatedTarget: Vessel = {
        ...target,
        displayColor: newColor,
        contents: response.newTargetVesselState?.contents?.map((p) => ({
          inputName: p.formula,
          formula: p.formula,
        })) as VesselContent[] ?? [
          ...target.contents,
          chemical,
        ],
        label: newLabel,
      };

      set({
        vessels: { ...state.vessels, [targetId]: updatedTarget },
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

      // Determine the display color after the reaction
      let newColor = target.displayColor;
      if (response.newTargetVesselState?.displayColor) {
        newColor = response.newTargetVesselState.displayColor;
      } else if (result?.effectColor) {
        newColor = result.effectColor;
      } else if (result?.precipitateColor) {
        newColor = result.precipitateColor;
      } else {
        const productColor = getProductColor(result?.productFormula, result?.effectColor);
        if (productColor) newColor = productColor;
      }

      // Build proper label
      let newLabel = target.label;
      if (result?.hasReaction && result?.productFormula) {
        newLabel = result.productFormula;
      } else {
        // No reaction: combine both vessel labels
        const allFormulas = [
          ...target.contents.map(c => c.formula),
          ...source.contents.map(c => c.formula),
        ];
        newLabel = [...new Set(allFormulas)].join(" + ");
      }

      const updatedTarget: Vessel = {
        ...target,
        displayColor: newColor,
        contents: response.newTargetVesselState?.contents?.map((p) => ({
          inputName: p.formula,
          formula: p.formula,
        })) as VesselContent[] ?? [
          ...target.contents,
          ...source.contents,
        ],
        label: newLabel,
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
