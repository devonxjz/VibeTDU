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
        basicExplanation: "Axit HCl và bazơ NaOH tác dụng với nhau tạo thành muối NaCl và nước. Đây là phản ứng trung hòa.",
        intermediateExplanation: "Ion H⁺ từ HCl kết hợp với ion OH⁻ từ NaOH tạo thành H₂O. Na⁺ và Cl⁻ là ion khán giả, không tham gia phản ứng.",
        advancedExplanation: "Phương trình ion rút gọn: H⁺(aq) + OH⁻(aq) → H₂O(l). ΔG < 0, phản ứng tự phát. Ka × Kb >> 1.",
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
        basicExplanation: "BaCl₂ và H₂SO₄ phản ứng tạo ra chất rắn màu trắng là BaSO₄. Đây là phản ứng trao đổi.",
        intermediateExplanation: "Ion Ba²⁺ kết hợp với ion SO₄²⁻ tạo thành hợp chất không tan BaSO₄. Các ion H⁺ và Cl⁻ vẫn ở dạng hòa tan.",
        advancedExplanation: "Phương trình ion rút gọn: Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)↓. Tích số tan Ksp của BaSO₄ rất nhỏ (~1.1×10⁻¹⁰), dẫn đến sự kết tủa gần như hoàn toàn.",
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
        basicExplanation: "AgNO₃ phản ứng với NaCl tạo ra chất rắn màu trắng là AgCl. Đây là phản ứng tạo kết tủa thường dùng để nhận biết muối clorua.",
        intermediateExplanation: "Ion Ag⁺ từ AgNO₃ kết hợp với ion Cl⁻ từ NaCl tạo thành tinh thể AgCl không tan trong nước. Na⁺ và NO₃⁻ là các ion khán giả.",
        advancedExplanation: "Phương trình ion rút gọn: Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓. Kết tủa này nhạy sáng và có thể phân hủy quang hóa tạo ra bạc kim loại có màu xám đen: 2AgCl(s) → 2Ag(s) + Cl₂(g).",
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
        basicExplanation: "CuSO₄ phản ứng với NaOH tạo ra chất rắn màu xanh lơ là Cu(OH)₂. Đây là phản ứng trao đổi tạo bazơ không tan.",
        intermediateExplanation: "Ion đồng (II) Cu²⁺ phản ứng với ion hydroxit OH⁻ tạo thành kết tủa đồng (II) hydroxit. Phản ứng này đặc trưng cho các muối của kim loại chuyển tiếp.",
        advancedExplanation: "Phương trình ion rút gọn: Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓. Trong lượng dư NaOH đặc, kết tủa này có thể hòa tan một phần tạo phức hydroxo [Cu(OH)₄]²⁻.",
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
        basicExplanation: "Kẽm phản ứng với axit HCl tạo ra khí hydro H₂ bay lên và dung dịch muối kẽm. Đây là phản ứng thế.",
        intermediateExplanation: "Kẽm (Zn) là kim loại hoạt động mạnh hơn hydro nên đẩy được H⁺ ra khỏi dung dịch axit. Quá trình này kèm theo sự chuyển electron từ Zn sang H⁺.",
        advancedExplanation: "Phản ứng oxi hóa - khử: Zn(s) → Zn²⁺(aq) + 2e⁻ (oxi hóa), 2H⁺(aq) + 2e⁻ → H₂(g)↑ (khử). Phương trình ion rút gọn: Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)↑.",
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
        basicExplanation: "Muối Na₂CO₃ phản ứng với axit HCl sinh ra khí cacbonic CO₂ sủi bọt mạnh. Đây là phản ứng đặc trưng của muối cacbonat với axit.",
        intermediateExplanation: "Ion CO₃²⁻ nhận proton từ H⁺ tạo thành axit cacbonic (H₂CO₃), chất này không bền và lập tức phân hủy thành nước và khí CO₂.",
        advancedExplanation: "Phương trình ion qua 2 nấc: CO₃²⁻ + H⁺ → HCO₃⁻, sau đó HCO₃⁻ + H⁺ → H₂CO₃ → H₂O(l) + CO₂(g)↑. Sự sủi bọt làm dịch chuyển cân bằng theo nguyên lý Le Chatelier.",
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
        basicExplanation: "KMnO₄ hòa tan trong H₂SO₄ tạo dung dịch màu tím đặc trưng. Môi trường axit giúp dung dịch này có tính tẩy rửa cực mạnh.",
        intermediateExplanation: "H₂SO₄ đóng vai trò cung cấp môi trường axit (ion H⁺) cần thiết để ion pemanganat (MnO₄⁻) có thể thể hiện tính oxi hóa tối đa trong các phản ứng tiếp theo.",
        advancedExplanation: "Sự hiện diện của H⁺ làm tăng thế điện cực chuẩn của bán phản ứng: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O (E° = +1.51V). Hỗn hợp này chưa có chất khử nên màu tím Mn(VII) vẫn giữ nguyên.",
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
        basicExplanation: "Sắt phản ứng với axit HCl giải phóng khí hydro H₂ và tạo ra dung dịch muối sắt màu lục nhạt.",
        intermediateExplanation: "Sắt đứng trước hydro trong dãy hoạt động hóa học, nên có khả năng nhường electron cho ion H⁺. HCl chỉ có tính oxi hóa ở ion H⁺ nên sắt chỉ lên mức oxi hóa +2.",
        advancedExplanation: "Phản ứng oxi hóa - khử: Fe(s) + 2H⁺(aq) → Fe²⁺(aq) + H₂(g)↑. Tốc độ phản ứng chậm hơn so với kẽm hoặc magie do thế điện cực tiêu chuẩn của Fe/Fe²⁺ (-0.44V) kém âm hơn so với Zn/Zn²⁺ (-0.76V).",
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
        basicExplanation: "Canxi phản ứng mạnh với nước sinh ra khí hydro H₂ và tạo thành dung dịch vẩn đục do có canxi hydroxit ít tan.",
        intermediateExplanation: "Canxi là kim loại kiềm thổ hoạt động mạnh, có thể khử nước ở nhiệt độ phòng. Phản ứng tỏa nhiều nhiệt và sinh ra dung dịch có tính bazơ mạnh.",
        advancedExplanation: "Phản ứng oxi hóa - khử: Ca(s) + 2H₂O(l) → Ca²⁺(aq) + 2OH⁻(aq) + H₂(g)↑. Do độ tan của Ca(OH)₂ khá nhỏ (~1.73 g/L ở 20°C), lượng sinh ra dư sẽ kết tủa tạo vẩn đục.",
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
        basicExplanation: "Magie phản ứng rất mãnh liệt với axit HCl, sinh ra nhiều khí hydro H₂. Magie là kim loại hoạt động mạnh.",
        intermediateExplanation: "Magie có khả năng nhường electron rất tốt, nên phản ứng oxi hóa - khử diễn ra nhanh chóng, giải phóng nhiều nhiệt và khí hydro.",
        advancedExplanation: "Phương trình ion rút gọn: Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)↑. Thế điện cực tiêu chuẩn Mg/Mg²⁺ là -2.37V, cho thấy tính khử rất mạnh, phản ứng tỏa nhiệt lớn (ΔH < 0) có thể làm sôi dung dịch.",
      };
    default:
      return NO_REACTION;
  }
}
