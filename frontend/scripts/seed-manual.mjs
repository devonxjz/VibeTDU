/**
 * Seed Reactions Manual — Offline Fallback
 * Lưu trực tiếp các phản ứng phổ biến vào Supabase mà không gọi AI API.
 */

const SUPABASE_URL = "https://yesykibnglunqlspikin.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3lraWJuZ2x1bnFsc3Bpa2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzk1NDQsImV4cCI6MjA5MjYxNTU0NH0.BM7wQGcekMMVow1Z1ouxmfeWLfK9qRy5tRAbu7VNphg";

const manualReactions = [
  {
    r1: "HCl", r2: "NaOH",
    result: {
      hasReaction: true, equation: "HCl + NaOH -> NaCl + H2O", productFormula: "NaCl, H2O",
      effectType: "HEAT", effectColor: null, gasFormula: null, precipitateFormula: null, precipitateColor: null,
      messageVi: "Phản ứng trung hòa tạo ra muối và nước, tỏa nhiều nhiệt.",
      explanationVi: "Ion H+ từ axit kết hợp với ion OH- từ bazơ tạo thành nước.",
      safetyNoteVi: "Phản ứng tỏa nhiệt, cẩn thận khi trộn nồng độ cao.", confidence: 1.0
    }
  },
  {
    r1: "HCl", r2: "Zn",
    result: {
      hasReaction: true, equation: "2HCl + Zn -> ZnCl2 + H2", productFormula: "ZnCl2, H2",
      effectType: "GAS_BUBBLE", effectColor: null, gasFormula: "H2", precipitateFormula: null, precipitateColor: null,
      messageVi: "Kẽm tan dần và có bọt khí không màu thoát ra.",
      explanationVi: "Kẽm là kim loại hoạt động mạnh hơn Hydro nên đẩy Hydro ra khỏi dung dịch axit.",
      safetyNoteVi: "Khí H2 dễ cháy nổ, tránh xa nguồn lửa.", confidence: 1.0
    }
  },
  {
    r1: "H2SO4", r2: "BaCl2",
    result: {
      hasReaction: true, equation: "H2SO4 + BaCl2 -> BaSO4 + 2HCl", productFormula: "BaSO4, HCl",
      effectType: "PRECIPITATE", effectColor: null, gasFormula: null, precipitateFormula: "BaSO4", precipitateColor: "#FFFFFF",
      messageVi: "Xuất hiện kết tủa trắng BaSO4.",
      explanationVi: "Ion Ba2+ kết hợp với ion SO4(2-) tạo thành muối BaSO4 không tan trong nước và axit.",
      safetyNoteVi: "Hóa chất chứa Bari có độc tính, rửa tay sau khi làm.", confidence: 1.0
    }
  },
  {
    r1: "CuSO4", r2: "NaOH",
    result: {
      hasReaction: true, equation: "CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4", productFormula: "Cu(OH)2, Na2SO4",
      effectType: "PRECIPITATE", effectColor: null, gasFormula: null, precipitateFormula: "Cu(OH)2", precipitateColor: "#0000FF",
      messageVi: "Tạo thành kết tủa màu xanh lam đặc trưng.",
      explanationVi: "Ion Cu2+ phản ứng với ion OH- tạo thành Đồng(II) hidroxit không tan.",
      safetyNoteVi: "Hóa chất đồng có thể gây kích ứng.", confidence: 1.0
    }
  },
  {
    r1: "Na2CO3", r2: "HCl",
    result: {
      hasReaction: true, equation: "Na2CO3 + 2HCl -> 2NaCl + CO2 + H2O", productFormula: "NaCl, CO2, H2O",
      effectType: "GAS_BUBBLE", effectColor: null, gasFormula: "CO2", precipitateFormula: null, precipitateColor: null,
      messageVi: "Sủi bọt khí mạnh do giải phóng khí CO2.",
      explanationVi: "Axit mạnh đẩy axit yếu (H2CO3) ra khỏi muối, H2CO3 không bền phân hủy thành CO2 và nước.",
      safetyNoteVi: "Phản ứng sủi bọt mạnh có thể làm văng hóa chất.", confidence: 1.0
    }
  },
  {
    r1: "AgNO3", r2: "NaCl",
    result: {
      hasReaction: true, equation: "AgNO3 + NaCl -> AgCl + NaNO3", productFormula: "AgCl, NaNO3",
      effectType: "PRECIPITATE", effectColor: null, gasFormula: null, precipitateFormula: "AgCl", precipitateColor: "#FFFFFF",
      messageVi: "Xuất hiện kết tủa trắng AgCl.",
      explanationVi: "Ion Ag+ kết hợp với ion Cl- tạo kết tủa Bạc clorua trắng, hóa đen ngoài ánh sáng.",
      safetyNoteVi: "Bạc nitrat có thể làm đen da, cẩn thận khi sử dụng.", confidence: 1.0
    }
  },
  {
    r1: "Fe", r2: "CuSO4",
    result: {
      hasReaction: true, equation: "Fe + CuSO4 -> FeSO4 + Cu", productFormula: "FeSO4, Cu",
      effectType: "COLOR_CHANGE", effectColor: "#A52A2A", gasFormula: null, precipitateFormula: null, precipitateColor: null,
      messageVi: "Màu xanh của dung dịch nhạt dần, có lớp kim loại màu đỏ bám trên đinh sắt.",
      explanationVi: "Sắt hoạt động hóa học mạnh hơn Đồng nên đẩy Đồng ra khỏi dung dịch muối.",
      safetyNoteVi: "An toàn, rửa tay sau khi thực hành.", confidence: 1.0
    }
  },
  {
    r1: "CaCO3", r2: "HCl",
    result: {
      hasReaction: true, equation: "CaCO3 + 2HCl -> CaCl2 + CO2 + H2O", productFormula: "CaCl2, CO2, H2O",
      effectType: "GAS_BUBBLE", effectColor: null, gasFormula: "CO2", precipitateFormula: null, precipitateColor: null,
      messageVi: "Đá vôi tan dần, sủi bọt khí CO2 không màu.",
      explanationVi: "Axit mạnh phản ứng với muối cacbonat giải phóng khí cacbonic.",
      safetyNoteVi: "An toàn, có thể thực hiện trên lớp.", confidence: 1.0
    }
  },
  {
    r1: "Na", r2: "H2O", // Note: H2O is not in the original 84 list, but NaOH + HCl produces it. We can map Na + H2O for fun. Actually, let's stick to the 84 list (which doesn't have H2O explicitly but let's assume it's water medium). Wait, H2O isn't in ALL_FORMULAE list, but HCl is an aqueous solution so it implies water. 
    result: {
      hasReaction: true, equation: "2Na + 2H2O -> 2NaOH + H2", productFormula: "NaOH, H2",
      effectType: "EXPLOSION", effectColor: null, gasFormula: "H2", precipitateFormula: null, precipitateColor: null,
      messageVi: "Kim loại Na bốc cháy, nổ lách tách trên mặt dung dịch và sinh ra khí không màu.",
      explanationVi: "Natri phản ứng mãnh liệt với nước tạo ra khí H2 và nhiệt lượng lớn làm bốc cháy H2.",
      safetyNoteVi: "CỰC KỲ NGUY HIỂM. Có nguy cơ cháy nổ văng kiềm vào mắt.", confidence: 1.0
    }
  },
  {
    r1: "NH3", r2: "HCl",
    result: {
      hasReaction: true, equation: "NH3 + HCl -> NH4Cl", productFormula: "NH4Cl",
      effectType: "PRECIPITATE", effectColor: null, gasFormula: null, precipitateFormula: "NH4Cl", precipitateColor: "#FFFFFF",
      messageVi: "Tạo ra khói trắng dày đặc (tinh thể NH4Cl nhỏ li ti).",
      explanationVi: "Khí Amoniac gặp khí Hidro clorua phản ứng ngay tạo thành muối amoni clorua ở dạng khói rắn.",
      safetyNoteVi: "Tránh hít phải khí NH3 và HCl, cần làm trong tủ hút.", confidence: 1.0
    }
  },
  {
    r1: "Fe", r2: "HCl",
    result: {
      hasReaction: true, equation: "Fe + 2HCl -> FeCl2 + H2", productFormula: "FeCl2, H2",
      effectType: "GAS_BUBBLE", effectColor: null, gasFormula: "H2", precipitateFormula: null, precipitateColor: null,
      messageVi: "Sắt tan dần, dung dịch chuyển màu lục nhạt, sủi bọt khí.",
      explanationVi: "Sắt phản ứng với axit HCl tạo ra muối sắt(II) và khí hidro.",
      safetyNoteVi: "Cẩn thận với khí hydro cháy nổ.", confidence: 1.0
    }
  },
  {
    r1: "NaOH", r2: "AlCl3",
    result: {
      hasReaction: true, equation: "AlCl3 + 3NaOH -> Al(OH)3 + 3NaCl", productFormula: "Al(OH)3, NaCl",
      effectType: "PRECIPITATE", effectColor: null, gasFormula: null, precipitateFormula: "Al(OH)3", precipitateColor: "#FFFFFF",
      messageVi: "Tạo kết tủa keo trắng Al(OH)3, nếu dư NaOH thì kết tủa sẽ tan lại.",
      explanationVi: "Ion Al3+ phản ứng với ion OH- tạo ra Nhôm hydroxit (kết tủa keo trắng).",
      safetyNoteVi: "Hóa chất an toàn, cẩn thận không dây vào mắt.", confidence: 1.0
    }
  }
];

function buildReactionKey(a, b) {
  return [a.trim().toUpperCase(), b.trim().toUpperCase()].sort().join("__");
}

const supaHeaders = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal,resolution=merge-duplicates",
};

async function insertToSupabase(record) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reaction_api_cache`, {
    method: "POST",
    headers: supaHeaders,
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase INSERT failed: HTTP ${res.status} — ${text}`);
  }
}

async function main() {
  console.log("🚀 Bắt đầu chèn dữ liệu thủ công vào Supabase...");
  let count = 0;
  for (const item of manualReactions) {
    const key = buildReactionKey(item.r1, item.r2);
    const now = new Date().toISOString();
    const record = {
      reaction_key: key,
      input_payload: JSON.stringify([item.r1, item.r2]),
      raw_prediction_response: "MANUAL_SEED",
      normalized_result: JSON.stringify(item.result),
      source: "MANUAL_SEED",
      confidence: item.result.confidence,
      verified: true,
      created_at: now,
      last_used_at: now,
    };

    try {
      await insertToSupabase(record);
      count++;
      console.log(`✅ Đã chèn thành công: ${item.r1} + ${item.r2}`);
    } catch (e) {
      console.error(`❌ Lỗi chèn ${item.r1} + ${item.r2}:`, e.message);
    }
  }
  console.log(`🎉 Hoàn tất! Đã chèn ${count} phản ứng.`);
}

main().catch(console.error);
