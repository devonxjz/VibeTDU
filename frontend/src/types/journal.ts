import type { VesselContent, ReactionResult } from "./api";

/**
 * The structure of the experiment data stored in the database.
 * This is saved as a JSON string and parsed back to display in the Lab Journal.
 */
export interface ExperimentData {
  version: 1;
  timestamp: string;
  contents: VesselContent[];
  reaction: ReactionResult | null;
}

export interface JournalSummary {
  id: string;
  title: string;
  createdAt: string;
  experimentData: string; // JSON string of ExperimentData
}

export interface JournalEntry {
  id: string;
  title: string;
  createdAt: string;
  experimentData: ExperimentData;
}
