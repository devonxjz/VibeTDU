"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AiChatRequest, ChatMessage, ReactionResult } from "@/types/api";
import { chatAi } from "@/api/client/ai";
import { useLabStore } from "@/stores/lab-store";

const MAX_PERSISTED_MESSAGES = 50;

export type ChatbotPosition = { x: number; y: number } | null;

interface ChatbotStore {
  isOpen: boolean;
  position: ChatbotPosition;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  cooldownUntil: number;

  togglePanel: () => void;
  closePanel: () => void;
  setPosition: (pos: ChatbotPosition) => void;

  clearMessages: () => void;
  retryLast: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

function buildReactionContext(labState: ReturnType<typeof useLabStore.getState>): Record<string, string> | undefined {
  const ctx: Record<string, string> = {};
  
  if (labState.lastReaction) {
    if (labState.lastReaction.equation) ctx.equation = labState.lastReaction.equation;
    if (labState.lastReaction.productFormula) ctx.productFormula = labState.lastReaction.productFormula;
    if (labState.lastReaction.messageVi) ctx.messageVi = labState.lastReaction.messageVi;
    if (labState.lastReaction.safetyNoteVi) ctx.safetyNoteVi = labState.lastReaction.safetyNoteVi;
  }

  // Environment variables
  ctx["Nhiệt độ"] = `${labState.temperature} °C`;
  ctx["Áp suất"] = `${labState.pressure} atm`;
  ctx["Xúc tác"] = labState.catalyst || "Không";

  return Object.keys(ctx).length ? ctx : undefined;
}

function now() {
  return Date.now();
}

export const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      position: null,
      messages: [],
      isLoading: false,
      error: null,
      cooldownUntil: 0,

      togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
      closePanel: () => set({ isOpen: false }),
      setPosition: (pos) => set({ position: pos }),

      clearMessages: () => set({ messages: [], error: null }),

      retryLast: async () => {
        const state = get();
        for (let i = state.messages.length - 1; i >= 0; i -= 1) {
          const m = state.messages[i];
          if (m?.role === "user") {
            await state.sendMessage(m.content);
            return;
          }
        }
      },

      sendMessage: async (text) => {
        const state = get();
        const trimmed = text.trim();
        if (!trimmed) return;
        if (state.isLoading) return;
        if (now() < state.cooldownUntil) return;

        const lab = useLabStore.getState();
        const sessionCode = lab.sessionCode;
        const reactionContext = buildReactionContext(lab);

        const nextMessages: ChatMessage[] = [...state.messages, { role: "user", content: trimmed }];

        set({
          messages: nextMessages,
          isLoading: true,
          error: null,
        });

        try {
          const req: AiChatRequest = {
            sessionCode,
            reactionContext,
            messages: nextMessages,
          };

          const res = await chatAi(req);
          set((s) => ({
            messages: [...s.messages, { role: "model", content: res.answerVi }],
            isLoading: false,
            error: null,
            cooldownUntil: now() + 1500,
          }));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Lỗi không xác định";
          set({
            isLoading: false,
            error: msg,
            cooldownUntil: now() + 1500,
          });
        }
      },
    }),
    {
      name: "chatbot:v1",
      partialize: (s) => ({
        position: s.position,
      }),
    },
  ),
);

