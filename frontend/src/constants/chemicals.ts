export type ChemicalCategory =
  | "acid"
  | "base"
  | "salt"
  | "metal"
  | "nonmetal"
  | "organic";

export interface Chemical {
  id: string;
  name: string;
  formula: string; // raw, e.g. "H2SO4"
  category: ChemicalCategory;
}

export interface CategoryGroup {
  key: ChemicalCategory;
  label: string;
  emoji: string;
  colorVar: string; // CSS var name
  chemicals: Chemical[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: "acid",
    label: "Acid",
    emoji: "🧪",
    colorVar: "--cat-acid",
    chemicals: [
      { id: "hcl", name: "Axit clohidric", formula: "HCl", category: "acid" },
      { id: "h2so4", name: "Axit sunfuric", formula: "H2SO4", category: "acid" },
      { id: "hno3", name: "Axit nitric", formula: "HNO3", category: "acid" },
      { id: "ch3cooh", name: "Axit axetic", formula: "CH3COOH", category: "acid" },
      { id: "h3po4", name: "Axit photphoric", formula: "H3PO4", category: "acid" },
      { id: "h2co3", name: "Axit cacbonic", formula: "H2CO3", category: "acid" },
    ],
  },
  {
    key: "base",
    label: "Base",
    emoji: "🧂",
    colorVar: "--cat-base",
    chemicals: [
      { id: "naoh", name: "Natri hidroxit", formula: "NaOH", category: "base" },
      { id: "koh", name: "Kali hidroxit", formula: "KOH", category: "base" },
      { id: "caoh2", name: "Canxi hidroxit", formula: "Ca(OH)2", category: "base" },
      { id: "nh3", name: "Amoniac", formula: "NH3", category: "base" },
      { id: "mgoh2", name: "Magie hidroxit", formula: "Mg(OH)2", category: "base" },
    ],
  },
  {
    key: "salt",
    label: "Muối",
    emoji: "💎",
    colorVar: "--cat-salt",
    chemicals: [
      { id: "nacl", name: "Natri clorua", formula: "NaCl", category: "salt" },
      { id: "cuso4", name: "Đồng sunfat", formula: "CuSO4", category: "salt" },
      { id: "caco3", name: "Canxi cacbonat", formula: "CaCO3", category: "salt" },
      { id: "kno3", name: "Kali nitrat", formula: "KNO3", category: "salt" },
      { id: "agno3", name: "Bạc nitrat", formula: "AgNO3", category: "salt" },
    ],
  },
  {
    key: "metal",
    label: "Kim loại",
    emoji: "⚙️",
    colorVar: "--cat-metal",
    chemicals: [
      { id: "na", name: "Natri", formula: "Na", category: "metal" },
      { id: "fe", name: "Sắt", formula: "Fe", category: "metal" },
      { id: "cu", name: "Đồng", formula: "Cu", category: "metal" },
      { id: "zn", name: "Kẽm", formula: "Zn", category: "metal" },
      { id: "al", name: "Nhôm", formula: "Al", category: "metal" },
      { id: "mg", name: "Magie", formula: "Mg", category: "metal" },
    ],
  },
  {
    key: "nonmetal",
    label: "Phi kim",
    emoji: "🌫️",
    colorVar: "--cat-nonmetal",
    chemicals: [
      { id: "o2", name: "Oxi", formula: "O2", category: "nonmetal" },
      { id: "cl2", name: "Clo", formula: "Cl2", category: "nonmetal" },
      { id: "s", name: "Lưu huỳnh", formula: "S", category: "nonmetal" },
      { id: "c", name: "Cacbon", formula: "C", category: "nonmetal" },
      { id: "n2", name: "Nitơ", formula: "N2", category: "nonmetal" },
    ],
  },
  {
    key: "organic",
    label: "Hợp chất hữu cơ",
    emoji: "🧬",
    colorVar: "--cat-organic",
    chemicals: [
      { id: "c2h5oh", name: "Etanol", formula: "C2H5OH", category: "organic" },
      { id: "ch4", name: "Metan", formula: "CH4", category: "organic" },
      { id: "c6h6", name: "Benzen", formula: "C6H6", category: "organic" },
      { id: "c2h4", name: "Etilen", formula: "C2H4", category: "organic" },
      { id: "c6h12o6", name: "Glucozơ", formula: "C6H12O6", category: "organic" },
    ],
  },
];

/**
 * Render a chemical formula as React nodes with subscript digits.
 * "H2SO4" -> H₂SO₄ rendered with <sub> tags.
 */
export function formatFormula(formula: string): Array<{ text: string; sub: boolean }> {
  const parts: Array<{ text: string; sub: boolean }> = [];
  let buf = "";
  let mode: "text" | "digit" = "text";
  for (const ch of formula) {
    const isDigit = /[0-9]/.test(ch);
    const wantMode = isDigit ? "digit" : "text";
    if (wantMode !== mode && buf) {
      parts.push({ text: buf, sub: mode === "digit" });
      buf = "";
    }
    mode = wantMode;
    buf += ch;
  }
  if (buf) parts.push({ text: buf, sub: mode === "digit" });
  return parts;
}

export const RECENT_REACTIONS = [
  { id: "r1", name: "Tổng hợp nước", formula: "2H2 + O2 → 2H2O", time: "5 phút trước" },
  { id: "r2", name: "Trung hoà", formula: "HCl + NaOH → NaCl + H2O", time: "12 phút trước" },
  { id: "r3", name: "Đốt cháy metan", formula: "CH4 + 2O2 → CO2 + 2H2O", time: "1 giờ trước" },
  { id: "r4", name: "Phản ứng thế", formula: "Zn + 2HCl → ZnCl2 + H2", time: "Hôm qua" },
  { id: "r5", name: "Phân huỷ", formula: "CaCO3 → CaO + CO2", time: "2 ngày trước" },
];
