"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useChatbotStore } from "@/stores/chatbot-store";

type Props = {
  constraintsRef: RefObject<HTMLDivElement | null>;
};

export function ChatbotLauncher({ constraintsRef }: Props) {
  const pos = useChatbotStore((s) => s.position);
  const setPosition = useChatbotStore((s) => s.setPosition);
  const togglePanel = useChatbotStore((s) => s.togglePanel);

  useEffect(() => {
    if (pos === null) {
      setPosition({ x: window.innerWidth - 88, y: window.innerHeight - 88 });
    }
  }, [pos, setPosition]);

  if (pos === null) {
    return (
      <button
        type="button"
        onClick={togglePanel}
        className="pointer-events-auto fixed bottom-6 right-6 z-[60] grid h-14 w-14 place-items-center rounded-2xl border border-mint/25 bg-card/70 text-navy shadow-[var(--shadow-card)] backdrop-blur-xl transition hover:border-mint/40"
        aria-label="Hỏi trợ lý hoá học"
        title="Hỏi trợ lý hoá học"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraintsRef}
      onPointerDown={(e) => e.stopPropagation()}
      onDragEnd={(_, info) => {
        setPosition({ x: info.point.x - 28, y: info.point.y - 28 });
      }}
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 60 }}
      onClick={togglePanel}
      className="pointer-events-auto grid h-14 w-14 place-items-center rounded-2xl border border-mint/25 bg-card/70 text-navy shadow-[var(--shadow-card)] backdrop-blur-xl transition hover:border-mint/40 active:scale-[0.98]"
      aria-label="Hỏi trợ lý hoá học"
      title="Hỏi trợ lý hoá học"
    >
      <Sparkles className="h-6 w-6" />
    </motion.button>
  );
}

