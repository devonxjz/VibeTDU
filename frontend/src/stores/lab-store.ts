"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Vessel, ActiveEffect, Position, TimelineEvent } from "@/types/lab";
import type { MixResponse, ReactionResult, VesselContent, AutoAppliedConditions, ReactionStep } from "@/types/api";
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
  unlockedReactions: string[];
  reactionSteps: ReactionStep[];
  appliedConditions: AutoAppliedConditions | null;

  // Environment conditions
  temperature: number;
  pressure: number;
  catalyst: string;

  // PRO click-to-add state
  beakerLiquidLevel: number;   // 0–100
  isReacting: boolean;

  // PRO computed getters (implemented as functions)
  getCanPlay: () => boolean;
  getEffectSpeed: () => number;

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
  unlockReaction: (id: string) => void;

  // PRO click-to-add actions
  /** Click a chemical card → adds to center beaker (no dupes, +15 level) */
  addToBeaker: (chemical: { name: string; formula: string; category?: string; chemicalId?: string }) => void;
  /** Remove a specific chemical by formula from center beaker (-15 level) */
  removeFromBeaker: (formula: string) => void;
  /** Clear center beaker only (reset contents, level, reaction state) */
  clearBeaker: () => void;

  // Guest Migration Actions
  saveGuestExperiment: () => void;
  clearGuestExperiment: () => void;
  setGuestExperimentDismissed: (dismissed: boolean) => void;
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
  unlockedReactions: [],
  reactionSteps: [],
  appliedConditions: null,

  temperature: 25,
  pressure: 1,
  catalyst: "Không",

  // PRO click-to-add state
  beakerLiquidLevel: 0,
  isReacting: false,

  getCanPlay: () => {
    const s = get();
    if (!s.centerBeakerId || s.isLoading) return false;
    const vessel = s.vessels[s.centerBeakerId];
    if (!vessel) return false;
    const contents = vessel.contents.filter(c => c.formula);
    return contents.length >= 1;
  },

  getEffectSpeed: () => {
    const t = get().temperature;
    return Math.max(0.1, Math.min(t / 25, 10)); // Base 25°C = 1x speed
  },

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

  unlockReaction: (id) => set((state) => ({
    unlockedReactions: state.unlockedReactions.includes(id) 
      ? state.unlockedReactions 
      : [...state.unlockedReactions, id]
  })),

  // Guest Migration
  saveGuestExperiment: () => {
    const s = get();
    // Only save if we have a reaction and a beaker
    if (!s.lastReaction || !s.centerBeakerId) return;
    const vessel = s.vessels[s.centerBeakerId];
    if (!vessel) return;

    // Build experiment data matching schema
    const experimentData = {
      version: 1,
      timestamp: new Date().toISOString(),
      contents: vessel.contents,
      reaction: s.lastReaction,
    };

    // Check size limit (~4MB to be safe)
    try {
      const dataStr = JSON.stringify(experimentData);
      if (dataStr.length < 4 * 1024 * 1024) {
        localStorage.setItem("guestExperiment", dataStr);
      }
    } catch (e) {
      console.warn("Failed to save guest experiment to local storage", e);
    }
  },

  clearGuestExperiment: () => {
    try {
      localStorage.removeItem("guestExperiment");
    } catch (e) {}
  },

  setGuestExperimentDismissed: (dismissed: boolean) => {
    try {
      if (dismissed) {
        localStorage.setItem("guestExperimentDismissed", "true");
      } else {
        localStorage.removeItem("guestExperimentDismissed");
      }
    } catch (e) {}
  },

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
    if (!vessel || vessel.contents.filter(c => c.formula).length < 1) {
      set({ error: "Cần ít nhất 1 hóa chất trong bình để chạy phản ứng" });
      setTimeout(() => get().setError(null), 3000);
      return;
    }

    set({ isLoading: true, isReacting: true, error: null });

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
            contents: response.finalContents?.map(p => ({ inputName: p.formula, formula: p.formula })) as VesselContent[] ??
                      response.newTargetVesselState?.contents?.map((p) => ({ inputName: p.formula, formula: p.formula })) as VesselContent[] ?? 
                      vessel.contents,
          },
        },
        // Always update lastReaction (even no-reaction) so UI can show feedback
        lastReaction: result ?? null,
        reactionSteps: response.steps ?? [],
        appliedConditions: response.appliedConditions ?? null,
        activeEffect: effectType !== "NONE" ? { type: effectType, vesselId, color: result?.effectColor, precipitateColor: result?.precipitateColor, gasFormula: result?.gasFormula } : null,
        isLoading: false,
        error: (!result?.hasReaction) ? null : null, // clear any previous errors on success
      });

      // Auto-clear isReacting after 3000ms
      setTimeout(() => set({ isReacting: false }), 3000);

      if (response.steps && response.steps.length > 0) {
        // Sequential mode: Add an event for each step
        response.steps.forEach(step => {
           get().addTimelineEvent({
             type: "REACT",
             description: `Bước ${step.stepNumber}: ${step.equation || "Phản ứng"}`,
           });
           const reactionKey = step.reactants.map(r => r.toLowerCase()).sort().join("+");
           get().unlockReaction(reactionKey);
        });
      } else if (result?.hasReaction) {
        // Fallback for mock/cache
        const formulas = vessel.contents.map(c => c.formula).filter(Boolean);
        const reactionKey = formulas.map(r => r.toLowerCase()).sort().join("+");
        get().unlockReaction(reactionKey);

        get().addTimelineEvent({
          type: "REACT",
          description: result.equation || "Phản ứng đã chạy",
        });
      }

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }

      // Save to guest storage if unauthenticated
      get().saveGuestExperiment();
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

      // Auto-clear isReacting after 3000ms
      setTimeout(() => set({ isReacting: false }), 3000);

      if (mockResult.hasReaction) {
        const reactionKey = formulas.map(r => r.toLowerCase()).sort().join("+");
        get().unlockReaction(reactionKey);

        get().addTimelineEvent({
          type: "REACT",
          description: mockResult.equation || "Phản ứng đã chạy",
        });
      }

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
      
      get().saveGuestExperiment();
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

      if (result?.hasReaction) {
        const formulas = [...target.contents.map(c => c.formula), chemical.formula].filter(Boolean);
        const reactionKey = formulas.map(r => r.toLowerCase()).sort().join("+");
        get().unlockReaction(reactionKey);
      }

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

      if (mockResult.hasReaction) {
        const reactionKey = formulas.map(r => r.toLowerCase()).sort().join("+");
        get().unlockReaction(reactionKey);
      }

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
      
      get().saveGuestExperiment();
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

      if (result?.hasReaction) {
        const formulas = [...target.contents.map(c => c.formula), ...source.contents.map(c => c.formula)].filter(Boolean);
        const reactionKey = formulas.map(r => r.toLowerCase()).sort().join("+");
        get().unlockReaction(reactionKey);
      }

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

      if (mockResult.hasReaction) {
        const reactionKey = formulas.map(r => r.toLowerCase()).sort().join("+");
        get().unlockReaction(reactionKey);
      }

      if (effectType !== "NONE") {
        const duration = EFFECT_DURATION[effectType] ?? 3000;
        setTimeout(() => get().clearEffect(), duration);
      }
      
      get().saveGuestExperiment();
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

  // ─── PRO click-to-add actions ─────────────────────────────────────

  addToBeaker: (chemical) => {
    const state = get();
    let beakerId = state.centerBeakerId;

    // Auto-init center beaker if needed
    if (!beakerId) {
      beakerId = get().initCenterBeaker();
    }

    const vessel = get().vessels[beakerId!];
    if (!vessel) return;

    // No dupes — skip if formula already exists
    if (vessel.contents.some(c => c.formula === chemical.formula)) return;

    // Count existing real chemicals BEFORE adding
    const existingCount = vessel.contents.filter(c => c.formula).length;

    // Add the chemical via existing addChemicalToVessel
    get().addChemicalToVessel(
      {
        inputName: chemical.name,
        formula: chemical.formula,
        amountMl: 10,
        category: chemical.category,
        chemicalId: chemical.chemicalId,
      },
      beakerId!,
    );

    // Update liquid level (+15 per chemical, clamped 0-100)
    set((s) => {
      const v = s.vessels[beakerId!];
      const realCount = v ? v.contents.filter(c => c.formula).length : 0;
      return { beakerLiquidLevel: Math.min(100, realCount * 15) };
    });
  },

  removeFromBeaker: (formula) => {
    const state = get();
    const beakerId = state.centerBeakerId;
    if (!beakerId) return;
    const vessel = state.vessels[beakerId];
    if (!vessel) return;

    // Find the index of the chemical with this formula
    const idx = vessel.contents.findIndex(c => c.formula === formula);
    if (idx === -1) return;

    get().addTimelineEvent({
      type: "UNDO",
      description: `Bỏ ${formula}`,
      formulaLabel: formula,
    });

    set((s) => {
      const v = s.vessels[beakerId];
      if (!v) return s;

      const newContents = v.contents.filter((_, i) => i !== idx);
      const realContents = newContents.filter(c => c.formula);

      let newColor = "rgba(200,230,255,0.0)";
      if (realContents.length > 0) {
        const last = realContents[realContents.length - 1];
        newColor = getDisplayColor("", last.formula, "");
      }

      const newLabel = realContents.length > 0
        ? [...new Set(realContents.map(c => c.formula).filter(Boolean))].join(" + ")
        : "";

      return {
        vessels: {
          ...s.vessels,
          [beakerId]: {
            ...v,
            contents: newContents,
            displayColor: newColor,
            label: newLabel,
          },
        },
        beakerLiquidLevel: Math.min(100, Math.max(0, realContents.length * 15)),
        lastReaction: null,
        activeEffect: null,
      };
    });
  },

  clearBeaker: () => {
    const state = get();
    const beakerId = state.centerBeakerId;
    if (!beakerId) return;

    get().clearTimeline();
    get().addTimelineEvent({
      type: "RESET",
      description: "Xóa tất cả hoá chất trong bình",
    });

    set((s) => {
      const v = s.vessels[beakerId];
      if (!v) return s;
      return {
        vessels: {
          ...s.vessels,
          [beakerId]: {
            ...v,
            contents: [],
            displayColor: "rgba(200,230,255,0.0)",
            label: "",
          },
        },
        beakerLiquidLevel: 0,
        lastReaction: null,
        activeEffect: null,
        isReacting: false,
      };
    });
  },
}));
