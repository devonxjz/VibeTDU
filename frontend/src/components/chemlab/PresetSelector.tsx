"use client";

import { useLabStore } from "@/stores/lab-store";
import { CATEGORY_GROUPS } from "@/constants/chemicals";
import { ClayPill, ClaySectionCard } from "@/components/ui/clay-primitives";

const PRESETS = [
  { name: "Trung hoà", desc: "Phản ứng acid-base", icon: "🧪", chemicals: ["hcl", "naoh"] },
  { name: "Kết tủa trắng", desc: "Tạo AgCl trắng", icon: "⬇️", chemicals: ["agno3", "nacl"] },
  { name: "Sinh khí H₂", desc: "Giải phóng khí H₂", icon: "🫧", chemicals: ["hcl", "zn"] },
  { name: "Kết tủa xanh", desc: "Cu(OH)₂ xanh", icon: "🔵", chemicals: ["cuso4", "naoh"] },
  { name: "Đổi màu tím", desc: "Màu tím đặc trưng", icon: "🟣", chemicals: ["h2so4", "kmno4"] },
];

function getChemicalById(id: string) {
  for (const group of CATEGORY_GROUPS) {
    const chem = group.chemicals.find((chemical) => chemical.id === id);
    if (chem) return chem;
  }
  return null;
}

export function PresetSelector() {
  const clearBeaker = useLabStore((state) => state.clearBeaker);
  const addToBeaker = useLabStore((state) => state.addToBeaker);

  const handleLoadPreset = (chemicalIds: string[]) => {
    clearBeaker();

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
    <ClaySectionCard className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="clay-caption-uppercase text-clay-muted">Thí nghiệm nhanh</div>
          <div className="clay-body-sm text-clay-muted">Tải tổ hợp mẫu để thử ngay</div>
        </div>
        <ClayPill tone="neutral">{PRESETS.length} preset</ClayPill>
      </div>
      <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleLoadPreset(preset.chemicals)}
            className="min-w-[160px] shrink-0 rounded-[var(--clay-rounded-lg)] border border-clay-hairline bg-clay-canvas px-3 py-3 text-left transition-colors hover:bg-clay-surface-soft"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg leading-none">{preset.icon}</span>
              <span className="clay-title-sm text-clay-ink">{preset.name}</span>
            </div>
            <div className="clay-body-sm text-clay-muted">{preset.desc}</div>
          </button>
        ))}
      </div>
    </ClaySectionCard>
  );
}
