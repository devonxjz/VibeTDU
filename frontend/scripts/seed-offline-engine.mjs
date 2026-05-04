import fetch from 'node-fetch'; // Polyfill for Node if needed, but Node 18+ has native fetch.

const SUPABASE_URL = "https://yesykibnglunqlspikin.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3lraWJuZ2x1bnFsc3Bpa2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzk1NDQsImV4cCI6MjA5MjYxNTU0NH0.BM7wQGcekMMVow1Z1ouxmfeWLfK9qRy5tRAbu7VNphg";

const ALL_FORMULAE = [
  "HCl", "H2SO4", "HNO3", "CH3COOH", "H3PO4", "H2CO3",
  "HBr", "HI", "HF", "HNO2", "H2SO3", "HClO4", "HCOOH", "H2S",
  "NaOH", "KOH", "Ca(OH)2", "NH3", "Mg(OH)2", "LiOH",
  "Ba(OH)2", "Al(OH)3", "Cu(OH)2", "Fe(OH)3", "Fe(OH)2", "Zn(OH)2", "AgOH",
  "NaCl", "CuSO4", "CaCO3", "KNO3", "AgNO3", "K2SO4",
  "Na2SO4", "Na2CO3", "K2CO3", "BaCl2", "AgCl", "BaSO4",
  "FeSO4", "FeCl3", "AlCl3", "KMnO4", "K2Cr2O7", "KI",
  "Na", "Fe", "Cu", "Zn", "Al", "Mg", "Ag", "Au", "Pt",
  "Hg", "Pb", "Sn", "K", "Ca", "Ba",
  "O2", "Cl2", "S", "C", "N2", "Br2", "I2", "P", "F2", "He", "Ar",
  "C2H5OH", "CH4", "C6H6", "C2H4", "C6H12O6", "C3H8",
  "C4H10", "C2H2", "HCHO", "CH3CHO", "CH3OH", "C6H5OH", "C3H8O3",
];

const METALS = ["K", "Na", "Ba", "Ca", "Mg", "Al", "Zn", "Fe", "Sn", "Pb", "Cu", "Hg", "Ag", "Pt", "Au"];
const REACTIVITY = {"K":15, "Na":14, "Ba":13, "Ca":12, "Mg":11, "Al":10, "Zn":9, "Fe":8, "Sn":7, "Pb":6, "Cu":4, "Hg":3, "Ag":2, "Pt":1, "Au":0};

function isAcid(f) { return ["HCl", "H2SO4", "HNO3", "CH3COOH", "H3PO4", "H2CO3", "HBr", "HI", "HF", "HNO2", "H2SO3", "HClO4", "HCOOH", "H2S"].includes(f); }
function isBase(f) { return ["NaOH", "KOH", "Ca(OH)2", "NH3", "Mg(OH)2", "LiOH", "Ba(OH)2", "Al(OH)3", "Cu(OH)2", "Fe(OH)3", "Fe(OH)2", "Zn(OH)2", "AgOH"].includes(f); }
function isSalt(f) { return ["NaCl", "CuSO4", "CaCO3", "KNO3", "AgNO3", "K2SO4", "Na2SO4", "Na2CO3", "K2CO3", "BaCl2", "AgCl", "BaSO4", "FeSO4", "FeCl3", "AlCl3", "KMnO4", "K2Cr2O7", "KI"].includes(f); }
function isMetal(f) { return METALS.includes(f); }
function isOrganic(f) { return ["C2H5OH", "CH4", "C6H6", "C2H4", "C6H12O6", "C3H8", "C4H10", "C2H2", "HCHO", "CH3CHO", "CH3OH", "C6H5OH", "C3H8O3"].includes(f); }

function getMetal(formula) {
  for (let m of METALS) {
    if (formula.startsWith(m)) return m;
  }
  return null;
}

function evaluateSingleDirection(a, b) {
  let r = {
    hasReaction: false, equation: null, productFormula: null, effectType: "NONE",
    effectColor: null, gasFormula: null, precipitateFormula: null, precipitateColor: null,
    messageVi: "Không có phản ứng xảy ra.", explanationVi: "Hai chất này không tác dụng với nhau trong điều kiện thường.",
    safetyNoteVi: "An toàn.", confidence: 0.9
  };

  // 1. Acid + Base -> Neutralization
  if (isAcid(a) && isBase(b)) {
    r.hasReaction = true; r.effectType = "HEAT";
    r.messageVi = "Phản ứng trung hòa tạo muối và nước, tỏa nhiệt nhẹ.";
    r.explanationVi = "Axit tác dụng với bazơ luôn tạo ra muối và nước (phản ứng trung hòa).";
    return r;
  }

  // 2. Acid + Carbonate -> CO2
  if (isAcid(a) && b.includes("CO3")) {
    r.hasReaction = true; r.effectType = "GAS_BUBBLE"; r.gasFormula = "CO2";
    r.messageVi = "Sủi bọt khí không màu.";
    r.explanationVi = "Axit mạnh đẩy gốc cacbonat yếu, tạo ra khí CO2 thoát ra khỏi dung dịch.";
    return r;
  }

  // 3. Acid + Metal -> H2 (Active metals)
  if (isAcid(a) && isMetal(b)) {
    if (REACTIVITY[b] > 5) {
      if (a === "HNO3") {
         r.hasReaction = true; r.effectType = "GAS_BUBBLE"; r.gasFormula = "NO2";
         r.messageVi = "Kim loại tan, sủi bọt khí màu nâu đỏ độc hại.";
         r.explanationVi = "Axit HNO3 có tính oxi hóa mạnh sinh ra khí NO2 thay vì H2.";
      } else {
         r.hasReaction = true; r.effectType = "GAS_BUBBLE"; r.gasFormula = "H2";
         r.messageVi = "Kim loại tan dần, có sủi bọt khí không màu.";
         r.explanationVi = "Kim loại mạnh đẩy Hydro ra khỏi dung dịch axit.";
      }
      return r;
    }
  }

  // 4. Metal + Salt -> Displacement
  if (isMetal(a) && isSalt(b)) {
    let m2 = getMetal(b);
    if (m2 && REACTIVITY[a] > REACTIVITY[m2]) {
      r.hasReaction = true; r.effectType = "COLOR_CHANGE";
      r.messageVi = `Kim loại mới sinh ra bám vào bề mặt, dung dịch nhạt màu.`;
      r.explanationVi = `Kim loại mạnh hơn (${a}) đẩy kim loại yếu hơn (${m2}) ra khỏi muối.`;
      return r;
    }
  }

  // 5. Ba/Pb + SO4 -> Precipitate
  if ((a.includes("Ba") || a.includes("Pb")) && b.includes("SO4") && b !== "BaSO4") {
    r.hasReaction = true; r.effectType = "PRECIPITATE"; r.precipitateColor = "#FFFFFF";
    r.messageVi = "Xuất hiện kết tủa trắng đặc trưng.";
    r.explanationVi = "Ion Sunfat (SO4 2-) kết hợp tạo thành muối không tan.";
    return r;
  }

  // 6. Ag + Cl/Br/I -> Precipitate
  if (a.includes("Ag") && (b.includes("Cl") || b.includes("Br") || b.includes("I")) && b !== "AgCl" && b !== "AgNO3") {
    r.hasReaction = true; r.effectType = "PRECIPITATE"; r.precipitateColor = b.includes("I") ? "#FFFF00" : "#FFFFFF";
    r.messageVi = "Xuất hiện kết tủa (trắng/vàng).";
    r.explanationVi = "Ion Bạc (Ag+) kết hợp với ion Halogen tạo thành muối kết tủa.";
    return r;
  }

  // 7. Base + Salt (Cu, Fe, Mg, Al)
  if ((isBase(a) || a === "NH3") && isSalt(b)) {
    if (b.includes("Cu")) {
       r.hasReaction = true; r.effectType = "PRECIPITATE"; r.precipitateColor = "#0000FF";
       r.messageVi = "Tạo kết tủa màu xanh lam."; r.explanationVi = "Đồng(II) hidroxit không tan được tạo thành.";
       return r;
    }
    if (b.includes("FeCl3") || b.includes("Fe(NO3)3")) {
       r.hasReaction = true; r.effectType = "PRECIPITATE"; r.precipitateColor = "#8B4513";
       r.messageVi = "Tạo kết tủa màu nâu đỏ."; r.explanationVi = "Sắt(III) hidroxit không tan được tạo thành.";
       return r;
    }
    if (b.includes("FeSO4") || b.includes("FeCl2")) {
       r.hasReaction = true; r.effectType = "PRECIPITATE"; r.precipitateColor = "#008000";
       r.messageVi = "Tạo kết tủa màu trắng xanh (sau hóa nâu đỏ)."; r.explanationVi = "Sắt(II) hidroxit được tạo thành.";
       return r;
    }
  }

  // 8. Organic + O2 -> Combustion
  if (isOrganic(a) && b === "O2") {
    r.hasReaction = true; r.effectType = "HEAT"; r.gasFormula = "CO2";
    r.messageVi = "Phản ứng cháy mãnh liệt sinh nhiệt, CO2 và hơi nước.";
    r.explanationVi = "Phản ứng oxi hóa hoàn toàn hợp chất hữu cơ.";
    return r;
  }

  return null;
}

function predict(a, b) {
  let res = evaluateSingleDirection(a, b);
  if (!res) res = evaluateSingleDirection(b, a);
  if (!res) {
    res = {
      hasReaction: false, equation: null, productFormula: null, effectType: "NONE",
      effectColor: null, gasFormula: null, precipitateFormula: null, precipitateColor: null,
      messageVi: "Không có hiện tượng gì xảy ra.", explanationVi: "Hai chất này không phản ứng với nhau trong điều kiện thường.",
      safetyNoteVi: "An toàn.", confidence: 0.8
    };
  }
  return res;
}

function buildReactionKey(a, b) {
  return [a.trim().toUpperCase(), b.trim().toUpperCase()].sort().join("__");
}

const supaHeaders = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal,resolution=merge-duplicates",
};

async function insertBatch(records) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reaction_api_cache`, {
    method: "POST",
    headers: supaHeaders,
    body: JSON.stringify(records),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase INSERT failed: HTTP ${res.status} — ${text}`);
  }
}

async function main() {
  console.log(`🚀 Bắt đầu Engine Sinh Dữ Liệu Offline cho ${ALL_FORMULAE.length} chất...`);
  const allPairs = [];
  for (let i = 0; i < ALL_FORMULAE.length; i++) {
    for (let j = i + 1; j < ALL_FORMULAE.length; j++) {
      allPairs.push([ALL_FORMULAE[i], ALL_FORMULAE[j]]);
    }
  }

  console.log(`Tổng số cặp cần đánh giá: ${allPairs.length}`);
  
  const records = [];
  let reactCount = 0;
  
  for (const [a, b] of allPairs) {
    const result = predict(a, b);
    if (result.hasReaction) reactCount++;
    
    const key = buildReactionKey(a, b);
    const now = new Date().toISOString();
    
    records.push({
      reaction_key: key,
      input_payload: JSON.stringify([a, b]),
      raw_prediction_response: "RULES_ENGINE",
      normalized_result: JSON.stringify(result),
      source: "RULES_ENGINE",
      confidence: result.confidence,
      verified: true,
      created_at: now,
      last_used_at: now,
    });
  }

  console.log(`🧠 Engine đã đánh giá xong! Có ${reactCount} phản ứng xảy ra và ${allPairs.length - reactCount} không phản ứng.`);
  console.log(`💾 Đang tải dữ liệu lên Supabase theo từng đợt...`);

  // BATCH UPLOAD (500 per batch)
  const BATCH_SIZE = 500;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await insertBatch(batch);
    console.log(`  ✅ Đã tải lên ${Math.min(i + BATCH_SIZE, records.length)} / ${records.length} bản ghi...`);
  }

  console.log(`🎉 HOÀN TẤT! Toàn bộ ${records.length} phản ứng đã nằm trong Database.`);
}

main().catch(console.error);
