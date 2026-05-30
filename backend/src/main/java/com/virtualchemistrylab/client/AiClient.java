package com.virtualchemistrylab.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.config.AppProperties;
import com.virtualchemistrylab.dto.ChatMessage;
import com.virtualchemistrylab.entity.ApiErrorLog;
import com.virtualchemistrylab.exception.ApiException;
import com.virtualchemistrylab.repository.ApiErrorLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.Objects;

/**
 * AI client supporting two providers:
 *
 *  1. Google Gemini (AIzaSy... key) - URL contains "generativelanguage.googleapis.com"
 *     or when app.ai.provider=gemini
 *  2. OpenAI-compatible             - all other URLs
 *
 * If app.ai.mock-mode=true (default) -> returns mock response without internet.
 * API key is NEVER printed to logs.
 */
@Component
public class AiClient {

    private static final Logger log = LoggerFactory.getLogger(AiClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(10);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // Gemini endpoint template
    // Key is appended as query param: ?key=API_KEY
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
    public String predictReaction(List<String> reactantFormulae, Double temperature, Double pressure, String catalyst) {
        String key = reactantFormulae.stream()
                .map(String::trim).map(String::toUpperCase)
                .sorted().reduce("", (a, b) -> a.isBlank() ? b : a + "__" + b);

        if (isPresetReactionKey(key) || appProperties.getAi().isMockMode()) {
            log.info("[AI] Preset or Mock mode – returning built-in response for: {}", reactantFormulae);
            return getMockReaction(reactantFormulae);
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty()) {
            log.warn("[AI] No API keys – falling back to mock");
            return getMockReaction(reactantFormulae);
        }

        String prompt = buildReactionPrompt(reactantFormulae, temperature, pressure, catalyst);

        String firstKey = cleanApiKey(apiKeys.get(0));
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
            return getMockChatResponse(question, reactionContext);
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty() || cleanApiKey(apiKeys.get(0)).isBlank()) {
            return getMockChatResponse(question, reactionContext);
        }

        String prompt = "You are an educational chemistry assistant. Answer concisely and accurately in Vietnamese.\n"
                + "Reaction context:\n" + reactionContext
                + "\n\nQuestion: " + question;

        String firstKey = cleanApiKey(apiKeys.get(0));
        String result = null;

        if (isGeminiKey(firstKey) || isGeminiUrl(appProperties.getAi().getApiUrl())) {
            result = callGemini(prompt);
        } else {
            result = callOpenAi(prompt);
        }
        
        if (result == null) {
            log.warn("[AI] AI call failed or all keys exhausted. Falling back to mock chat.");
            return getMockChatResponse(question, reactionContext);
        }
        return result;
    }

    /**
     * Multi-turn chat (Gemini native contents[] format).
     * history roles must be "user" | "model".
     */
    public String chat(List<ChatMessage> history, String reactionContext) {
        if (appProperties.getAi().isMockMode()) {
            return getMockChatResponse(getLatestUserQuestion(history), reactionContext);
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty() || cleanApiKey(apiKeys.get(0)).isBlank()) {
            return getMockChatResponse(getLatestUserQuestion(history), reactionContext);
        }

        List<ChatMessage> cleaned = sanitizeHistory(history);

        String systemText = "You are an educational chemistry assistant. Answer concisely and accurately in Vietnamese.\n"
                + "If the question relates to a reaction, base your answer on the reaction context below.\n"
                + "Reaction context:\n" + (reactionContext == null ? "No reaction context." : reactionContext);

        String firstKey = cleanApiKey(apiKeys.get(0));

        String result;
        if (isGeminiKey(firstKey) || isGeminiUrl(appProperties.getAi().getApiUrl())) {
            result = callGeminiChat(systemText, cleaned);
        } else {
            result = callOpenAiChat(systemText, cleaned, firstKey);
        }
        
        if (result == null) {
            log.warn("[AI] Chat call failed or all keys exhausted. Falling back to mock chat.");
            return getMockChatResponse(getLatestUserQuestion(history), reactionContext);
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
            String apiKey = cleanApiKey(rawKey);
            String url = GEMINI_BASE_URL + "/" + model + ":generateContent?key=" + apiKey;

            try {
                String response = webClient.post()
                        .uri(url)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
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

    private String callGeminiChat(String systemInstruction, List<ChatMessage> history) {
        String model = appProperties.getAi().getModel();
        if (model == null || model.isBlank() || model.startsWith("gpt-")) {
            model = "gemini-2.0-flash";
        }

        String requestBody;
        try {
            List<Map<String, Object>> contents = history.stream()
                    .map(m -> Map.<String, Object>of(
                            "role", m.getRole(),
                            "parts", List.of(Map.of("text", m.getContent()))
                    ))
                    .toList();

            Map<String, Object> body = Map.of(
                    "systemInstruction", Map.of(
                            "parts", List.of(Map.of("text", systemInstruction))
                    ),
                    "contents", contents,
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", 1024
                    )
            );

            requestBody = MAPPER.writeValueAsString(body);
        } catch (Exception e) {
            log.error("[AI-Gemini] Failed to build chat request: {}", e.getMessage());
            return null;
        }

        log.info("[AI-Gemini] Calling Gemini chat model: {}", model);

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        int totalKeys = apiKeys != null ? apiKeys.size() : 0;

        for (int i = 0; i < totalKeys; i++) {
            int index = Math.abs(currentKeyIndex.getAndIncrement() % totalKeys);
            String rawKey = apiKeys.get(index);
            String apiKey = cleanApiKey(rawKey);
            String url = GEMINI_BASE_URL + "/" + model + ":generateContent?key=" + apiKey;

            try {
                String response = webClient.post()
                        .uri(url)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
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
                log.error("[AI-Gemini] Chat call failed (HTTP {}): {}", e.getStatusCode().value(), e.getMessage());
                saveErrorLog("AI_GEMINI_CHAT", "(chat)", e.getMessage());
                return null;
            } catch (Exception e) {
                log.error("[AI-Gemini] Chat call failed: {}", e.getMessage());
                saveErrorLog("AI_GEMINI_CHAT", "(chat)", e.getMessage());
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
        String apiKey = cleanApiKey(rawKey);
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
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
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

    private String callOpenAiChat(String systemInstruction, List<ChatMessage> history, String apiKey) {
        String requestBody;
        try {
            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemInstruction));

            for (ChatMessage m : history) {
                String role = Objects.equals(m.getRole(), "model") ? "assistant" : "user";
                messages.add(Map.of("role", role, "content", m.getContent()));
            }

            Map<String, Object> body = Map.of(
                    "model", appProperties.getAi().getModel(),
                    "messages", messages,
                    "temperature", 0.3,
                    "max_tokens", 800
            );
            requestBody = MAPPER.writeValueAsString(body);
        } catch (Exception e) {
            log.error("[AI-OpenAI] Failed to build chat request: {}", e.getMessage());
            return null;
        }

        log.info("[AI-OpenAI] Calling OpenAI-compatible chat API");

        try {
            String response = webClient.post()
                    .uri(appProperties.getAi().getApiUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            return extractOpenAiContent(response);
        } catch (Exception e) {
            log.error("[AI-OpenAI] Chat call failed: {}", e.getMessage());
            saveErrorLog("AI_OPENAI_CHAT", "(chat)", e.getMessage());
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

    private String buildReactionPrompt(List<String> reactants, Double temp, Double pres, String cat) {
        String envStr = String.format("Temperature: %s C, Pressure: %s atm, Catalyst: %s", 
            temp != null ? temp : "25", pres != null ? pres : "1", cat != null ? cat : "None");
        return """
                You are an educational chemistry reaction simulation system.
                Reactants: %s
                Environmental conditions: %s

                Predict the reaction result and return JSON according to the following schema (NO markdown, NO explanation outside JSON):
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
                  "basicExplanation": string,
                  "intermediateExplanation": string,
                  "advancedExplanation": string,
                  "safetyNoteVi": string,
                  "confidence": number (0.0-1.0),
                  "requiredTemperatureMin": number | null,
                  "requiredTemperatureLabel": string | null,
                  "requiredCatalyst": string | null,
                  "requiredPressureMin": number | null
                }

                Mandatory rules:
                - effectType MUST be one of the exact enum values above
                - MUST identify neutralization reactions (Acid + Base -> Salt + Water).
                - MUST provide `productFormula` containing ONLY the reaction products (e.g., "Cu(OH)2 + Na2SO4").
                - MUST return ALL products in `productFormula`.
                - MUST include color description of products in `messageVi` and `explanationVi`. E.g., Na2SO4 is white, Cu(OH)2 is blue precipitate.
                - For precipitates, `precipitateColor` must be an exact HEX color code.
                - messageVi, explanationVi, basicExplanation, intermediateExplanation, advancedExplanation, safetyNoteVi MUST be in Vietnamese
                - basicExplanation: simple explanation for middle school level
                - intermediateExplanation: detailed explanation with ionic equations
                - advancedExplanation: university level explanation including thermodynamics/kinetics
                - If reaction requires heating (>100°C), set requiredTemperatureMin
                - If reaction requires catalyst, set requiredCatalyst
                - If reaction requires high pressure (>1 atm), set requiredPressureMin
                - Return ONLY pure JSON, no markdown
                """.formatted(String.join(" + ", reactants), envStr);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    public boolean isPresetReactionKey(String key) {
        if (key == null) return false;
        return key.equals("CACO3__HCL") || key.equals("CCAO3__CLH")
                || key.equals("CUSO4__NAOH") || key.equals("CUSO4__HNAO") || key.equals("CUO4S__HNAO")
                || key.equals("HCL__ZN") || key.equals("CLH__ZN")
                || key.equals("H2SO4__KMNO4") || key.equals("H2OS4__KMNO4")
                || key.equals("AGNO3__NACL") || key.equals("AGNO3__CLNA")
                || key.equals("HCL__NAOH") || key.equals("CLH__HNAO")
                || key.equals("HCL__NA") || key.equals("CLH__NA")
                || key.equals("H2__N2") || key.equals("N2__H2")
                || key.equals("O2__SO2") || key.equals("SO2__O2") || key.equals("O2__O2S")
                || key.equals("CU__O2") || key.equals("O2__CU");
    }

    /** Gemini API keys start with "AIzaSy" */
    private boolean isGeminiKey(String key) {
        return key != null && key.startsWith("AIzaSy");
    }

    private boolean isGeminiUrl(String url) {
        return url != null && url.contains("generativelanguage.googleapis.com");
    }

    private String cleanApiKey(String rawKey) {
        if (rawKey == null) return "";
        return rawKey.contains("#") ? rawKey.split("#")[0].trim() : rawKey.trim();
    }

    private List<ChatMessage> sanitizeHistory(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            throw new ApiException("AI_CHAT_EMPTY_HISTORY", HttpStatus.BAD_REQUEST);
        }

        List<ChatMessage> nonBlank = history.stream()
                .filter(Objects::nonNull)
                .map(m -> ChatMessage.builder()
                        .role(m.getRole() == null ? null : m.getRole().trim())
                        .content(m.getContent() == null ? null : m.getContent().trim())
                        .build())
                .filter(m -> m.getRole() != null && !m.getRole().isBlank())
                .filter(m -> m.getContent() != null && !m.getContent().isBlank())
                .toList();

        int firstUserIdx = -1;
        for (int i = 0; i < nonBlank.size(); i++) {
            if ("user".equals(nonBlank.get(i).getRole())) {
                firstUserIdx = i;
                break;
            }
        }
        if (firstUserIdx < 0) {
            throw new ApiException("AI_CHAT_EMPTY_HISTORY", HttpStatus.BAD_REQUEST);
        }

        List<ChatMessage> trimmed = nonBlank.subList(firstUserIdx, nonBlank.size());
        List<ChatMessage> merged = new ArrayList<>();

        for (ChatMessage m : trimmed) {
            if (merged.isEmpty()) {
                merged.add(m);
                continue;
            }
            ChatMessage last = merged.get(merged.size() - 1);
            if (Objects.equals(last.getRole(), m.getRole())) {
                last.setContent(last.getContent() + "\n\n" + m.getContent());
            } else {
                merged.add(m);
            }
        }

        if (merged.isEmpty() || !"user".equals(merged.get(0).getRole())) {
            throw new ApiException("AI_CHAT_EMPTY_HISTORY", HttpStatus.BAD_REQUEST);
        }

        return merged;
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

        if (key.equals("CACO3__HCL") || key.equals("CCAO3__CLH")) {
            return """
                    {"hasReaction":true,"equation":"2HCl + CaCO3 -> CaCl2 + CO2 + H2O","productFormula":"CaCl2 + CO2 + H2O","effectType":"GAS_BUBBLE","effectColor":"#FFFFFF","gasFormula":"CO2","precipitateFormula":null,"precipitateColor":null,"messageVi":"Khí CO2 thoát ra, sủi bọt khí mạnh.","explanationVi":"Axit HCl tác dụng với muối cacbonat CaCO3 tạo thành muối CaCl2, nước và khí CO2.","basicExplanation":"Axit HCl tác dụng với đá vôi (CaCO3) sinh ra khí CO2 sủi bọt.","intermediateExplanation":"Ion H+ phản ứng với CO3(2-) tạo ra H2CO3 kém bền, phân hủy thành CO2 và H2O.","advancedExplanation":"Phản ứng hòa tan muối rắn nhờ cung cấp H+ làm dịch chuyển cân bằng hòa tan của CaCO3, sinh ra khí CO2.","safetyNoteVi":"Đây là mô phỏng giáo dục; không thực hiện ngoài đời thực khi không có hướng dẫn an toàn.","confidence":0.97,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("CUSO4__NAOH") || key.equals("CUSO4__HNAO") || key.equals("CUO4S__HNAO")) {
            return """
                    {"hasReaction":true,"equation":"CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4","productFormula":"Cu(OH)2 + Na2SO4","effectType":"PRECIPITATE","effectColor":"#1E90FF","gasFormula":null,"precipitateFormula":"Cu(OH)2","precipitateColor":"#1565C0","messageVi":"Kết tủa màu xanh lam Cu(OH)2 xuất hiện.","explanationVi":"Ion Cu2+ từ CuSO4 kết hợp với ion OH- từ NaOH tạo thành kết tủa Cu(OH)2 không tan.","basicExplanation":"CuSO4 phản ứng với NaOH tạo ra chất rắn màu xanh lơ là Cu(OH)2.","intermediateExplanation":"Ion đồng (II) Cu2+ phản ứng với ion hydroxit OH- tạo thành kết tủa đồng (II) hydroxit.","advancedExplanation":"Phương trình ion rút gọn: Cu2+(aq) + 2OH-(aq) -> Cu(OH)2(s). Kết tủa này tan trong dung dịch NH3.","safetyNoteVi":"Mô phỏng giáo dục.","confidence":0.98,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("HCL__ZN") || key.equals("CLH__ZN")) {
            return """
                    {"hasReaction":true,"equation":"Zn + 2HCl -> ZnCl2 + H2","productFormula":"ZnCl2 + H2","effectType":"GAS_BUBBLE","effectColor":"#FFFFFF","gasFormula":"H2","precipitateFormula":null,"precipitateColor":null,"messageVi":"Mảnh kẽm tan dần, có nhiều bọt khí không màu thoát ra.","explanationVi":"Kẽm (kim loại đứng trước H) đẩy hydro ra khỏi dung dịch axit, tạo muối kẽm clorua và giải phóng khí H2.","basicExplanation":"Kẽm phản ứng với axit HCl tạo ra khí hydro H2 bay lên và dung dịch muối kẽm. Đây là phản ứng thế.","intermediateExplanation":"Kẽm (Zn) là kim loại hoạt động mạnh hơn hydro nên đẩy được H+ ra khỏi dung dịch axit. Quá trình này kèm theo sự chuyển electron từ Zn sang H+.","advancedExplanation":"Phản ứng oxi hóa - khử: Zn(s) -> Zn2+(aq) + 2e- (oxi hóa), 2H+(aq) + 2e- -> H2(g) (khử). Phương trình ion rút gọn: Zn(s) + 2H+(aq) -> Zn2+(aq) + H2(g).","safetyNoteVi":"Khí H2 dễ cháy nổ, tránh xa nguồn lửa hở.","confidence":0.98,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("H2SO4__KMNO4") || key.equals("H2OS4__KMNO4")) {
            return """
                    {"hasReaction":true,"equation":"2KMnO4 + H2SO4 -> K2SO4 + 2MnO4(-) (môi trường)","productFormula":"K2SO4 + MnO4(-)","effectType":"COLOR_CHANGE","effectColor":"#E040FB","gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Dung dịch có màu tím hồng rất đậm đặc trưng.","explanationVi":"Kali pemanganat khi hòa tan trong môi trường axit mạnh tạo thành dung dịch có tính oxy hóa cực mạnh và giữ nguyên màu tím của ion MnO4-.","basicExplanation":"KMnO4 hòa tan trong H2SO4 tạo dung dịch màu tím đặc trưng. Môi trường axit giúp dung dịch này có tính tẩy rửa cực mạnh.","intermediateExplanation":"H2SO4 đóng vai trò cung cấp môi trường axit (ion H+) cần thiết để ion pemanganat (MnO4-) có thể thể hiện tính oxi hóa tối đa trong các phản ứng tiếp theo.","advancedExplanation":"Sự hiện diện của H+ làm tăng thế điện cực chuẩn của bán phản ứng: MnO4- + 8H+ + 5e- -> Mn2+ + 4H2O (E0 = +1.51V). Hỗn hợp này chưa có chất khử nên màu tím Mn(VII) vẫn giữ nguyên.","safetyNoteVi":"Hỗn hợp có tính oxy hóa rất mạnh, tuyệt đối không thêm chất dễ cháy vào hỗn hợp này.","confidence":0.98,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("AGNO3__NACL") || key.equals("AGNO3__CLNA")) {
            return """
                    {"hasReaction":true,"equation":"AgNO3 + NaCl -> AgCl + NaNO3","productFormula":"AgCl + NaNO3","effectType":"PRECIPITATE","effectColor":"#F5F5F5","gasFormula":null,"precipitateFormula":"AgCl","precipitateColor":"#EEEEEE","messageVi":"Kết tủa trắng AgCl xuất hiện.","explanationVi":"Ion Ag+ kết hợp với ion Cl- tạo thành kết tủa trắng AgCl không tan trong nước.","basicExplanation":"AgNO3 phản ứng với NaCl tạo ra chất rắn màu trắng là AgCl.","intermediateExplanation":"Ion Ag+ từ AgNO3 kết hợp với ion Cl- từ NaCl tạo thành tinh thể AgCl không tan trong nước.","advancedExplanation":"Phương trình ion rút gọn: Ag+(aq) + Cl-(aq) -> AgCl(s). Kết tủa này nhạy sáng.","safetyNoteVi":"Mô phỏng giáo dục.","confidence":0.98,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("HCL__NAOH") || key.equals("CLH__HNAO")) {
            return """
                    {"hasReaction":true,"equation":"HCl + NaOH -> NaCl + H2O","productFormula":"NaCl + H2O","effectType":"HEAT","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Phản ứng trung hòa tỏa nhiệt, dung dịch trở nên trung tính.","explanationVi":"Axit mạnh HCl phản ứng với bazơ mạnh NaOH tạo ra muối NaCl và nước, có tỏa nhiệt.","basicExplanation":"Axit HCl và bazơ NaOH tác dụng với nhau tạo thành muối NaCl và nước.","intermediateExplanation":"Ion H+ từ HCl kết hợp với ion OH- từ NaOH tạo thành H2O. Na+ và Cl- là ion khán giả.","advancedExplanation":"Phương trình ion rút gọn: H+(aq) + OH-(aq) -> H2O(l). ΔG < 0, phản ứng tự phát tỏa nhiệt mạnh.","safetyNoteVi":"Mô phỏng giáo dục.","confidence":0.96,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("HCL__NA") || key.equals("CLH__NA")) {
            return """
                    {"hasReaction":true,"equation":"2Na + 2HCl -> 2NaCl + H2","productFormula":"NaCl + H2","effectType":"EXPLOSION","effectColor":null,"gasFormula":"H2","precipitateFormula":null,"precipitateColor":null,"messageVi":"Phản ứng mãnh liệt, khí H2 thoát ra có thể gây nổ nhỏ.","explanationVi":"Kim loại kiềm Na phản ứng rất mạnh với axit HCl tạo ra muối NaCl và khí Hydro.","basicExplanation":"Natri phản ứng mãnh liệt với axit HCl giải phóng khí hydro H2.","intermediateExplanation":"Natri nhường electron cho ion H+ sinh ra khí hydro. Phản ứng sinh nhiều nhiệt gây cháy nổ.","advancedExplanation":"Na(s) + H+(aq) -> Na+(aq) + 1/2H2(g). Tính khử cực mạnh của kim loại kiềm gây ra phản ứng mãnh liệt.","safetyNoteVi":"CẢNH BÁO: Phản ứng cực kỳ nguy hiểm, không thực hiện ngoài đời thực.","confidence":0.99,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        if (key.equals("H2__N2") || key.equals("N2__H2")) {
            return """
                    {"hasReaction":true,"equation":"N2 + 3H2 <=> 2NH3","productFormula":"NH3","effectType":"GAS_BUBBLE","effectColor":null,"gasFormula":"NH3","precipitateFormula":null,"precipitateColor":null,"messageVi":"Tạo ra khí Amoniac có mùi khai (Haber-Bosch).","explanationVi":"Nitơ và hiđro phản ứng ở nhiệt độ và áp suất cao với xúc tác sắt để tạo amoniac.","basicExplanation":"Khí nitơ và khí hydro phản ứng tạo thành khí amoniac (NH3) có mùi khai.","intermediateExplanation":"Phản ứng tổng hợp amoniac là phản ứng thuận nghịch tỏa nhiệt, cần xúc tác Fe.","advancedExplanation":"Quá trình Haber-Bosch: N2 + 3H2 <=> 2NH3 (ΔH < 0). Áp suất cao và nhiệt độ tối ưu cùng xúc tác Fe giúp tăng hiệu suất.","safetyNoteVi":"Thực hiện trong thiết bị chịu áp suất cao.","confidence":0.95,"requiredTemperatureMin":400.0,"requiredTemperatureLabel":"400-500°C","requiredCatalyst":"Fe","requiredPressureMin":200.0}""";
        }
        if (key.equals("O2__SO2") || key.equals("SO2__O2") || key.equals("O2__O2S")) {
            return """
                    {"hasReaction":true,"equation":"2SO2 + O2 <=> 2SO3","productFormula":"SO3","effectType":"NONE","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Lưu huỳnh đioxit oxi hóa thành lưu huỳnh trioxit.","explanationVi":"Phản ứng cần xúc tác V2O5 và nhiệt độ cao để đẩy nhanh tốc độ oxi hóa.","basicExplanation":"Khí SO2 phản ứng với oxi tạo thành khí SO3.","intermediateExplanation":"SO2 bị oxi hóa bởi O2 tạo SO3. Phản ứng này là bước trung gian sản xuất axit sunfuric.","advancedExplanation":"Oxi hóa SO2 là quá trình thuận nghịch tỏa nhiệt. Xúc tác V2O5 giúp giảm năng lượng hoạt hóa quá trình chuyển electron.","safetyNoteVi":"SO3 là khí độc.","confidence":0.95,"requiredTemperatureMin":450.0,"requiredTemperatureLabel":"450°C","requiredCatalyst":"V2O5","requiredPressureMin":null}""";
        }
        if (key.equals("CU__O2") || key.equals("O2__CU")) {
            return """
                    {"hasReaction":true,"equation":"2Cu + O2 -> 2CuO","productFormula":"CuO","effectType":"COLOR_CHANGE","effectColor":"#2C2C2C","gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Đồng (Cu) bị oxi hóa thành đồng(II) oxit (CuO) có màu đen.","explanationVi":"Phản ứng giữa đồng và oxi ở nhiệt độ cao tạo ra lớp oxit đen bao phủ bề mặt kim loại.","basicExplanation":"Khi nung nóng trong không khí, đồng phản ứng với oxi tạo thành lớp màu đen là CuO.","intermediateExplanation":"Đồng kim loại nhường electron cho oxi phân tử tạo ra hợp chất ion CuO.","advancedExplanation":"Quá trình oxi hóa bề mặt kim loại Cu(s) + 1/2O2(g) -> CuO(s) làm thay đổi trạng thái oxi hóa của Cu từ 0 lên +2.","safetyNoteVi":"Cần nung nóng trong môi trường có oxi.","confidence":0.96,"requiredTemperatureMin":300.0,"requiredTemperatureLabel":"300-400°C","requiredCatalyst":null,"requiredPressureMin":null}""";
        }
        // Unknown pair – low confidence so cache won't store permanently
        return """
                {"hasReaction":false,"equation":null,"productFormula":null,"effectType":"NONE","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Cặp chất này chưa có trong cơ sở dữ liệu mô phỏng. Vui lòng thử cặp hóa chất khác hoặc thử lại sau khi hệ thống AI khả dụng.","explanationVi":"Hệ thống AI hiện không khả dụng và cặp chất này chưa có trong dữ liệu mô phỏng sẵn có.","basicExplanation":"Hệ thống chưa có thông tin về phản ứng này.","intermediateExplanation":"Cần kết nối AI để dự đoán phản ứng cho cặp chất mới.","advancedExplanation":"Hệ thống đang hoạt động ở chế độ offline với dữ liệu phản ứng có sẵn hạn chế.","safetyNoteVi":null,"confidence":0.1,"requiredTemperatureMin":null,"requiredTemperatureLabel":null,"requiredCatalyst":null,"requiredPressureMin":null}""";
    }

    private String getLatestUserQuestion(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return "";
        for (int i = history.size() - 1; i >= 0; i--) {
            ChatMessage m = history.get(i);
            if (m != null && "user".equalsIgnoreCase(m.getRole())) {
                return m.getContent();
            }
        }
        return "";
    }

    private String getMockChatResponse(String question, String reactionContext) {
        if (question == null) question = "";
        String q = question.toLowerCase();
        String ctx = reactionContext == null ? "" : reactionContext.toLowerCase();

        // 1. Check for specific reaction: CuSO4 + NaOH
        if (ctx.contains("cu(oh)2") || ctx.contains("cuso4") || ctx.contains("naoh")) {
            if (q.contains("kết tủa") || q.contains("xanh") || q.contains("màu") || q.contains("precipitate") || q.contains("blue")) {
                return "Kết tủa màu xanh lơ xuất hiện là Đồng(II) hydroxit [Cu(OH)₂]. Đây là bazơ không tan được tạo thành từ phản ứng trao đổi ion giữa muối CuSO₄ và bazơ NaOH. Phương trình ion rút gọn: Cu²⁺ + 2OH⁻ → Cu(OH)₂↓.";
            }
            if (q.contains("nguy hiểm") || q.contains("an toàn") || q.contains("độc") || q.contains("danger") || q.contains("safety")) {
                return "Phản ứng tạo kết tủa Cu(OH)₂ không quá độc hại, nhưng dung dịch kiềm NaOH có tính ăn mòn da và mắt cực kỳ mạnh. Cần đeo kính bảo hộ và găng tay khi làm thí nghiệm thực tế.";
            }
            if (q.contains("phương trình") || q.contains("equation") || q.contains("giải thích") || q.contains("phản ứng")) {
                return "Phản ứng CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄ là phản ứng trao đổi ion đặc trưng để nhận biết ion Cu²⁺. Khi đổ NaOH vào CuSO₄, liên kết ion giữa Cu²⁺ và SO₄²⁻ bị đứt ra để tạo thành kết tủa Cu(OH)₂ màu xanh lơ không tan.";
            }
        }

        // 2. Check for specific reaction: Zn + HCl / HCl + Zn
        if (ctx.contains("h2") || ctx.contains("zn") || ctx.contains("hcl") || ctx.contains("kẽm")) {
            if (q.contains("khí") || q.contains("bọt") || q.contains("sủi") || q.contains("gas") || q.contains("bubble")) {
                return "Bọt khí sủi mạnh và thoát ra chính là khí Hiđro (H₂). Kẽm (Zn) là kim loại hoạt động đứng trước hiđro trong dãy hoạt động hóa học, đã oxi hóa thành Zn²⁺ và khử các ion H⁺ trong axit HCl thành khí H₂ bay lên.";
            }
            if (q.contains("nguy hiểm") || q.contains("an toàn") || q.contains("độc") || q.contains("danger") || q.contains("safety")) {
                return "Khí H₂ sinh ra rất dễ bắt lửa và tạo hỗn hợp nổ mạnh với oxi trong không khí. Khi làm thí nghiệm thực tế, cần tránh xa lửa hở và tắt mọi nguồn điện có nguy cơ đánh lửa.";
            }
            if (q.contains("phương trình") || q.contains("equation") || q.contains("giải thích") || q.contains("phản ứng")) {
                return "Phản ứng: Zn + 2HCl → ZnCl₂ + H₂↑ là phản ứng thế (và cũng là phản ứng oxi hóa - khử) điển hình. Kẽm nhường 2 electron để khử ion H⁺ trong dung dịch axit thành hiđro đơn chất dạng khí.";
            }
        }

        // 3. Check for specific reaction: KMnO4 + H2SO4
        if (ctx.contains("kmno4") || ctx.contains("h2so4") || ctx.contains("tím") || ctx.contains("màu") || ctx.contains("purple")) {
            if (q.contains("tím") || q.contains("màu") || q.contains("color") || q.contains("purple")) {
                return "Dung dịch có màu tím hồng rất đậm đặc trưng của ion pemanganat (MnO₄⁻) từ KMnO₄. Khi hòa tan trong môi trường axit mạnh H₂SO₄, ion MnO₄⁻ có tính oxi hóa cực kỳ mạnh nhưng do chưa có chất khử nên màu tím Mn(VII) vẫn giữ nguyên.";
            }
            if (q.contains("nguy hiểm") || q.contains("an toàn") || q.contains("độc") || q.contains("danger") || q.contains("safety")) {
                return "CẢNH BÁO: Hỗn hợp KMnO₄ và H₂SO₄ đậm đặc có tính oxi hóa cực mạnh và tạo ra chất không bền mangan heptoxit (Mn₂O₇) cực kỳ nguy hiểm, có thể gây nổ hoặc bốc cháy tức thì khi tiếp xúc với các chất hữu cơ.";
            }
            if (q.contains("phương trình") || q.contains("equation") || q.contains("giải thích") || q.contains("phản ứng")) {
                return "Hỗn hợp KMnO₄ trong môi trường axit H₂SO₄ đóng vai trò là một chất oxi hóa mạnh vạn năng (thế khử chuẩn E° = 1.51V). Phản ứng tạo môi trường axit giúp kích hoạt tính oxi hóa mạnh nhất của ion MnO₄⁻ cho các phản ứng oxi hóa khử sau đó.";
            }
        }

        // 4. General conversation responses
        if (q.contains("chào") || q.contains("hello") || q.contains("hi")) {
            return "Xin chào! Tôi là Trợ lý hóa học ảo của VibeTDU. Tôi có thể giúp gì cho bạn về các phản ứng hóa học hoặc các thí nghiệm trong phòng lab này?";
        }
        if (q.contains("cảm ơn") || q.contains("thank")) {
            return "Rất sẵn lòng! Chúc bạn có những trải nghiệm học tập và nghiên cứu hóa học thú vị và an toàn tại phòng thí nghiệm ảo của VibeTDU.";
        }
        if (q.contains("tên") || q.contains("là ai")) {
            return "Tôi là Trợ lý Hóa học ảo, hoạt động dưới dạng mô hình ngôn ngữ lớn để trả lời các câu hỏi về hiện tượng, phương trình và an toàn hóa học.";
        }

        // 5. Default fallback responses based on reactionContext presence
        if (reactionContext != null && !reactionContext.isBlank() && !reactionContext.contains("no reaction context")) {
            return "Chào bạn! Đây là phản hồi từ Trợ lý Hóa học (chế độ mô phỏng offline). Về phản ứng hiện tại trong cốc thí nghiệm của bạn, các chất đang ở điều kiện nhiệt độ phòng và áp suất thường. Hãy cho tôi biết nếu bạn muốn hỏi cụ thể về chất kết tủa, khí thoát ra hoặc mức độ an toàn của chúng nhé!";
        }

        return "Chào bạn! Tôi đang hoạt động ở chế độ mô phỏng offline. Bạn có thể hỏi tôi về bất kỳ phản ứng nào có trong preset hoặc kiến thức hóa học trung học cơ sở và trung học phổ thông. Rất vui được đồng hành cùng bạn học hóa!";
    }
}
