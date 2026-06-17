import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WelcomeModal } from "@/components/WelcomeModal";
import { ReactionResultCard } from "@/components/chemlab/scene/ReactionResultCard";
import { Toolbar } from "@/components/chemlab/Toolbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { useLabStore } from "@/stores/lab-store";

function withoutWindow(assertion: () => void) {
  const currentWindow = globalThis.window;
  vi.stubGlobal("window", undefined);
  try {
    assertion();
  } finally {
    vi.stubGlobal("window", currentWindow);
  }
}

describe("hydration regressions", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    useLabStore.setState({
      vessels: {},
      centerBeakerId: null,
      lastReaction: null,
      appliedConditions: null,
    });
    localStorage.clear();
  });

  it("server-renders WelcomeModal without reading browser-only globals", () => {
    withoutWindow(() => {
      expect(renderToString(<WelcomeModal />)).toBe("");
    });
  });

  it("server-renders Toolbar without reading browser-only globals", () => {
    withoutWindow(() => {
      expect(() =>
        renderToString(
          <ThemeProvider>
            <Toolbar />
          </ThemeProvider>,
        ),
      ).not.toThrow();
    });
  });

  it("uses deterministic sidebar skeleton width", () => {
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not run during render");
    });

    const { container } = render(<SidebarMenuSkeleton showIcon />);
    const textSkeleton = container.querySelector('[data-sidebar="menu-skeleton-text"]');

    expect(textSkeleton?.getAttribute("style")).toContain("--skeleton-width: 70%");
    expect(random).not.toHaveBeenCalled();
  });

  it("defers ReactionResultCard reset state without throwing during render", () => {
    vi.useFakeTimers();
    useLabStore.setState({
      lastReaction: {
        hasReaction: false,
        effectType: "NONE",
        messageVi: "Khong co phan ung",
      },
    });

    expect(() => {
      render(<ReactionResultCard />);
      act(() => {
        vi.runOnlyPendingTimers();
      });
    }).not.toThrow();
  });
});
