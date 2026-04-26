package com.example.virtualchemistrylab.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.config.AppProperties;
import com.virtualchemistrylab.entity.ApiErrorLog;
import com.virtualchemistrylab.repository.ApiErrorLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * AI client hỗ trợ hai provider:
 *
 *  1. Google Gemini (AIzaSy… key)  – URL chứa "generativelanguage.googleapis.com"
 *     hoặc khi app.ai.provider=gemini
 *  2. OpenAI-compatible             – mọi URL khác
 *
 * Nếu app.ai.mock-mode=true (default) → trả mock response không cần internet.
 * API key KHÔNG BAO GIỜ được in ra log.
 */
@Component
public class AiClient {

    private static final Logger log = LoggerFactory.getLogger(AiClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // Gemini endpoint template
    // Key được append theo query param: ?key=API_KEY
    private static final String GEMINI_BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models";

    private final WebClient webClient;
    private final AppProperties appProperties;
    private final ApiErrorLogRepository apiErrorLogRepository;
    private final AtomicInteger currentKeyIndex = new AtomicInteger(0);

    public AiClient(WebClient webClient,
                    AppProperties appProperties,
                    ApiErrorLogRepository apiErrorLogRepository) {
        this.webClient = webClient;
        this.appProperties = appProperties;
        this.apiErrorLogRepository = apiErrorLogRepository;
    }

    // ─── Public interface ────────────────────────────────────────────────────────

    /**
     * Predict chemical reaction. Returns raw JSON string or null on failure.
     */
    public String predictReaction(List<String> reactantFormulae) {
        if (appProperties.getAi().isMockMode()) {
            log.info("[AI] Mock mode – returning built-in response for: {}", reactantFormulae);
            return getMockReaction(reactantFormulae);
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty()) {
            log.warn("[AI] No API keys – falling back to mock");
            return getMockReaction(reactantFormulae);
        }

        String prompt = buildReactionPrompt(reactantFormulae);

        String firstKey = apiKeys.get(0).contains("#") ? apiKeys.get(0).split("#")[0].trim() : apiKeys.get(0).trim();
        String result = null;

        if (isGeminiKey(firstKey) || isGeminiUrl(appProperties.getAi().getApiUrl())) {
            result = callGemini(prompt);
        } else {
            result = callOpenAi(prompt);
        }
        
        if (result == null) {
            log.warn("[AI] AI call failed or all keys exhausted. Falling back to mock.");
            return getMockReaction(reactantFormulae);
        }
        return result;
    }

    /**
     * Answer a free-form chemistry question. Returns Vietnamese text or null.
     */
    public String askQuestion(String question, String reactionContext) {
        if (appProperties.getAi().isMockMode()) {
            return "Đây là câu trả lời mẫu (mock mode). "
                    + "Hãy tắt mock mode và cấu hình AI_API_KEY để nhận câu trả lời thực từ Gemini.";
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty()) {
            return "Hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }

        String prompt = "Bạn là trợ lý hóa học giáo dục. Trả lời ngắn gọn, chính xác bằng tiếng Việt.\n"
                + "Ngữ cảnh phản ứng:\n" + reactionContext
                + "\n\nCâu hỏi: " + question;

        String firstKey = apiKeys.get(0).contains("#") ? apiKeys.get(0).split("#")[0].trim() : apiKeys.get(0).trim();
        String result = null;

        if (isGeminiKey(firstKey) || isGeminiUrl(appProperties.getAi().getApiUrl())) {
            result = callGemini(prompt);
        } else {
            result = callOpenAi(prompt);
        }
        
        if (result == null) {
            return "Xin lỗi, hệ thống AI hiện đang không khả dụng hoặc bị quá tải. Vui lòng thử lại sau.";
        }
        return result;
    }

    // ─── Google Gemini ──────────────────────────────────────────────────────────

    private String callGemini(String prompt) {
        String model = appProperties.getAi().getModel();
        // Default Gemini model if user didn't override
        if (model == null || model.isBlank() || model.startsWith("gpt-")) {
            model = "gemini-2.0-flash";
        }

        // Build Gemini request body format
        String requestBody;
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", 1024
                    )
            );
            requestBody = MAPPER.writeValueAsString(body);
        } catch (Exception e) {
            log.error("[AI-Gemini] Failed to build request: {}", e.getMessage());
            return null;
        }

        log.info("[AI-Gemini] Calling Gemini model: {}", model);

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        int totalKeys = apiKeys != null ? apiKeys.size() : 0;

        for (int i = 0; i < totalKeys; i++) {
            int index = Math.abs(currentKeyIndex.getAndIncrement() % totalKeys);
            String rawKey = apiKeys.get(index);
            String apiKey = rawKey.contains("#") ? rawKey.split("#")[0].trim() : rawKey.trim();
            String url = GEMINI_BASE_URL + "/" + model + ":generateContent?key=" + apiKey;

            try {
                String response = webClient.post()
                        .uri(url)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(TIMEOUT)
                        .block();

                return extractGeminiContent(response);

            } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                if (e.getStatusCode().value() == 429) {
                    log.warn("[AI-Gemini] Key index {} exceeded quota (429). Rotating...", index);
                    continue;
                }
                log.error("[AI-Gemini] Call failed (HTTP {}): {}", e.getStatusCode().value(), e.getMessage());
                saveErrorLog("AI_GEMINI", prompt.substring(0, Math.min(200, prompt.length())), e.getMessage());
                return null;
            } catch (Exception e) {
                log.error("[AI-Gemini] Call failed: {}", e.getMessage());
                saveErrorLog("AI_GEMINI", prompt.substring(0, Math.min(200, prompt.length())), e.getMessage());
                return null;
            }
        }
        
        log.error("[AI-Gemini] All {} keys have exceeded quota.", totalKeys);
        return null;
    }

    /**
     * Extract text content from Gemini response:
     * { "candidates":[{"content":{"parts":[{"text":"..."}]}}] }
     */
    private String extractGeminiContent(String response) {
        if (response == null) return null;
        try {
            JsonNode root = MAPPER.readTree(response);
            String text = root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
            // Strip markdown code blocks if AI wrapped JSON in ```json ... ```
            return stripMarkdownCodeBlock(text);
        } catch (Exception e) {
            log.error("[AI-Gemini] Failed to extract content: {}", e.getMessage());
            return null;
        }
    }

    // ─── OpenAI-compatible ──────────────────────────────────────────────────────

    private String callOpenAi(String prompt) {
        List<String> apiKeys = appProperties.getAi().getApiKeys();
        String rawKey = apiKeys != null && !apiKeys.isEmpty() ? apiKeys.get(0) : "";
        String apiKey = rawKey.contains("#") ? rawKey.split("#")[0].trim() : rawKey.trim();
        String requestBody;
        try {
            Map<String, Object> body = Map.of(
                    "model", appProperties.getAi().getModel(),
                    "messages", List.of(Map.of("role", "user", "content", prompt)),
                    "temperature", 0.3,
                    "max_tokens", 800
            );
            requestBody = MAPPER.writeValueAsString(body);
        } catch (Exception e) {
            return null;
        }

        log.info("[AI-OpenAI] Calling OpenAI-compatible API");

        try {
            String response = webClient.post()
                    .uri(appProperties.getAi().getApiUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            return extractOpenAiContent(response);

        } catch (Exception e) {
            log.error("[AI-OpenAI] Call failed: {}", e.getMessage());
            saveErrorLog("AI_OPENAI", "(request)", e.getMessage());
            return null;
        }
    }

    private String extractOpenAiContent(String response) {
        if (response == null) return null;
        try {
            JsonNode root = MAPPER.readTree(response);
            String text = root.path("choices").get(0)
                    .path("message").path("content").asText();
            return stripMarkdownCodeBlock(text);
        } catch (Exception e) {
            log.error("[AI-OpenAI] Failed to extract content: {}", e.getMessage());
            return null;
        }
    }

    // ─── Prompt builder ──────────────────────────────────────────────────────────

    private String buildReactionPrompt(List<String> reactants) {
        return """
                Bạn là hệ thống mô phỏng phản ứng hóa học giáo dục.
                Các chất phản ứng: %s

                Hãy dự đoán kết quả phản ứng và trả về JSON theo đúng schema sau (KHÔNG kèm markdown, KHÔNG giải thích ngoài JSON):
                {
                  "hasReaction": boolean,
                  "equation": string | null,
                  "productFormula": string | null,
                  "effectType": "NONE" | "COLOR_CHANGE" | "PRECIPITATE" | "GAS_BUBBLE" | "HEAT" | "EXPLOSION",
                  "effectColor": string | null,
                  "gasFormula": string | null,
                  "precipitateFormula": string | null,
                  "precipitateColor": string | null,
                  "messageVi": string,
                  "explanationVi": string,
                  "safetyNoteVi": string,
                  "confidence": number (0.0-1.0)
                }

                Quy tắc bắt buộc:
                - effectType phải thuộc đúng các giá trị enum trên
                - BẮT BUỘC NHẬN DIỆN phản ứng trung hòa (Axit + Bazơ -> Muối + Nước).
                - BẮT BUỘC cung cấp `productFormula` chứa CHỈ các sản phẩm của phản ứng (ví dụ: "Cu(OH)2 + Na2SO4").
                - Phải trả về TẤT CẢ sản phẩm trong `productFormula`.
                - BẮT BUỘC có mô tả màu sắc của sản phẩm trong `messageVi` và `explanationVi`. Ví dụ: Na2SO4 có màu trắng, Cu(OH)2 kết tủa xanh.
                - Đối với các kết tủa, `precipitateColor` phải là mã màu HEX chính xác.
                - messageVi, explanationVi, safetyNoteVi phải bằng tiếng Việt
                - Trả về DUY NHẤT JSON thuần, không markdown
                """.formatted(String.join(" + ", reactants));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    /** Gemini API keys start with "AIzaSy" */
    private boolean isGeminiKey(String key) {
        return key != null && key.startsWith("AIzaSy");
    }

    private boolean isGeminiUrl(String url) {
        return url != null && url.contains("generativelanguage.googleapis.com");
    }

    /** Remove ```json ... ``` wrapper that some AI models add despite instructions */
    private String stripMarkdownCodeBlock(String text) {
        if (text == null) return null;
        String t = text.trim();
        if (t.startsWith("```")) {
            t = t.replaceFirst("```(json)?\\s*", "");
            t = t.replaceAll("\\s*```$", "");
        }
        return t.trim();
    }

    private void saveErrorLog(String api, String request, String error) {
        try {
            apiErrorLogRepository.save(ApiErrorLog.builder()
                    .apiName(api)
                    .requestPayload(request)
                    .errorMessage(error)
                    .build());
        } catch (Exception ignored) {}
    }

    // ─── Mock responses ──────────────────────────────────────────────────────────

    private String getMockReaction(List<String> formulae) {
        String key = formulae.stream()
                .map(String::trim).map(String::toUpperCase)
                .sorted().reduce("", (a, b) -> a.isBlank() ? b : a + "__" + b);

        if (key.equals("CACO3__HCL")) {
            return """
                    {"hasReaction":true,"equation":"2HCl + CaCO3 → CaCl2 + CO2↑ + H2O","productFormula":"CaCl2 + CO2 + H2O","effectType":"GAS_BUBBLE","effectColor":"#FFFFFF","gasFormula":"CO2","precipitateFormula":null,"precipitateColor":null,"messageVi":"Có khí CO2 thoát ra, quan sát thấy hiện tượng sủi bọt.","explanationVi":"Axit HCl phản ứng với muối carbonate CaCO3 tạo ra muối CaCl2, nước và khí CO2.","safetyNoteVi":"Đây là mô phỏng giáo dục, không thực hiện phản ứng thật nếu không có hướng dẫn an toàn.","confidence":0.97}""";
        }
        if (key.equals("CUSO4__NAOH")) {
            return """
                    {"hasReaction":true,"equation":"CuSO4 + 2NaOH → Cu(OH)2↓ + Na2SO4","productFormula":"Cu(OH)2 + Na2SO4","effectType":"PRECIPITATE","effectColor":"#1E90FF","gasFormula":null,"precipitateFormula":"Cu(OH)2","precipitateColor":"#1565C0","messageVi":"Xuất hiện kết tủa xanh lam Cu(OH)2.","explanationVi":"Ion Cu²⁺ từ CuSO4 phản ứng với ion OH⁻ từ NaOH tạo kết tủa Cu(OH)2 màu xanh lam.","safetyNoteVi":"Đây là mô phỏng giáo dục.","confidence":0.98}""";
        }
        if (key.equals("AGNO3__NACL")) {
            return """
                    {"hasReaction":true,"equation":"AgNO3 + NaCl → AgCl↓ + NaNO3","productFormula":"AgCl + NaNO3","effectType":"PRECIPITATE","effectColor":"#F5F5F5","gasFormula":null,"precipitateFormula":"AgCl","precipitateColor":"#EEEEEE","messageVi":"Xuất hiện kết tủa trắng AgCl.","explanationVi":"Ion Ag⁺ từ AgNO3 kết hợp với ion Cl⁻ từ NaCl tạo kết tủa AgCl trắng không tan trong nước.","safetyNoteVi":"Đây là mô phỏng giáo dục.","confidence":0.98}""";
        }
        if (key.equals("HCL__NAOH")) {
            return """
                    {"hasReaction":true,"equation":"HCl + NaOH → NaCl + H2O","productFormula":"NaCl + H2O","effectType":"HEAT","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Phản ứng trung hòa, toả nhiệt nhẹ, dung dịch trở nên trung tính.","explanationVi":"Axit mạnh HCl phản ứng với bazơ mạnh NaOH trong phản ứng trung hòa tạo muối NaCl và nước, đồng thời toả nhiệt.","safetyNoteVi":"Đây là mô phỏng giáo dục.","confidence":0.96}""";
        }
        // Unknown pair
        return """
                {"hasReaction":false,"equation":null,"productFormula":null,"effectType":"NONE","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Hai chất này không phản ứng với nhau trong điều kiện hiện tại.","explanationVi":"Điều kiện phản ứng không phù hợp hoặc cặp chất này không xảy ra phản ứng trong phạm vi mô phỏng.","safetyNoteVi":null,"confidence":1.0}""";
    }
}
