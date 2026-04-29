"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Vessel, ActiveEffect, Position, TimelineEvent } from "@/types/lab";
import type { MixResponse, ReactionResult, VesselContent } from "@/types/api";
import { mixChemicals } from "@/api/client/lab";
import { resetSession as apiResetSession } from "@/api/client/lab";
import { CHEMICAL_COLORS, getBottleColor } from "@/constants/chemicals";
import { getMockReaction } from "@/utils/reaction-mock";

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
  timelineEvents: TimelineEvent[];

  // Environment conditions
  temperature: number;
  pressure: number;
  catalyst: string;

  // Actions
  setCenterBeaker: (id: string | null) => void;
  /** Create the center beaker vessel with EMPTY contents (used on Board init) */
  initCenterBeaker: () => string;
  addVessel: (chemical: { name: string; formula: string; category?: string; chemicalId?: string }, position: Position) => string;
  removeVessel: (id: string) => void;
  selectVessel: (id: string | null) => void;
  moveVessel: (id: string, position: Position) => void;
  /** Add a chemical to an existing vessel locally (no API call) */
  addChemicalToVessel: (chemical: VesselContent & { category?: string; chemicalId?: string }, targetId: string) => void;
  /** Run the reaction API for a vessel (called by Play button) */
  runReaction: (vesselId: string) => Promise<void>;
  mixVessels: (sourceId: string, targetId: string) => Promise<void>;
  mixChemicalIntoVessel: (chemical: VesselContent, targetId: string) => Promise<void>;
  resetBoard: () => Promise<void>;
  /** Remove the last chemical added to center beaker */
  undoLastChemical: () => void;
  clearEffect: () => void;
  setError: (error: string | null) => void;

  setEnvironment: (conditions: Partial<{ temperature: number; pressure: number; catalyst: string }>) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id" | "timestamp">) => void;
  clearTimeline: () => void;
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
  timelineEvents: [],

  temperature: 25,
  pressure: 1,
  catalyst: "Không",

  addTimelineEvent: (event) => set((state) => ({
    timelineEvents: [
      ...state.timelineEvents,
      {
        ...event,
        id: nanoid(6),
        timestamp: new Date().toTimeString().slice(0, 8),
      },
    ],
  })),

  clearTimeline: () => set({ timelineEvents: [] }),

  setCenterBeaker: (id) => set({ centerBeakerId: id }),

  /* ── Create empty center beaker ─────────────────────────────────── */
  initCenterBeaker: () => {
    const id = `vessel-${nanoid(8)}`;
    const vessel: Vessel = {
      id,
      position: { x: 0, y: 0 },
      contents: [],          // ← truly empty
      displayColor: "rgba(200,230,255,0.0)", // transparent until chemical added
      label: "",
    };
    set((state) => ({
      vessels: { ...state.vessels, [id]: vessel },
      centerBeakerId: id,
    }));
    return id;
  },

  addChemicalToVessel: (chemical, targetId) => {
    get().addTimelineEvent({
      type: "ADD",
      description: `Thêm ${chemical.formula} · ${chemical.amountMl ?? 10} mL`,
      formulaLabel: chemical.formula,
    });

    set((state) => {
      const target = state.vessels[targetId];
      if (!target) return state;

      const newContents = [
        ...target.contents,
        { inputName: chemical.inputName, formula: chemical.formula, amountMl: chemical.amountMl ?? 10 },
      ];

      // Always recompute color: use the LATEST chemical's color as dominant
      // This ensures beaker color updates visibly on every pour
      const incomingColor = getDisplayColor(
        chemical.chemicalId ?? "",
        chemical.formula,
        chemical.category ?? ""
      );
      const realContents = newContents.filter((c) => c.formula);
      // Simple blend: if only 1 chemical, use its color. If 2+, blend toward latest.
      let blendedColor: string;
      if (realContents.length <= 1) {
        blendedColor = incomingColor;
      } else {
        // Mix: 40% old + 60% new (latest chemical dominates visual)
        blendedColor = incomingColor; // simplified — latest wins for clear visual feedback
      }

      // Build label: all unique formulas joined with +
      const newFormulas = [...new Set(realContents.map((c) => c.formula).filter(Boolean))];
      const newLabel = newFormulas.join(" + ") || target.label;

      return {
        vessels: {
          ...state.vessels,
          [targetId]: {
            ...target,
            displayColor: blendedColor,
            contents: newContents,
            label: newLabel,
          },
        },
      };
    });
  },

  /* ── Run reaction via API (triggered by Play button) ─────────────── */
  runReaction: async (vesselId) => {
    const state = get();
    const vessel = state.vessels[vesselId];
    if (!vessel || vessel.contents.length < 2) {
      set({ error: "Cần ít nhất 2 hóa chất trong bình để chạy phản ứng" });
      setTimeout(() => get().setError(null), 3000);
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Build a fake "source" with all chemicals except the first
      const [first, ...rest] = vessel.contents;
      const response: MixResponse = await mixChemicals({
        sessionCode: state.sessionCode,
        sourceVesselId: `${vesselId}-source`,
        targetVesselId: vesselId,
        sourceContents: rest,
        targetContents: [first],
        temperature: state.temperature,
        pressure: state.pressure,
        catalyst: state.catalyst,
      });

      const result = response.result;
      const effectType = result?.effectType ?? "NONE";

      let newColor = vessel.displayColor;
      if (response.newTargetVesselState?.displayColor) newColor = response.newTargetVesselState.displayColor;
      else if (result?.effectColor) newColor = result.effectColor;
      else if (result?.precipitateColor) newColor = result.precipitateColor;
      else { const pc = getProductColor(result?.productFormula, result?.effectColor); if (pc) newColor = pc; }

      let newLabel = vessel.label;
      if (result?.hasReaction && result?.productFormula) newLabel = result.productFormula;

      set({
        vessels: {
          ...state.vessels,
          [vesselId]: {
            ...vessel,
            displayColor: newColor,
            label: newLabel,
            contents: response.newTargetVesselState?.contents?.map((p) => ({ inputName: p.formula, formula: p.formula })) as VesselContent[] ?? vessel.contents,
          },
        },
        lastReaction: result ?? null,
        activeEffect: effectType !== "NONE" ? { type: effectType, vesselId, color: result?.effectColor, precipitateColor: result?.precipitateColor, gasFormula: result?.gasFormula } : null,
        isLoading: false,
      });

      if (result?.hasReaction) {
        get().addTimelineEvent({
          type: "REACT",
          description: result.equation || "Phản ứng đã chạy",
        });
      }

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
    } catch (err) {
      // Offline fallback
      const formulas = vessel.contents.map(c => c.formula).filter(Boolean);
      const mockResult = getMockReaction(formulas);
      const effectType = mockResult.effectType ?? "NONE";
      
      let newColor = vessel.displayColor;
      if (mockResult.effectColor) newColor = mockResult.effectColor;
      else if (mockResult.precipitateColor) newColor = mockResult.precipitateColor;
      else {
        const pc = getProductColor(mockResult.productFormula, mockResult.effectColor);
        if (pc) newColor = pc;
      }
      
      let newLabel = vessel.label;
      if (mockResult.hasReaction && mockResult.productFormula) newLabel = mockResult.productFormula;

      set({
        vessels: {
          ...state.vessels,
          [vesselId]: {
            ...vessel,
            displayColor: newColor,
            label: newLabel,
          },
        },
        lastReaction: mockResult,
        activeEffect: effectType !== "NONE" ? { type: effectType, vesselId, color: mockResult.effectColor, precipitateColor: mockResult.precipitateColor, gasFormula: mockResult.gasFormula } : null,
        isLoading: false,
      });

      if (mockResult.hasReaction) {
        get().addTimelineEvent({
          type: "REACT",
          description: mockResult.equation || "Phản ứng đã chạy",
        });
      }

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
    }
  },

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
        temperature: state.temperature,
        pressure: state.pressure,
        catalyst: state.catalyst,
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
      // Offline fallback
      const formulas = [...target.contents.map(c => c.formula), chemical.formula].filter(Boolean);
      const mockResult = getMockReaction(formulas);
      const effectType = mockResult.effectType ?? "NONE";
      
      let newColor = target.displayColor;
      if (mockResult.effectColor) newColor = mockResult.effectColor;
      else if (mockResult.precipitateColor) newColor = mockResult.precipitateColor;
      else {
        const pc = getProductColor(mockResult.productFormula, mockResult.effectColor);
        if (pc) newColor = pc;
      }
      
      let newLabel = target.label;
      if (mockResult.hasReaction && mockResult.productFormula) {
        newLabel = mockResult.productFormula;
      } else {
        const existingFormulas = target.contents.map(c => c.formula);
        if (!existingFormulas.includes(chemical.formula)) {
          newLabel = [...existingFormulas, chemical.formula].join(" + ");
        }
      }

      set({
        vessels: {
          ...state.vessels,
          [targetId]: {
            ...target,
            displayColor: newColor,
            label: newLabel,
            contents: [...target.contents, chemical],
          },
        },
        lastReaction: mockResult,
        activeEffect: effectType !== "NONE" ? { type: effectType, vesselId: targetId, color: mockResult.effectColor, precipitateColor: mockResult.precipitateColor, gasFormula: mockResult.gasFormula } : null,
        isLoading: false,
      });

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
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
        temperature: state.temperature,
        pressure: state.pressure,
        catalyst: state.catalyst,
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
      // Offline fallback
      const formulas = [...target.contents.map(c => c.formula), ...source.contents.map(c => c.formula)].filter(Boolean);
      const mockResult = getMockReaction(formulas);
      const effectType = mockResult.effectType ?? "NONE";
      
      let newColor = target.displayColor;
      if (mockResult.effectColor) newColor = mockResult.effectColor;
      else if (mockResult.precipitateColor) newColor = mockResult.precipitateColor;
      else {
        const pc = getProductColor(mockResult.productFormula, mockResult.effectColor);
        if (pc) newColor = pc;
      }
      
      let newLabel = target.label;
      if (mockResult.hasReaction && mockResult.productFormula) {
        newLabel = mockResult.productFormula;
      } else {
        const allFormulas = [...target.contents.map(c => c.formula), ...source.contents.map(c => c.formula)];
        newLabel = [...new Set(allFormulas)].join(" + ");
      }

      const { [sourceId]: _, ...remainingVessels } = state.vessels;

      set({
        vessels: {
          ...remainingVessels,
          [targetId]: {
            ...target,
            displayColor: newColor,
            label: newLabel,
            contents: [...target.contents, ...source.contents],
          },
        },
        lastReaction: mockResult,
        activeEffect: effectType !== "NONE" ? { type: effectType, vesselId: targetId, color: mockResult.effectColor, precipitateColor: mockResult.precipitateColor, gasFormula: mockResult.gasFormula } : null,
        isLoading: false,
      });

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
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
      centerBeakerId: null,
      selectedVesselId: null,
      activeEffect: null,
      lastReaction: null,
      sessionCode: `session-${nanoid(8)}`,
      isLoading: false,
      error: null,
      timelineEvents: [{
        id: nanoid(6),
        timestamp: new Date().toTimeString().slice(0, 8),
        type: "RESET",
        description: "Đặt lại thí nghiệm",
      }],
    });
  },

  undoLastChemical: () => {
    const state = get();
    const beakerId = state.centerBeakerId;
    if (beakerId) {
      const vessel = state.vessels[beakerId];
      if (vessel && vessel.contents.length > 0) {
        const lastChemical = vessel.contents[vessel.contents.length - 1];
        if (lastChemical && lastChemical.formula) {
          get().addTimelineEvent({
            type: "UNDO",
            description: `Hoàn tác: ${lastChemical.formula}`,
          });
        }
      }
    }

    set((state) => {
      const beakerId = state.centerBeakerId;
      if (!beakerId) return state;
      const vessel = state.vessels[beakerId];
      if (!vessel || vessel.contents.length === 0) return state;

      const newContents = vessel.contents.slice(0, -1);
      const realContents = newContents.filter((c) => c.formula);

      // Recompute color: use last remaining chemical's color, or transparent if empty
      let newColor = "rgba(200,230,255,0.0)";
      if (realContents.length > 0) {
        const last = realContents[realContents.length - 1];
        newColor = getDisplayColor("", last.formula, "");
      }

      const newLabel = realContents.length > 0
        ? [...new Set(realContents.map((c) => c.formula).filter(Boolean))].join(" + ")
        : "";

      return {
        vessels: {
          ...state.vessels,
          [beakerId]: {
            ...vessel,
            contents: newContents,
            displayColor: newColor,
            label: newLabel,
          },
        },
        // Clear reaction result when undoing
        lastReaction: null,
        activeEffect: null,
      };
    });
  },

  clearEffect: () => set({ activeEffect: null }),

  setError: (error) => set({ error }),

  setEnvironment: (conditions) => set((state) => ({ ...state, ...conditions })),
}));
