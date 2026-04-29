"use client";

import { useLabStore } from "@/stores/lab-store";
import { CATEGORY_GROUPS } from "@/constants/chemicals";

const PRESETS = [
  { name: "Trung hoà", desc: "Phản ứng acid-base", icon: "🧪", chemicals: ["hcl", "naoh"] },
  { name: "Kết tủa trắng", desc: "Tạo AgCl↓ trắng", icon: "⬇️", chemicals: ["agno3", "nacl"] },
  { name: "Sinh khí H₂", desc: "Giải phóng khí H₂", icon: "🫧", chemicals: ["hcl", "zn"] },
  { name: "Kết tủa xanh", desc: "Cu(OH)₂↓ xanh", icon: "🔵", chemicals: ["cuso4", "naoh"] },
  { name: "Đổi màu tím", desc: "Màu tím đặc trưng", icon: "🟣", chemicals: ["h2so4", "kmno4"] },
];

function getChemicalById(id: string) {
  for (const group of CATEGORY_GROUPS) {
    const chem = group.chemicals.find((c) => c.id === id);
    if (chem) return chem;
  }
  return null;
}

export function PresetSelector() {
  const resetBoard = useLabStore((s) => s.resetBoard);
  const initCenterBeaker = useLabStore((s) => s.initCenterBeaker);
  const addChemicalToVessel = useLabStore((s) => s.addChemicalToVessel);

  const handleLoadPreset = async (chemicalIds: string[]) => {
    // 1. Clear board (await to ensure it's fully cleared)
    await resetBoard();

    // 2. Create beaker after 200ms
    setTimeout(() => {
      const beakerId = initCenterBeaker();

      // 3. Add first chemical after 400ms (200ms relative to beaker creation)
      setTimeout(() => {
        const chem1 = getChemicalById(chemicalIds[0]);
        if (chem1) {
          addChemicalToVessel(
            {
              inputName: chem1.name,
              formula: chem1.formula,
              amountMl: 10,
              category: chem1.category,
              chemicalId: chem1.id,
            },
            beakerId,
          );
        }
      }, 200);

      // 4. Add second chemical after 700ms (500ms relative to beaker creation)
      if (chemicalIds[1]) {
        setTimeout(() => {
          const chem2 = getChemicalById(chemicalIds[1]);
          if (chem2) {
            addChemicalToVessel(
              {
                inputName: chem2.name,
                formula: chem2.formula,
                amountMl: 10,
                category: chem2.category,
                chemicalId: chem2.id,
              },
              beakerId,
            );
          }
        }, 500);
      }
    }, 200);
  };

  return (
    <section className="px-4 py-3">
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
        Thí nghiệm nhanh
      </h3>
      <div className="thin-scroll flex gap-2 overflow-x-auto pb-2">
        {PRESETS.map((preset, i) => (
          <button
            key={i}
            onClick={() => handleLoadPreset(preset.chemicals)}
            className="flex min-w-[120px] flex-col items-start gap-1 rounded-xl border border-border bg-card/50 p-2.5 text-left transition-all hover:bg-mint-soft/30 hover:border-mint/30"
          >
            <span className="text-base">{preset.icon}</span>
            <span className="text-[11px] font-bold text-navy">{preset.name}</span>
            <span className="text-[10px] text-navy-soft">{preset.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
