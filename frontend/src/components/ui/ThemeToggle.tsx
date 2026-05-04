"use client";

import { Sun, Moon } from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { ClayActionButton } from "@/components/ui/clay-primitives";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ClayActionButton
      variant="secondary"
      size="icon"
      onClick={toggleTheme}
      title="Chuyển giao diện"
      aria-label="Chuyển giao diện"
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" />
      ) : (
        <Moon className="h-4.5 w-4.5" />
      )}
    </ClayActionButton>
  );
}
