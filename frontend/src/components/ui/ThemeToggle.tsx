"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400">
        <div className="h-[18px] w-[18px]" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Chuyển giao diện (Sáng/Tối)"
      className={cn(
        "group relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.04]",
        "text-toolbar-muted hover:bg-control-bg hover:text-toolbar-foreground"
      )}
      aria-label="Chuyển theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
