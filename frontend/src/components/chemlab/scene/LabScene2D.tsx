"use client";

import { useDraggable } from "@dnd-kit/core";
import { ChemicalBottle2D, type BottleCategory } from "./ChemicalBottle2D";
import { LabEquipment2D } from "./LabEquipment2D";

/* ─── Category shelf data ──────────────────────────────────────────── */

interface ShelfBottle {
  formula: string;
  /** ASCII id key matching CHEMICAL_COLORS (e.g. "h2so4") */
  chemicalId: string;
  name: string;
  size?: "large" | "medium" | "small" | "flask" | "tube";
  rotate?: number;
  yOffset?: number;
}

interface ShelfGroup {
  category: BottleCategory;
  label: string;
  emoji: string;
  bottles: ShelfBottle[];
}

const TOP_SHELF_GROUPS: ShelfGroup[] = [
  {
    category: "acid",
    label: "Acids",
    emoji: "🧪",
    bottles: [
      { formula: "HCl",   chemicalId: "hcl",   name: "Axit clohidric",  size: "large",  rotate: -2, yOffset: 2 },
      { formula: "H₂SO₄", chemicalId: "h2so4", name: "Axit sunfuric",   size: "medium", rotate: 1,  yOffset: 0 },
      { formula: "HNO₃",  chemicalId: "hno3",  name: "Axit nitric",     size: "flask",  rotate: -1, yOffset: 4 },
    ],
  },
  {
    category: "base",
    label: "Bases",
    emoji: "🧂",
    bottles: [
      { formula: "NaOH", chemicalId: "naoh", name: "Natri hidroxit", size: "large",  rotate: 1,  yOffset: 0 },
      { formula: "KOH",  chemicalId: "koh",  name: "Kali hidroxit",  size: "medium", rotate: -2, yOffset: 3 },
      { formula: "NH₃",  chemicalId: "nh3",  name: "Amoniac",        size: "small",  rotate: 2,  yOffset: 1 },
    ],
  },
  {
    category: "salt",
    label: "Salts",
    emoji: "💎",
    bottles: [
      { formula: "NaCl",  chemicalId: "nacl",  name: "Natri clorua",    size: "medium", rotate: -1, yOffset: 2 },
      { formula: "CuSO₄", chemicalId: "cuso4", name: "Đồng(II) sunfat", size: "large",  rotate: 2,  yOffset: 0 },
      { formula: "AgNO₃", chemicalId: "agno3", name: "Bạc nitrat",      size: "small",  rotate: -2, yOffset: 4 },
    ],
  },
  {
    category: "metal",
    label: "Metals",
    emoji: "⚙️",
    bottles: [
      { formula: "Fe",  chemicalId: "fe", name: "Sắt",  size: "medium", rotate: 1,  yOffset: 1 },
      { formula: "Cu",  chemicalId: "cu", name: "Đồng", size: "small",  rotate: -1, yOffset: 3 },
      { formula: "Zn",  chemicalId: "zn", name: "Kẽm",  size: "flask",  rotate: 2,  yOffset: 0 },
    ],
  },
  {
    category: "indicator",
    label: "Indicators",
    emoji: "🌡️",
    bottles: [
      { formula: "pH",  chemicalId: "ph",  name: "Chỉ thị pH", size: "flask", rotate: -2, yOffset: 2 },
      { formula: "BTB", chemicalId: "btb", name: "Bromothymol blue", size: "small", rotate: 1, yOffset: 4 },
    ],
  },
  {
    category: "organic",
    label: "Organic",
    emoji: "🧬",
    bottles: [
      { formula: "C₂H₅OH", chemicalId: "c2h5oh", name: "Etanol",  size: "large",  rotate: -1, yOffset: 0 },
      { formula: "C₆H₆",   chemicalId: "c6h6",   name: "Benzen",  size: "medium", rotate: 2,  yOffset: 3 },
      { formula: "CH₃OH",  chemicalId: "ch3oh",  name: "Metanol", size: "small",  rotate: -2, yOffset: 1 },
    ],
  },
  {
    category: "gas",
    label: "Gases",
    emoji: "🌫️",
    bottles: [
      { formula: "O₂",  chemicalId: "o2",  name: "Oxi",   size: "flask", rotate: 1,  yOffset: 2 },
      { formula: "Cl₂", chemicalId: "cl2", name: "Clo",   size: "small", rotate: -1, yOffset: 4 },
      { formula: "N₂",  chemicalId: "n2",  name: "Nitơ",  size: "tube",  rotate: 2,  yOffset: 0 },
    ],
  },
];

const BOTTOM_SHELF_GROUPS: ShelfGroup[] = [
  {
    category: "acid",
    label: "Misc",
    emoji: "🔬",
    bottles: [
      { formula: "H₂S",   chemicalId: "h2s",  name: "Axit sunfuhidric", size: "small",  rotate: -1, yOffset: 2 },
      { formula: "HBr",   chemicalId: "hbr",  name: "Axit bromhidric",  size: "medium", rotate: 2,  yOffset: 0 },
      { formula: "H₃PO₄", chemicalId: "h3po4",name: "Axit photphoric",  size: "flask",  rotate: -2, yOffset: 3 },
    ],
  },
  {
    category: "salt",
    label: "More Salts",
    emoji: "🧊",
    bottles: [
      { formula: "KMnO₄",   chemicalId: "kmno4",  name: "Kali permanganat", size: "large",  rotate: 1,  yOffset: 0 },
      { formula: "K₂Cr₂O₇", chemicalId: "k2cr2o7",name: "Kali đicromat",   size: "medium", rotate: -1, yOffset: 2 },
      { formula: "FeCl₃",   chemicalId: "fecl3",  name: "Sắt(III) clorua", size: "small",  rotate: 2,  yOffset: 4 },
    ],
  },
  {
    category: "organic",
    label: "More Org",
    emoji: "🌿",
    bottles: [
      { formula: "C₆H₁₂O₆", chemicalId: "c6h12o6", name: "Glucozơ",  size: "large",  rotate: -2, yOffset: 1 },
      { formula: "C₃H₈O₃",  chemicalId: "c3h8o3",  name: "Glixerol", size: "medium", rotate: 1,  yOffset: 3 },
    ],
  },
  {
    category: "gas",
    label: "More Gas",
    emoji: "💨",
    bottles: [
      { formula: "CO₂", chemicalId: "co2", name: "Cacbon dioxit", size: "flask", rotate: -1, yOffset: 2 },
      { formula: "H₂",  chemicalId: "h2",  name: "Hidro",         size: "small", rotate: 2,  yOffset: 0 },
      { formula: "Ar",  chemicalId: "ar",  name: "Argon",         size: "tube",  rotate: -2, yOffset: 4 },
    ],
  },
];

/* ─── Draggable Shelf Bottle ────────────────────────────────────────── */

function DraggableShelfBottle({ bottle, category }: { bottle: ShelfBottle; category: BottleCategory }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `shelf-${bottle.chemicalId}`,
    data: {
      type: "chemical",
      name: bottle.name,
      formula: bottle.formula,
      category: category as string,
      chemicalId: bottle.chemicalId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1, cursor: "grab", touchAction: "none" }}
      title={`Kéo ${bottle.name} vào bình phản ứng`}
    >
      <ChemicalBottle2D
        formula={bottle.formula}
        category={category}
        size={bottle.size ?? "medium"}
        rotate={bottle.rotate}
        yOffset={bottle.yOffset}
      />
    </div>
  );
}

/* ─── Safety Poster ─────────────────────────────────────────────────── */

function SafetyPoster() {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{ top: "2%", left: "1.5%", zIndex: 4, filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.16))" }}
      aria-label="Poster an toàn phòng thí nghiệm"
    >
      <svg width="72" height="90" viewBox="0 0 78 98" fill="none">
        <rect x="2" y="2" width="74" height="94" rx="3" fill="#FFF9C4" />
        <rect x="2" y="2" width="5" height="94" rx="3" fill="#F9A825" />
        <circle cx="39" cy="5" r="4" fill="#D32F2F" />
        <circle cx="39" cy="5" r="2" fill="#EF5350" />
        <text x="39" y="22" textAnchor="middle" fontSize="10" fontWeight="800" fill="#E65100" fontFamily="system-ui, sans-serif">Be Safe!</text>
        {["✓ Wear goggles","✓ Use gloves","✓ No eating","✓ Label all","✓ Read first"].map((rule, i) => (
          <text key={i} x="11" y={36 + i * 12} fontSize="8" fill="#5D4037" fontFamily="system-ui, sans-serif" fontWeight="500">{rule}</text>
        ))}
        <rect x="2" y="2" width="74" height="94" rx="3" fill="none" stroke="#F9A825" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ─── Wooden Shelf ──────────────────────────────────────────────────── */

function WoodenShelf({ groups, top, height }: { groups: ShelfGroup[]; top: string; height: number }) {
  return (
    <div
      className="absolute left-[3%] right-[3%]"
      style={{ top, height, zIndex: 2 }}
      aria-label="Kệ hóa chất"
    >
      {/* Category labels */}
      <div className="absolute -top-5 left-0 right-0 flex justify-around px-2">
        {groups.map((g) => (
          <span key={g.category} className={`cat-badge cat-badge-${g.category}`}>
            {g.emoji} {g.label}
          </span>
        ))}
      </div>

      {/* Bottles row — draggable */}
      <div className="absolute bottom-[28px] left-0 right-0 flex items-end justify-around px-2">
        {groups.map((g) => (
          <div key={g.category} className="flex items-end gap-1">
            {g.bottles.map((b) => (
              <DraggableShelfBottle key={b.chemicalId} bottle={b} category={g.category} />
            ))}
          </div>
        ))}
      </div>

      {/* Shelf wood */}
      <div className="shelf-2d-top absolute bottom-[16px] left-0 right-0" />
      <div className="shelf-2d-front absolute bottom-0 left-0 right-0" />
      <div className="shelf-2d-shadow absolute -bottom-[10px] left-2 right-2" />

      {/* Brackets */}
      <div className="shelf-2d-bracket absolute bottom-0" style={{ left: 8, height: height * 0.6 }} />
      <div className="shelf-2d-bracket absolute bottom-0" style={{ right: 8, height: height * 0.6 }} />
    </div>
  );
}

/* ─── Main LabScene2D ───────────────────────────────────────────────── */

interface LabScene2DProps {
  children?: React.ReactNode;
}

export function LabScene2D({ children }: LabScene2DProps) {
  return (
    <div className="lab-scene-2d absolute inset-0 overflow-hidden" aria-label="Phòng thí nghiệm ảo">
      <SafetyPoster />

      {/* Top shelf */}
      <WoodenShelf groups={TOP_SHELF_GROUPS} top="3%" height={118} />

      {/* Bottom shelf */}
      <WoodenShelf groups={BOTTOM_SHELF_GROUPS} top="33%" height={108} />

      {/* Counter surface — warm dark wood to make beaker pop */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "56%",
          bottom: 0,
          zIndex: 5,
          background: "linear-gradient(180deg, #5C4033 0%, #4A3228 55%, #3D2820 100%)",
          borderTop: "3px solid #7A5C48",
          boxShadow: "inset 0 2px 4px rgba(100,80,60,0.3), 0 8px 24px rgba(50,30,15,0.25)",
        }}
        aria-label="Bàn thí nghiệm"
      >
        {/* Wood grain texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 38px, rgba(255,240,210,0.5) 38px, rgba(255,240,210,0.5) 39px)",
          }}
        />
        {/* Warm spotlight glow — highlights the beaker zone */}
        <div
          className="absolute left-1/2 -top-16 -translate-x-1/2"
          style={{
            width: 340,
            height: 170,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(255,220,150,0.18) 0%, rgba(255,200,120,0.06) 45%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Lab equipment — left side */}
      <div className="absolute" style={{ bottom: "2%", left: "4%", zIndex: 6 }}>
        <LabEquipment2D />
      </div>

      {/* Main content slot (BeakerHero etc.) */}
      <div
        className="absolute inset-0 flex items-end justify-center"
        style={{ paddingBottom: "5%" }}
      >
        {children}
      </div>
    </div>
  );
}
