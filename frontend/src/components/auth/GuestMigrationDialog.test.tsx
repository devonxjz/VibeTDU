import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GuestMigrationDialog } from "./GuestMigrationDialog";
import { useAuth } from "@/hooks/useAuth";
import { useLabStore } from "@/stores/lab-store";
import { saveJournal } from "@/api/client/journal";

vi.mock("@/hooks/useAuth");
vi.mock("@/stores/lab-store");
vi.mock("@/api/client/journal");

describe("GuestMigrationDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock the lab store clear/dismiss methods
    (useLabStore as any).mockReturnValue({
      clearGuestExperiment: vi.fn(),
      setGuestExperimentDismissed: vi.fn(),
    });
  });

  it("should not render if user is not logged in", () => {
    (useAuth as any).mockReturnValue({ isLoggedIn: false, isLoading: false });
    localStorage.setItem("guestExperiment", '{"version": 1}');
    
    render(<GuestMigrationDialog />);
    expect(screen.queryByText(/Bạn có muốn lưu/i)).toBeNull();
  });

  it("should not render if there is no guestExperiment", () => {
    (useAuth as any).mockReturnValue({ isLoggedIn: true, isLoading: false });
    
    render(<GuestMigrationDialog />);
    expect(screen.queryByText(/Bạn có muốn lưu/i)).toBeNull();
  });

  it("should not render if guestExperimentDismissed is true", () => {
    (useAuth as any).mockReturnValue({ isLoggedIn: true, isLoading: false });
    localStorage.setItem("guestExperiment", '{"version": 1}');
    localStorage.setItem("guestExperimentDismissed", "true");
    
    render(<GuestMigrationDialog />);
    expect(screen.queryByText(/Bạn có muốn lưu/i)).toBeNull();
  });

  it("should render dialog if user is logged in and guestExperiment exists", () => {
    (useAuth as any).mockReturnValue({ isLoggedIn: true, isLoading: false });
    localStorage.setItem("guestExperiment", '{"version": 1}');
    
    render(<GuestMigrationDialog />);
    expect(screen.getByText(/Bạn có muốn lưu/i)).toBeInTheDocument();
  });

  it("should handle dismiss action", async () => {
    (useAuth as any).mockReturnValue({ isLoggedIn: true, isLoading: false });
    localStorage.setItem("guestExperiment", '{"version": 1}');
    
    const setDismissedMock = vi.fn();
    (useLabStore as any).mockReturnValue({
      clearGuestExperiment: vi.fn(),
      setGuestExperimentDismissed: setDismissedMock,
    });
    
    render(<GuestMigrationDialog />);
    
    const dismissBtn = screen.getByText("Không");
    fireEvent.click(dismissBtn);
    
    await waitFor(() => {
      expect(setDismissedMock).toHaveBeenCalledWith(true);
      expect(screen.queryByText(/Bạn có muốn lưu/i)).toBeNull();
    });
  });
});
