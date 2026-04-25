import { get, post } from "./http";
import type {
  MixRequest,
  MixResponse,
  ApiResponse,
} from "@/types/api";

/** POST /api/lab/mix — Mix two vessels and get reaction result */
export function mixChemicals(request: MixRequest): Promise<MixResponse> {
  return post<MixResponse>("/api/lab/mix", request);
}

/** GET /api/session/{code}/logs — Fetch experiment logs for a session */
export function getSessionLogs<T>(sessionCode: string): Promise<ApiResponse<T[]>> {
  return get<ApiResponse<T[]>>(`/api/session/${sessionCode}/logs`);
}

/** POST /api/session/reset — Reset an experiment session */
export function resetSession(sessionCode: string): Promise<ApiResponse<void>> {
  return post<ApiResponse<void>>("/api/session/reset", { sessionCode });
}

/** GET /api/health — Health check */
export function healthCheck(): Promise<{ status: string; service: string }> {
  return get("/api/health");
}
