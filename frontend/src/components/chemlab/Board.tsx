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
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/90 px-5 py-3 shadow-xl backdrop-blur-sm border border-white/60">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">
              Đang mô phỏng phản ứng…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
