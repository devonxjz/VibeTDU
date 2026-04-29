/**
 * TypeScript types mirroring backend DTOs exactly.
 * Source: com.virtualchemistrylab.dto.*
 */

// ─── Enums ──────────────────────────────────────────────────────────

export type EffectType =
  | "NONE"
  | "GAS_BUBBLE"
  | "PRECIPITATE"
  | "COLOR_CHANGE"
  | "HEAT"
  | "EXPLOSION";

export type ProductState = "AQUEOUS" | "LIQUID" | "GAS" | "SOLID";

export type PredictionSource =
  | "AI_PREDICTION"
  | "API_PREDICTION"
  | "CACHE"
  | "MOCK";

// ─── Mix Endpoint ───────────────────────────────────────────────────

export interface VesselContent {
  inputName: string;
  formula: string;
  amountMl?: number;
}

export interface MixRequest {
  sessionCode: string;
  sourceVesselId: string;
  targetVesselId: string;
  sourceContents: VesselContent[];
  targetContents: VesselContent[];
  temperature?: number;
  pressure?: number;
  catalyst?: string;
}

export interface ReactionResult {
  hasReaction: boolean;
  equation?: string;
  productFormula?: string;
  effectType?: EffectType;
  effectColor?: string;
  gasFormula?: string;
  precipitateFormula?: string;
  precipitateColor?: string;
  messageVi?: string;
  explanationVi?: string;
  safetyNoteVi?: string;
  confidence?: number;
  basicExplanation?: string;
  intermediateExplanation?: string;
  advancedExplanation?: string;
}

export interface ProductEntry {
  formula: string;
  state: ProductState;
}

export interface GasEntry {
  formula: string;
}

export interface NewVesselState {
  vesselId: string;
  displayColor?: string;
  contents?: ProductEntry[];
  releasedGas?: GasEntry;
}

export interface MixResponse {
  status: string;
  source?: PredictionSource;
  cached?: boolean;
  confidence?: number;
  result?: ReactionResult;
  newTargetVesselState?: NewVesselState;
}

// ─── Chemical Resolve ───────────────────────────────────────────────

export interface ChemicalInfo {
  input: string;
  canonicalFormula?: string;
  canonicalName?: string;
  smiles?: string;
  inchi?: string;
  inchiKey?: string;
  source?: string;
}

export interface ChemicalResolveResponse {
  status: string;
  cached: boolean;
  data: ChemicalInfo;
}

// ─── AI Ask ─────────────────────────────────────────────────────────

export interface AiAskRequest {
  sessionCode: string;
  reactionContext?: Record<string, string>;
  question: string;
}

export interface AiAskResponse {
  status: string;
  answerVi: string;
}

// ─── AI Chat (multi-turn) ───────────────────────────────────────────

export type ChatRole = "user" | "model";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AiChatRequest {
  sessionCode: string;
  reactionContext?: Record<string, string>;
  messages: ChatMessage[];
}

export interface AiChatResponse {
  status: string;
  answerVi: string;
}

// ─── Generic API Response ───────────────────────────────────────────

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}
