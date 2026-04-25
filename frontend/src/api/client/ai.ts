import { post } from "./http";
import type { AiAskRequest, AiAskResponse } from "@/types/api";

/** POST /api/ai/ask — Ask AI a chemistry question */
export function askAi(request: AiAskRequest): Promise<AiAskResponse> {
  return post<AiAskResponse>("/api/ai/ask", request);
}
