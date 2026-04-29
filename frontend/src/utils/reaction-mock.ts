import type { ReactionResult } from "@/types/api";

export const NO_REACTION: ReactionResult = {
  hasReaction: false,
};

export function getMockReaction(reactants: string[]): ReactionResult {
  const key = reactants
    .map((r) => r.toLowerCase())
    .sort()
    .join("+");

  switch (key) {
    case "hcl+naoh":
      return {
        hasReaction: true,
        equation: "HCl + NaOH → NaCl + H₂O",
        productFormula: "NaCl + H₂O",
        effectType: "COLOR_CHANGE",
        effectColor: "rgba(220,235,250,0.8)",
        messageVi: "Dung dịch trở nên trong suốt, hơi ấm lên. Đây là phản ứng trung hòa.",
        explanationVi: "Axit mạnh (HCl) tác dụng với bazơ mạnh (NaOH) tạo thành muối (NaCl) tan và nước, tỏa nhiệt nhẹ.",
        safetyNoteVi: "Phản ứng tỏa nhiệt nhẹ, an toàn khi thí nghiệm ở nồng độ loãng.",
      };
    case "bacl2+h2so4":
      return {
        hasReaction: true,
        equation: "BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl",
        productFormula: "BaSO₄ + HCl",
        effectType: "PRECIPITATE",
        precipitateColor: "#ffffff",
        messageVi: "Xuất hiện kết tủa trắng đục không tan trong axit.",
        explanationVi: "Ion bari (Ba²⁺) kết hợp với ion sunfat (SO₄²⁻) tạo thành muối bari sunfat (BaSO₄) kết tủa trắng, không tan trong nước và axit.",
        safetyNoteVi: "BaCl2 là hóa chất độc, tránh nuốt phải hoặc hít phải bột.",
      };
    case "agno3+nacl":
      return {
        hasReaction: true,
        equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
        productFormula: "AgCl + NaNO₃",
        effectType: "PRECIPITATE",
        precipitateColor: "#f5f5f5",
        messageVi: "Xuất hiện ngay lập tức kết tủa trắng như sữa.",
        explanationVi: "Ion bạc (Ag⁺) kết hợp với ion clorua (Cl⁻) tạo thành bạc clorua (AgCl) kết tủa trắng, hóa đen khi tiếp xúc ánh sáng.",
        safetyNoteVi: "AgNO3 có thể làm đen da khi tiếp xúc, cần mang găng tay.",
      };
    case "cuso4+naoh":
      return {
        hasReaction: true,
        equation: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
        productFormula: "Cu(OH)₂ + Na₂SO₄",
        effectType: "PRECIPITATE",
        precipitateColor: "#1565C0",
        messageVi: "Xuất hiện kết tủa dạng keo màu xanh lơ.",
        explanationVi: "Ion đồng (Cu²⁺) phản ứng với ion kiềm (OH⁻) tạo thành đồng(II) hydroxit kết tủa xanh lơ đặc trưng.",
        safetyNoteVi: "Tránh tiếp xúc NaOH trực tiếp với da (ăn mòn).",
      };
    case "hcl+zn":
      return {
        hasReaction: true,
        equation: "Zn + 2HCl → ZnCl₂ + H₂↑",
        productFormula: "ZnCl₂ + H₂",
        effectType: "GAS_BUBBLE",
        gasFormula: "H2",
        messageVi: "Mảnh kẽm tan dần, có nhiều bọt khí không màu thoát ra.",
        explanationVi: "Kẽm (kim loại đứng trước H) đẩy hydro ra khỏi dung dịch axit, tạo muối kẽm clorua và giải phóng khí H₂.",
        safetyNoteVi: "Khí H2 dễ cháy nổ, tránh xa nguồn lửa hở.",
      };
    case "hcl+na2co3":
      return {
        hasReaction: true,
        equation: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑",
        productFormula: "NaCl + H₂O + CO₂",
        effectType: "GAS_BUBBLE",
        gasFormula: "CO2",
        messageVi: "Sủi bọt khí mạnh mẽ, không màu.",
        explanationVi: "Axit clohydric phản ứng với muối cacbonat giải phóng khí cacbonic (CO₂) do axit cacbonic không bền.",
        safetyNoteVi: "Phản ứng sinh khí nhanh có thể gây bắn dung dịch ra ngoài.",
      };
    case "h2so4+kmno4":
      return {
        hasReaction: true,
        equation: "2KMnO₄ + H₂SO₄ → K₂SO₄ + 2MnO₄⁻ (môi trường)",
        productFormula: "K₂SO₄ + MnO₄⁻",
        effectType: "COLOR_CHANGE",
        effectColor: "#E040FB",
        messageVi: "Dung dịch có màu tím hồng rất đậm đặc trưng.",
        explanationVi: "Kali pemanganat khi hòa tan trong môi trường axit mạnh tạo thành dung dịch có tính oxy hóa cực mạnh và giữ nguyên màu tím của ion MnO₄⁻.",
        safetyNoteVi: "Hỗn hợp có tính oxy hóa rất mạnh, tuyệt đối không thêm chất dễ cháy vào hỗn hợp này.",
      };
    case "fe+hcl":
      return {
        hasReaction: true,
        equation: "Fe + 2HCl → FeCl₂ + H₂↑",
        productFormula: "FeCl₂ + H₂",
        effectType: "GAS_BUBBLE",
        gasFormula: "H2",
        messageVi: "Sắt tan chậm, sủi bọt khí nhẹ không màu, dung dịch hơi lục nhạt.",
        explanationVi: "Sắt phản ứng chậm với axit HCl giải phóng khí hydro và tạo muối sắt(II) clorua.",
        safetyNoteVi: "Có sinh khí H2 dễ cháy.",
      };
    case "ca+h2o":
      return {
        hasReaction: true,
        equation: "Ca + 2H₂O → Ca(OH)₂ + H₂↑",
        productFormula: "Ca(OH)₂ + H₂",
        effectType: "GAS_BUBBLE",
        gasFormula: "H2",
        messageVi: "Phản ứng mãnh liệt, canxi chạy trên mặt nước sinh khí, dung dịch hóa đục.",
        explanationVi: "Canxi tác dụng mạnh với nước sinh khí H₂ và canxi hydroxit ít tan, phần không tan lơ lửng làm vẩn đục dung dịch.",
        safetyNoteVi: "Phản ứng tỏa nhiệt mạnh, sinh khí H2 kết hợp oxy dễ gây nổ nhỏ.",
      };
    case "hcl+mg":
      return {
        hasReaction: true,
        equation: "Mg + 2HCl → MgCl₂ + H₂↑",
        productFormula: "MgCl₂ + H₂",
        effectType: "GAS_BUBBLE",
        gasFormula: "H2",
        messageVi: "Mảnh magie phản ứng mãnh liệt, tan rất nhanh và sủi bọt khí cực mạnh.",
        explanationVi: "Magie là kim loại hoạt động mạnh, đẩy hydro ra khỏi dung dịch axit rất nhanh tỏa nhiều nhiệt.",
        safetyNoteVi: "Phản ứng bùng phát mạnh, tránh thao tác với lượng quá lớn.",
      };
    default:
      return NO_REACTION;
  }
}
