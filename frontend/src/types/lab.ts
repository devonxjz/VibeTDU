/**
 * Domain types for the ChemLab UI state.
 * These represent what's visible on the board, not raw API payloads.
 */

import type { EffectType, ReactionResult, VesselContent } from "./api";

// ─── Vessel ─────────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
}

export interface Vessel {
  id: string;
  /** Position on the board canvas (px) */
  position: Position;
  /** Chemical contents inside this vessel */
  contents: VesselContent[];
  /** CSS color for the liquid fill */
  displayColor: string;
  /** Display label (primary formula) */
  label: string;
}

// ─── Drag & Drop ────────────────────────────────────────────────────

export interface DragChemicalData {
  type: "chemical";
  chemicalId: string;
  name: string;
  formula: string;
}

export interface DragVesselData {
  type: "vessel";
  vesselId: string;
}

export type DragData = DragChemicalData | DragVesselData;

// ─── Animation ──────────────────────────────────────────────────────

export interface ActiveEffect {
  type: EffectType;
  /** Vessel id where the effect is anchored */
  vesselId: string;
  /** Extra data from the reaction result */
  color?: string;
  precipitateColor?: string;
  gasFormula?: string;
}

// ─── Lab State ──────────────────────────────────────────────────────

export interface LabState {
  vessels: Record<string, Vessel>;
  selectedVesselId: string | null;
  activeEffect: ActiveEffect | null;
  lastReaction: ReactionResult | null;
  sessionCode: string;
  isLoading: boolean;
  error: string | null;
}
