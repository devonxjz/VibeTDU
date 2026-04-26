import { post } from "./http";
import type { AiAskRequest, AiAskResponse, AiChatRequest, AiChatResponse } from "@/types/api";

/** POST /api/ai/ask — Ask AI a chemistry question */
export function askAi(request: AiAskRequest): Promise<AiAskResponse> {
  return post<AiAskResponse>("/api/ai/ask", request);
}

/** POST /api/ai/chat — Multi-turn chat */
export function chatAi(request: AiChatRequest): Promise<AiChatResponse> {
  return post<AiChatResponse>("/api/ai/chat", request);
}
