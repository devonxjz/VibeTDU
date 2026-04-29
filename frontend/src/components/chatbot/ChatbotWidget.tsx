"use client";

import { useState, useEffect } from "react";
import { ChatPanel } from "@/components/chatbot/ChatPanel";

export function ChatbotWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ChatPanel />;
}
