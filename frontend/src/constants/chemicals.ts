export type ChemicalCategory =
  | "acid"
  | "base"
  | "salt"
  | "metal"
  | "nonmetal"
  | "organic"
  | "api";

export interface Chemical {
  id: string;
  name: string;
  formula: string; // raw, e.g. "H2SO4"
  category: ChemicalCategory;
  /** Actual liquid/substance color for realistic display */
  color: string;
}

export interface CategoryGroup {
  key: ChemicalCategory;
  label: string;
  emoji: string;
  colorVar: string; // CSS var name
  chemicals: Chemical[];
}

export interface CategoryUiColor {
  accent: string;
  bg: string;
  softBg: string;
  border: string;
  text: string;
}

/**
 * UI identification colors.
 * Keep these saturated for scanning; realistic substance colors stay in CHEMICAL_COLORS.
 */
export const CATEGORY_UI_COLORS: Record<ChemicalCategory, CategoryUiColor> = {
  acid: {
    accent: "#e73512",
    bg: "#fff1ec",
    softBg: "#fff7f4",
    border: "#ffc2b3",
    text: "#8f1d08",
  },
  base: {
    accent: "#0877c9",
    bg: "#eaf6ff",
    softBg: "#f4fbff",
    border: "#acd9ff",
    text: "#064c83",
  },
  salt: {
    accent: "#7c3aed",
    bg: "#f3ecff",
    softBg: "#faf7ff",
    border: "#d8c4ff",
    text: "#4c1d95",
  },
  metal: {
    accent: "#52616f",
    bg: "#eef2f5",
    softBg: "#f8fafc",
    border: "#cbd5df",
    text: "#26323f",
  },
  nonmetal: {
    accent: "#0f9f7a",
    bg: "#e9fbf6",
    softBg: "#f5fdfa",
    border: "#a7eadb",
    text: "#08604c",
  },
  organic: {
    accent: "#7a5a00",
    bg: "#fff7d8",
    softBg: "#fffbee",
    border: "#f1d878",
    text: "#5a4100",
  },
  api: {
    accent: "#2563eb",
    bg: "#eef4ff",
    softBg: "#f7faff",
    border: "#bfd4ff",
    text: "#1e3a8a",
  },
};

/**
 * Realistic color map for common chemicals.
 * Based on actual appearance of the substances.
 */
export const CHEMICAL_COLORS: Record<string, string> = {
  // Acids
  hcl:      "rgba(220, 230, 240, 0.85)",  // colorless liquid
  h2so4:    "rgba(230, 230, 235, 0.9)",   // colorless, oily
  hno3:     "rgba(255, 248, 200, 0.9)",   // pale yellow
  ch3cooh:  "rgba(240, 240, 245, 0.85)",  // colorless
  h3po4:    "rgba(235, 235, 240, 0.9)",   // colorless, syrupy
  h2co3:    "rgba(225, 240, 250, 0.8)",   // colorless (dissolved CO2)
  hbr:      "rgba(240, 230, 210, 0.85)",  // slight yellow tint
  hi:       "rgba(240, 220, 180, 0.85)",  // light brown tint
  hf:       "rgba(235, 240, 245, 0.85)",  // colorless
  hno2:     "rgba(220, 240, 255, 0.8)",   // pale blue
  h2so3:    "rgba(230, 235, 240, 0.8)",   // colorless
  hclo4:    "rgba(245, 245, 250, 0.85)",  // colorless
  hcooh:    "rgba(240, 240, 245, 0.85)",  // colorless
  h2s:      "rgba(220, 225, 215, 0.6)",   // colorless gas dissolved

  // Bases
  naoh:     "rgba(245, 245, 250, 0.95)",  // white solid/clear solution
  koh:      "rgba(240, 240, 248, 0.95)",  // white/clear
  "caoh2":  "rgba(245, 245, 245, 0.95)",  // white milky (lime water)
  nh3:      "rgba(220, 235, 250, 0.8)",   // colorless gas
  "mgoh2":  "rgba(248, 248, 255, 0.95)",  // white
  lioh:     "rgba(250, 250, 250, 0.95)",  // white
  "baoh2":  "rgba(245, 245, 250, 0.95)",  // white
  "aloh3":  "rgba(240, 240, 245, 0.95)",  // white gel
  "cuoh2":  "rgba(100, 150, 220, 0.9)",   // pale blue
  "feoh3":  "rgba(180, 80, 40, 0.95)",    // rust brown
  "feoh2":  "rgba(100, 140, 100, 0.95)",  // pale green
  "znoh2":  "rgba(250, 250, 255, 0.95)",  // white
  agoh:     "rgba(200, 190, 180, 0.95)",  // brown/white

  // Salts
  nacl:     "rgba(250, 250, 255, 0.95)",  // white crystals
  cuso4:    "rgba(30, 120, 220, 0.85)",   // bright blue (copper sulfate)
  caco3:    "rgba(248, 245, 240, 0.95)",  // white powder
  kno3:     "rgba(250, 250, 252, 0.95)",  // white crystals
  agno3:    "rgba(245, 245, 248, 0.95)",  // white/colorless
  k2so4:    "rgba(250, 250, 250, 0.95)",  // white
  na2so4:   "rgba(245, 245, 255, 0.95)",  // white
  na2co3:   "rgba(250, 245, 250, 0.95)",  // white
  k2co3:    "rgba(250, 250, 245, 0.95)",  // white
  bacl2:    "rgba(245, 245, 245, 0.95)",  // white
  agcl:     "rgba(255, 255, 255, 0.95)",  // white
  baso4:    "rgba(255, 250, 250, 0.95)",  // white
  feso4:    "rgba(120, 180, 130, 0.9)",   // pale green
  fecl3:    "rgba(200, 140, 40, 0.9)",    // yellow-brown
  alcl3:    "rgba(240, 240, 230, 0.95)",  // white/yellowish
  kmno4:    "rgba(128, 0, 128, 0.9)",     // purple
  k2cr2o7:  "rgba(240, 100, 20, 0.95)",   // orange
  ki:       "rgba(250, 250, 240, 0.95)",  // white

  // Metals
  na:       "rgba(200, 205, 215, 0.95)",  // silvery
  fe:       "rgba(160, 160, 165, 0.95)",  // gray metallic
  cu:       "rgba(200, 120, 60, 0.95)",   // copper/brown
  zn:       "rgba(190, 195, 205, 0.95)",  // bluish-silver
  al:       "rgba(210, 215, 225, 0.95)",  // silver
  mg:       "rgba(205, 210, 220, 0.95)",  // silver-white
  ag:       "rgba(220, 225, 230, 0.95)",  // silver
  au:       "rgba(255, 215, 0, 0.95)",    // gold
  pt:       "rgba(215, 215, 220, 0.95)",  // platinum
  hg:       "rgba(180, 185, 190, 0.95)",  // liquid silver
  pb:       "rgba(140, 145, 150, 0.95)",  // dark gray
  sn:       "rgba(200, 200, 205, 0.95)",  // tin
  k:        "rgba(195, 200, 210, 0.95)",  // soft silver
  ca:       "rgba(210, 215, 220, 0.95)",  // dull silver
  ba:       "rgba(190, 195, 180, 0.95)",  // silvery pale

  // Non-metals
  o2:       "rgba(200, 225, 255, 0.6)",   // colorless gas (light blue tint)
  cl2:      "rgba(180, 220, 100, 0.75)",  // yellow-green gas
  s:        "rgba(230, 210, 50, 0.95)",   // bright yellow solid
  c:        "rgba(50, 50, 55, 0.95)",     // black solid
  n2:       "rgba(210, 230, 250, 0.5)",   // colorless gas
  br2:      "rgba(150, 50, 20, 0.8)",     // red-brown liquid
  i2:       "rgba(80, 50, 100, 0.95)",    // dark purple/grey
  p:        "rgba(200, 50, 50, 0.95)",    // red phosphorus
  f2:       "rgba(240, 240, 150, 0.6)",   // pale yellow gas
  he:       "rgba(230, 240, 250, 0.4)",   // colorless
  ar:       "rgba(225, 235, 245, 0.4)",   // colorless

  // Organic
  c2h5oh:   "rgba(240, 240, 245, 0.8)",   // colorless liquid
  ch4:      "rgba(215, 235, 250, 0.5)",   // colorless gas
  c6h6:     "rgba(240, 240, 235, 0.8)",   // colorless liquid
  c2h4:     "rgba(220, 240, 250, 0.5)",   // colorless gas
  c6h12o6:  "rgba(255, 255, 250, 0.95)",  // white solid
  c3h8:     "rgba(210, 230, 245, 0.5)",   // colorless gas
  c4h10:    "rgba(205, 225, 240, 0.5)",   // colorless gas
  c2h2:     "rgba(225, 235, 245, 0.5)",   // colorless gas
  hcho:     "rgba(235, 240, 245, 0.7)",   // colorless gas
  ch3cho:   "rgba(230, 235, 240, 0.8)",   // colorless liquid
  ch3oh:    "rgba(240, 245, 250, 0.8)",   // colorless liquid
  c6h5oh:   "rgba(245, 240, 235, 0.95)",  // white crystalline
  c3h8o3:   "rgba(245, 245, 250, 0.9)",   // glycerol (syrupy)
};

/**
 * Helper to guess color for dynamically fetched chemicals based on their formula.
 */
function guessColorFromFormula(formula: string, type: "liquid" | "bottle"): string {
  const f = formula.toUpperCase();
  if (f.includes("CU")) return type === "liquid" ? "rgba(30, 120, 220, 0.85)" : "#1e88e5"; // blue
  if (f.includes("FE")) return type === "liquid" ? "rgba(200, 140, 40, 0.9)" : "#daa520"; // yellow/brown
  if (f.includes("CR")) return type === "liquid" ? "rgba(240, 100, 20, 0.95)" : "#ff8c00"; // orange
  if (f.includes("MN")) return type === "liquid" ? "rgba(128, 0, 128, 0.9)" : "#800080"; // purple
  if (f.includes("NI")) return type === "liquid" ? "rgba(50, 200, 100, 0.9)" : "#3cb371"; // green
  if (f.includes("CO")) return type === "liquid" ? "rgba(220, 100, 150, 0.9)" : "#ff69b4"; // pink
  
  // Default to a clear/white appearance
  return type === "liquid" ? "rgba(240, 245, 250, 0.85)" : "#f0f4f8";
}

/**
 * Get the display color for a chemical. Falls back to category color.
 */
export function getChemicalColor(chemicalId: string, formula?: string): string {
  if (CHEMICAL_COLORS[chemicalId]) return CHEMICAL_COLORS[chemicalId];
  if (formula) return guessColorFromFormula(formula, "liquid");
  return "rgba(200, 210, 225, 0.8)";
}

/**
 * Get a more saturated "bottle label" color for sidebar display.
 * These are more vibrant versions for the bottle icon in the sidebar.
 */
export const BOTTLE_COLORS: Record<string, string> = {
  // Acids - warm tones
  hcl:      "#e8f0f8",  // pale blue-white
  h2so4:    "#f0ece0",  // pale amber
  hno3:     "#fff4c8",  // yellow tint
  ch3cooh:  "#f5f5f0",  // almost colorless
  h3po4:    "#ede8e0",  // pale cream
  h2co3:    "#e0f0fa",  // very pale blue
  hbr:      "#faebd7",
  hi:       "#deb887",
  hf:       "#f0f8ff",
  hno2:     "#e6f2ff",
  h2so3:    "#f0f8ff",
  hclo4:    "#f8f8ff",
  hcooh:    "#f5f5f5",
  h2s:      "#e0eee0",

  // Bases - cool tones
  naoh:     "#f0f4ff",  // white with blue tint
  koh:      "#f0f2ff",  // white with blue tint
  "caoh2":  "#fafafa",  // milky white
  nh3:      "#dceafa",  // light blue
  "mgoh2":  "#f5f5ff",  // white
  lioh:     "#fafaff",
  "baoh2":  "#f4f4fa",
  "aloh3":  "#f0f0f5",
  "cuoh2":  "#6495ed",
  "feoh3":  "#cd5c5c",
  "feoh2":  "#8fbc8f",
  "znoh2":  "#f8f8ff",
  agoh:     "#d2b48c",

  // Salts - diverse
  nacl:     "#fafafe",  // white
  cuso4:    "#1e88e5",  // vivid blue ★
  caco3:    "#f5f0e8",  // cream white
  kno3:     "#fafafe",  // white
  agno3:    "#f2f2f5",  // white
  k2so4:    "#f8f8f8",
  na2so4:   "#f5f5fc",
  na2co3:   "#fcf5fc",
  k2co3:    "#fcfcf5",
  bacl2:    "#f5f5f5",
  agcl:     "#ffffff",
  baso4:    "#fffafa",
  feso4:    "#98fb98",
  fecl3:    "#daa520",
  alcl3:    "#f5f5dc",
  kmno4:    "#800080",
  k2cr2o7:  "#ff8c00",
  ki:       "#fffff0",

  // Metals - metallic
  na:       "#c8ccd8",  // silver
  fe:       "#a0a0a8",  // gray
  cu:       "#c87838",  // copper brown ★
  zn:       "#bec5d0",  // blue-silver
  al:       "#d2d8e0",  // silver
  mg:       "#cdd2dc",  // silver-white
  ag:       "#e0e5e8",
  au:       "#ffd700",
  pt:       "#dcdcdc",
  hg:       "#c0c0c0",
  pb:       "#a9a9a9",
  sn:       "#d3d3d3",
  k:        "#c0c8d0",
  ca:       "#dcdce0",
  ba:       "#d0d5c0",

  // Non-metals - vivid
  o2:       "#c8e0ff",  // light blue
  cl2:      "#b4dc64",  // yellow-green ★
  s:        "#e6d232",  // bright yellow ★
  c:        "#323238",  // black ★
  n2:       "#d2e8fa",  // very light blue
  br2:      "#a52a2a",
  i2:       "#4b0082",
  p:        "#cd5c5c",
  f2:       "#ffffe0",
  he:       "#f0f8ff",
  ar:       "#f0ffff",

  // Organic
  c2h5oh:   "#f0f0f5",  // colorless
  ch4:      "#d8ecfa",  // pale blue (gas)
  c6h6:     "#f0f0e8",  // colorless
  c2h4:     "#dcf0fa",  // pale blue (gas)
  c6h12o6:  "#fffff0",  // white-yellow
  c3h8:     "#e6f2ff",
  c4h10:    "#e0f0ff",
  c2h2:     "#ebf5ff",
  hcho:     "#f0f5fa",
  ch3cho:   "#e6ecf2",
  ch3oh:    "#f5f8fa",
  c6h5oh:   "#faf5f0",
  c3h8o3:   "#fcfcfd",
};

export function getBottleColor(chemicalId: string, formula?: string): string {
  if (BOTTLE_COLORS[chemicalId]) return BOTTLE_COLORS[chemicalId];
  if (formula) return guessColorFromFormula(formula, "bottle");
  return "#d0d8e0";
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: "acid",
    label: "Acid",
    emoji: "🧪",
    colorVar: "--cat-acid",
    chemicals: [
      { id: "hcl", name: "Axit clohidric", formula: "HCl", category: "acid", color: CHEMICAL_COLORS.hcl },
      { id: "h2so4", name: "Axit sunfuric", formula: "H2SO4", category: "acid", color: CHEMICAL_COLORS.h2so4 },
      { id: "hno3", name: "Axit nitric", formula: "HNO3", category: "acid", color: CHEMICAL_COLORS.hno3 },
      { id: "ch3cooh", name: "Axit axetic", formula: "CH3COOH", category: "acid", color: CHEMICAL_COLORS.ch3cooh },
      { id: "h3po4", name: "Axit photphoric", formula: "H3PO4", category: "acid", color: CHEMICAL_COLORS.h3po4 },
      { id: "h2co3", name: "Axit cacbonic", formula: "H2CO3", category: "acid", color: CHEMICAL_COLORS.h2co3 },
      { id: "hbr", name: "Axit bromhidric", formula: "HBr", category: "acid", color: CHEMICAL_COLORS.hbr },
      { id: "hi", name: "Axit iodhidric", formula: "HI", category: "acid", color: CHEMICAL_COLORS.hi },
      { id: "hf", name: "Axit flohidric", formula: "HF", category: "acid", color: CHEMICAL_COLORS.hf },
      { id: "hno2", name: "Axit nitrơ", formula: "HNO2", category: "acid", color: CHEMICAL_COLORS.hno2 },
      { id: "h2so3", name: "Axit sunfurơ", formula: "H2SO3", category: "acid", color: CHEMICAL_COLORS.h2so3 },
      { id: "hclo4", name: "Axit pecloric", formula: "HClO4", category: "acid", color: CHEMICAL_COLORS.hclo4 },
      { id: "hcooh", name: "Axit fomic", formula: "HCOOH", category: "acid", color: CHEMICAL_COLORS.hcooh },
      { id: "h2s", name: "Axit sunfuahidric", formula: "H2S", category: "acid", color: CHEMICAL_COLORS.h2s },
    ],
  },
  {
    key: "base",
    label: "Base",
    emoji: "🧂",
    colorVar: "--cat-base",
    chemicals: [
      { id: "naoh", name: "Natri hidroxit", formula: "NaOH", category: "base", color: CHEMICAL_COLORS.naoh },
      { id: "koh", name: "Kali hidroxit", formula: "KOH", category: "base", color: CHEMICAL_COLORS.koh },
      { id: "caoh2", name: "Canxi hidroxit", formula: "Ca(OH)2", category: "base", color: CHEMICAL_COLORS.caoh2 },
      { id: "nh3", name: "Amoniac", formula: "NH3", category: "base", color: CHEMICAL_COLORS.nh3 },
      { id: "mgoh2", name: "Magie hidroxit", formula: "Mg(OH)2", category: "base", color: CHEMICAL_COLORS.mgoh2 },
      { id: "lioh", name: "Liti hidroxit", formula: "LiOH", category: "base", color: CHEMICAL_COLORS.lioh },
      { id: "baoh2", name: "Bari hidroxit", formula: "Ba(OH)2", category: "base", color: CHEMICAL_COLORS.baoh2 },
      { id: "aloh3", name: "Nhôm hidroxit", formula: "Al(OH)3", category: "base", color: CHEMICAL_COLORS.aloh3 },
      { id: "cuoh2", name: "Đồng(II) hidroxit", formula: "Cu(OH)2", category: "base", color: CHEMICAL_COLORS.cuoh2 },
      { id: "feoh3", name: "Sắt(III) hidroxit", formula: "Fe(OH)3", category: "base", color: CHEMICAL_COLORS.feoh3 },
      { id: "feoh2", name: "Sắt(II) hidroxit", formula: "Fe(OH)2", category: "base", color: CHEMICAL_COLORS.feoh2 },
      { id: "znoh2", name: "Kẽm hidroxit", formula: "Zn(OH)2", category: "base", color: CHEMICAL_COLORS.znoh2 },
      { id: "agoh", name: "Bạc hidroxit", formula: "AgOH", category: "base", color: CHEMICAL_COLORS.agoh },
    ],
  },
  {
    key: "salt",
    label: "Muối",
    emoji: "💎",
    colorVar: "--cat-salt",
    chemicals: [
      { id: "nacl", name: "Natri clorua", formula: "NaCl", category: "salt", color: CHEMICAL_COLORS.nacl },
      { id: "cuso4", name: "Đồng sunfat", formula: "CuSO4", category: "salt", color: CHEMICAL_COLORS.cuso4 },
      { id: "caco3", name: "Canxi cacbonat", formula: "CaCO3", category: "salt", color: CHEMICAL_COLORS.caco3 },
      { id: "kno3", name: "Kali nitrat", formula: "KNO3", category: "salt", color: CHEMICAL_COLORS.kno3 },
      { id: "agno3", name: "Bạc nitrat", formula: "AgNO3", category: "salt", color: CHEMICAL_COLORS.agno3 },
      { id: "k2so4", name: "Kali sunfat", formula: "K2SO4", category: "salt", color: CHEMICAL_COLORS.k2so4 },
      { id: "na2so4", name: "Natri sunfat", formula: "Na2SO4", category: "salt", color: CHEMICAL_COLORS.na2so4 },
      { id: "na2co3", name: "Natri cacbonat", formula: "Na2CO3", category: "salt", color: CHEMICAL_COLORS.na2co3 },
      { id: "k2co3", name: "Kali cacbonat", formula: "K2CO3", category: "salt", color: CHEMICAL_COLORS.k2co3 },
      { id: "bacl2", name: "Bari clorua", formula: "BaCl2", category: "salt", color: CHEMICAL_COLORS.bacl2 },
      { id: "agcl", name: "Bạc clorua", formula: "AgCl", category: "salt", color: CHEMICAL_COLORS.agcl },
      { id: "baso4", name: "Bari sunfat", formula: "BaSO4", category: "salt", color: CHEMICAL_COLORS.baso4 },
      { id: "feso4", name: "Sắt(II) sunfat", formula: "FeSO4", category: "salt", color: CHEMICAL_COLORS.feso4 },
      { id: "fecl3", name: "Sắt(III) clorua", formula: "FeCl3", category: "salt", color: CHEMICAL_COLORS.fecl3 },
      { id: "alcl3", name: "Nhôm clorua", formula: "AlCl3", category: "salt", color: CHEMICAL_COLORS.alcl3 },
      { id: "kmno4", name: "Kali pemanganat", formula: "KMnO4", category: "salt", color: CHEMICAL_COLORS.kmno4 },
      { id: "k2cr2o7", name: "Kali đicromat", formula: "K2Cr2O7", category: "salt", color: CHEMICAL_COLORS.k2cr2o7 },
      { id: "ki", name: "Kali iođua", formula: "KI", category: "salt", color: CHEMICAL_COLORS.ki },
    ],
  },
  {
    key: "metal",
    label: "Kim loại",
    emoji: "⚙️",
    colorVar: "--cat-metal",
    chemicals: [
      { id: "na", name: "Natri", formula: "Na", category: "metal", color: CHEMICAL_COLORS.na },
      { id: "fe", name: "Sắt", formula: "Fe", category: "metal", color: CHEMICAL_COLORS.fe },
      { id: "cu", name: "Đồng", formula: "Cu", category: "metal", color: CHEMICAL_COLORS.cu },
      { id: "zn", name: "Kẽm", formula: "Zn", category: "metal", color: CHEMICAL_COLORS.zn },
      { id: "al", name: "Nhôm", formula: "Al", category: "metal", color: CHEMICAL_COLORS.al },
      { id: "mg", name: "Magie", formula: "Mg", category: "metal", color: CHEMICAL_COLORS.mg },
      { id: "ag", name: "Bạc", formula: "Ag", category: "metal", color: CHEMICAL_COLORS.ag },
      { id: "au", name: "Vàng", formula: "Au", category: "metal", color: CHEMICAL_COLORS.au },
      { id: "pt", name: "Bạch kim", formula: "Pt", category: "metal", color: CHEMICAL_COLORS.pt },
      { id: "hg", name: "Thủy ngân", formula: "Hg", category: "metal", color: CHEMICAL_COLORS.hg },
      { id: "pb", name: "Chì", formula: "Pb", category: "metal", color: CHEMICAL_COLORS.pb },
      { id: "sn", name: "Thiếc", formula: "Sn", category: "metal", color: CHEMICAL_COLORS.sn },
      { id: "k", name: "Kali", formula: "K", category: "metal", color: CHEMICAL_COLORS.k },
      { id: "ca", name: "Canxi", formula: "Ca", category: "metal", color: CHEMICAL_COLORS.ca },
      { id: "ba", name: "Bari", formula: "Ba", category: "metal", color: CHEMICAL_COLORS.ba },
    ],
  },
  {
    key: "nonmetal",
    label: "Phi kim",
    emoji: "🌫️",
    colorVar: "--cat-nonmetal",
    chemicals: [
      { id: "o2", name: "Oxi", formula: "O2", category: "nonmetal", color: CHEMICAL_COLORS.o2 },
      { id: "cl2", name: "Clo", formula: "Cl2", category: "nonmetal", color: CHEMICAL_COLORS.cl2 },
      { id: "s", name: "Lưu huỳnh", formula: "S", category: "nonmetal", color: CHEMICAL_COLORS.s },
      { id: "c", name: "Cacbon", formula: "C", category: "nonmetal", color: CHEMICAL_COLORS.c },
      { id: "n2", name: "Nitơ", formula: "N2", category: "nonmetal", color: CHEMICAL_COLORS.n2 },
      { id: "br2", name: "Brom", formula: "Br2", category: "nonmetal", color: CHEMICAL_COLORS.br2 },
      { id: "i2", name: "Iot", formula: "I2", category: "nonmetal", color: CHEMICAL_COLORS.i2 },
      { id: "p", name: "Photpho", formula: "P", category: "nonmetal", color: CHEMICAL_COLORS.p },
      { id: "f2", name: "Flo", formula: "F2", category: "nonmetal", color: CHEMICAL_COLORS.f2 },
      { id: "he", name: "Heli", formula: "He", category: "nonmetal", color: CHEMICAL_COLORS.he },
      { id: "ar", name: "Argon", formula: "Ar", category: "nonmetal", color: CHEMICAL_COLORS.ar },
    ],
  },
  {
    key: "organic",
    label: "Hợp chất hữu cơ",
    emoji: "🧬",
    colorVar: "--cat-organic",
    chemicals: [
      { id: "c2h5oh", name: "Etanol", formula: "C2H5OH", category: "organic", color: CHEMICAL_COLORS.c2h5oh },
      { id: "ch4", name: "Metan", formula: "CH4", category: "organic", color: CHEMICAL_COLORS.ch4 },
      { id: "c6h6", name: "Benzen", formula: "C6H6", category: "organic", color: CHEMICAL_COLORS.c6h6 },
      { id: "c2h4", name: "Etilen", formula: "C2H4", category: "organic", color: CHEMICAL_COLORS.c2h4 },
      { id: "c6h12o6", name: "Glucozơ", formula: "C6H12O6", category: "organic", color: CHEMICAL_COLORS.c6h12o6 },
      { id: "c3h8", name: "Propan", formula: "C3H8", category: "organic", color: CHEMICAL_COLORS.c3h8 },
      { id: "c4h10", name: "Butan", formula: "C4H10", category: "organic", color: CHEMICAL_COLORS.c4h10 },
      { id: "c2h2", name: "Axetilen", formula: "C2H2", category: "organic", color: CHEMICAL_COLORS.c2h2 },
      { id: "hcho", name: "Fomanđehit", formula: "HCHO", category: "organic", color: CHEMICAL_COLORS.hcho },
      { id: "ch3cho", name: "Axetalđehit", formula: "CH3CHO", category: "organic", color: CHEMICAL_COLORS.ch3cho },
      { id: "ch3oh", name: "Metanol", formula: "CH3OH", category: "organic", color: CHEMICAL_COLORS.ch3oh },
      { id: "c6h5oh", name: "Phenol", formula: "C6H5OH", category: "organic", color: CHEMICAL_COLORS.c6h5oh },
      { id: "c3h8o3", name: "Glixerol", formula: "C3H8O3", category: "organic", color: CHEMICAL_COLORS.c3h8o3 },
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
  let hasEncounteredNonDigit = false;
  
  for (const ch of formula) {
    const isDigit = /[0-9]/.test(ch);
    if (!isDigit) {
      hasEncounteredNonDigit = true;
    }
    
    const wantMode = (isDigit && hasEncounteredNonDigit) ? "digit" : "text";
    
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
