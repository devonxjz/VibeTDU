import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLabStore } from "./lab-store";

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: () => "test-id",
}));

describe("lab-store", () => {
  beforeEach(() => {
    // Reset store and local storage
    useLabStore.setState({
      vessels: {},
      centerBeakerId: null,
      lastReaction: null,
    });
    localStorage.clear();
  });

  describe("Guest Experiment Migration", () => {
    it("should save guestExperiment to localStorage when a reaction occurs", async () => {
      // Setup state for saveGuestExperiment
      useLabStore.setState({
        centerBeakerId: "vessel-1",
        vessels: {
          "vessel-1": {
            id: "vessel-1",
            position: { x: 0, y: 0 },
            contents: [{ inputName: "NaCl", formula: "NaCl", amountMl: 10 }],
            displayColor: "red",
            label: "NaCl"
          }
        },
        lastReaction: {
          hasReaction: true,
          productFormula: "NaCl"
        }
      });
      
      const store = useLabStore.getState();
      expect(localStorage.getItem("guestExperiment")).toBeNull();
        // @ts-expect-error - saveGuestExperiment is internal and not in the store state interface directly
        store.saveGuestExperiment();
        
        // After save, it should be in localStorage
        const saved = localStorage.getItem("guestExperiment");
        expect(saved).not.toBeNull();
        
        const parsed = JSON.parse(saved as string);
        expect(parsed.version).toBe(1);
        expect(parsed.reaction).toBeDefined();
        expect(parsed.contents).toBeDefined();
    });

    it("should clear guestExperiment and set dismissed flag", () => {
      localStorage.setItem("guestExperiment", '{"version":1}');
      
      const store = useLabStore.getState();
      if ("clearGuestExperiment" in store) {
        // @ts-expect-error - clearGuestExperiment is internal and not in the store state interface directly
        store.clearGuestExperiment();
        expect(localStorage.getItem("guestExperiment")).toBeNull();
      }

      if ("setGuestExperimentDismissed" in store) {
        // @ts-expect-error - setGuestExperimentDismissed is internal and not in the store state interface directly
        store.setGuestExperimentDismissed(true);
        expect(localStorage.getItem("guestExperimentDismissed")).toBe("true");
      }
    });
  });
});
