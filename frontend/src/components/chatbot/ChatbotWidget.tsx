"use client";

import { useState, useEffect } from "react";
import { ChatPanel } from "@/components/chatbot/ChatPanel";

export function ChatbotWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return <ChatPanel />;
}
