"use client";

import { ChemLabShell } from "@/components/chemlab/ChemLabShell";
import { AuthGate } from "@/components/auth/AuthGate";

export default function ChemLabPage() {
  return (
    <AuthGate>
      <ChemLabShell />
    </AuthGate>
  );
}
