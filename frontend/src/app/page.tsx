"use client";

import { ChemLabShell } from "@/components/chemlab/ChemLabShell";
import { WelcomeModal } from "@/components/WelcomeModal";

export default function ChemLabPage() {
  return (
    <>
      <WelcomeModal />
      <ChemLabShell />
    </>
  );
}
