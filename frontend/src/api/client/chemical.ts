import { get } from "./http";
import type { ChemicalResolveResponse } from "@/types/api";

/** GET /api/chemicals/resolve?query= — Resolve a chemical name/formula */
export function resolveChemical(
  query: string,
): Promise<ChemicalResolveResponse> {
  return get<ChemicalResolveResponse>(
    `/api/chemicals/resolve?query=${encodeURIComponent(query)}`,
  );
}
