"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLabStore } from "@/stores/lab-store";
import { VesselComponent } from "./Vessel";
import { ReactionEffect } from "./effects/ReactionEffect";
import { LabWorkbench } from "./scene/LabWorkbench";
import { BeakerHero } from "./scene/BeakerHero";
import { ReactionResultCard } from "./scene/ReactionResultCard";

/* ─── Board — Main Canvas ────────────────────────────────────────────── */

export function Board() {
  const vessels = useLabStore((s) => s.vessels);
  const activeEffect = useLabStore((s) => s.activeEffect);
  const isLoading = useLabStore((s) => s.isLoading);
  const selectVessel = useLabStore((s) => s.selectVessel);
  const centerBeakerId = useLabStore((s) => s.centerBeakerId);
  const initCenterBeaker = useLabStore((s) => s.initCenterBeaker);
  const vesselList = Object.values(vessels);

  /* Initialize an empty center beaker on first mount */
  const hasInit = useRef(false);
  useEffect(() => {
    if (!hasInit.current && centerBeakerId === null) {
      hasInit.current = true;
      initCenterBeaker(); // creates vessel with contents: [] — beaker starts empty
    }
  }, [centerBeakerId, initCenterBeaker]);

  return (
    /* Fill the center column completely */
    <div
      className={`relative h-full w-full overflow-hidden transition-colors duration-200`}
      onClick={() => selectVessel(null)}
    >
      {/* ── Modern workbench (no shelves) */}
      <LabWorkbench>
        {/* BeakerHero — center of the workbench */}
        <BeakerHero vesselId={centerBeakerId} />
      </LabWorkbench>

      {/* ── Free-floating vessels (non-center) */}
      <AnimatePresence>
        {vesselList
          .filter((v) => v.id !== centerBeakerId)
          .map((vessel) => (
            <VesselComponent key={vessel.id} vessel={vessel} />
          ))}
      </AnimatePresence>



      {/* ── Reaction Effect overlay */}
      <ReactionEffect effect={activeEffect} />

      {/* ── Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center"
          style={{ background: "rgba(6,13,26,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="flex items-center gap-2.5 rounded-2xl px-5 py-3"
            style={{
              background: "rgba(30,41,59,0.9)",
              border: "1px solid rgba(34,211,238,0.2)",
              boxShadow: "0 0 24px rgba(34,211,238,0.1), 0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#22d3ee" }} />
            <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
              Đang mô phỏng phản ứng…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
