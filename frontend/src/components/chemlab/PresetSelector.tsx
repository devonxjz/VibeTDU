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
  const clearBeaker = useLabStore((s) => s.clearBeaker);
  const addToBeaker = useLabStore((s) => s.addToBeaker);

  const handleLoadPreset = (chemicalIds: string[]) => {
    // 1. Clear beaker
    clearBeaker();

    // 2. Add first chemical after 200ms
    setTimeout(() => {
      const chem1 = getChemicalById(chemicalIds[0]);
      if (chem1) {
        addToBeaker({
          name: chem1.name,
          formula: chem1.formula,
          category: chem1.category,
          chemicalId: chem1.id,
        });
      }

      // 3. Add second chemical after another 300ms (total 500ms)
      if (chemicalIds[1]) {
        setTimeout(() => {
          const chem2 = getChemicalById(chemicalIds[1]);
          if (chem2) {
            addToBeaker({
              name: chem2.name,
              formula: chem2.formula,
              category: chem2.category,
              chemicalId: chem2.id,
            });
          }
        }, 300);
      }
    }, 200);
  };

  return (
    <section className="px-4 py-3 border-b border-white/5 bg-transparent">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Thí nghiệm nhanh
        </h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {PRESETS.map((preset, i) => (
          <button
            key={i}
            onClick={() => handleLoadPreset(preset.chemicals)}
            className="flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap rounded-lg bg-[#3C3C3C]/60 text-xs font-semibold text-[#E0E0E0] transition-colors hover:bg-[#4C4C4C]/80"
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
