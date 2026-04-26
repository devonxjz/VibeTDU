"use client";

import { Formula } from "@/components/chemlab/Formula";
import type { ChatMessage } from "@/types/api";
import { cn } from "@/utils/cn";

function isLikelyFormula(text: string) {
  return /^[A-Za-z0-9()+·.\s→↑↓=-]+$/.test(text) && /[A-Za-z]/.test(text);
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const base =
    "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          base,
          isUser
            ? "bg-mint/20 text-navy border border-mint/25"
            : "bg-card/75 text-navy border border-white/10 backdrop-blur-xl",
        )}
      >
        {message.content.split("\n").map((line, idx) => (
          <div key={idx} className={idx === 0 ? "" : "mt-1"}>
            {isLikelyFormula(line) ? (
              <Formula formula={line} className="text-navy" />
            ) : (
              <span className="whitespace-pre-wrap">{line}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

