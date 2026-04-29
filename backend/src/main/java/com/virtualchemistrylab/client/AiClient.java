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
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
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
        if (appProperties.getAi().isMockMode()) {
            log.info("[AI] Mock mode – returning built-in response for: {}", reactantFormulae);
            return getMockReaction(reactantFormulae);
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty()) {
            log.warn("[AI] No API keys – falling back to mock");
            return getMockReaction(reactantFormulae);
        }

        String prompt = buildReactionPrompt(reactantFormulae, temperature, pressure, catalyst);

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
            return "This is a sample response (mock mode). "
                    + "Please disable mock mode and configure AI_API_KEY to get real responses from Gemini.";
        }

        List<String> apiKeys = appProperties.getAi().getApiKeys();
        if (apiKeys == null || apiKeys.isEmpty()) {
            return "AI system is not configured. Please contact the administrator.";
        }

        String prompt = "You are an educational chemistry assistant. Answer concisely and accurately in Vietnamese.\n"
                + "Reaction context:\n" + reactionContext
                + "\n\nQuestion: " + question;

        String firstKey = apiKeys.get(0).contains("#") ? apiKeys.get(0).split("#")[0].trim() : apiKeys.get(0).trim();
        String result = null;

        if (isGeminiKey(firstKey) || isGeminiUrl(appProperties.getAi().getApiUrl())) {
            result = callGemini(prompt);
        } else {
            result = callOpenAi(prompt);
        }
        
        if (result == null) {
            return "Sorry, the AI system is currently unavailable or overloaded. Please try again later.";
        }
        return result;
    }

    /**
     * Multi-turn chat (Gemini native contents[] format).
     * history roles must be "user" | "model".
     */
    public String chat(List<ChatMessage> history, String reactionContext) {
        if (appProperties.getAi().isMockMode()) {
            return "This is a mock response (mock mode). "
                    + "Please disable mock mode and configure AI_API_KEY to use Gemini.";
        }

        String apiKey = appProperties.getAi().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return "AI system is not configured. Please contact the administrator.";
        }

        List<ChatMessage> cleaned = sanitizeHistory(history);

        String systemText = "You are an educational chemistry assistant. Answer concisely and accurately in Vietnamese.\n"
                + "If the question relates to a reaction, base your answer on the reaction context below.\n"
                + "Reaction context:\n" + (reactionContext == null ? "No reaction context." : reactionContext);

        if (isGeminiKey(apiKey) || isGeminiUrl(appProperties.getAi().getApiUrl())) {
            return callGeminiChat(systemText, cleaned, apiKey);
        } else {
            return callOpenAiChat(systemText, cleaned, apiKey);
        }
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

    private String callGeminiChat(String systemInstruction, List<ChatMessage> history, String apiKey) {
        String model = appProperties.getAi().getModel();
        if (model == null || model.isBlank() || model.startsWith("gpt-")) {
            model = "gemini-2.0-flash";
        }

        String url = GEMINI_BASE_URL + "/" + model + ":generateContent?key=" + apiKey;

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

        try {
            String response = webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            return extractGeminiContent(response);
        } catch (Exception e) {
            log.error("[AI-Gemini] Chat call failed: {}", e.getMessage());
            saveErrorLog("AI_GEMINI_CHAT", "(chat)", e.getMessage());
            return null;
        }
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
                  "safetyNoteVi": string,
                  "confidence": number (0.0-1.0)
                }

                Mandatory rules:
                - effectType MUST be one of the exact enum values above
                - MUST identify neutralization reactions (Acid + Base -> Salt + Water).
                - MUST provide `productFormula` containing ONLY the reaction products (e.g., "Cu(OH)2 + Na2SO4").
                - MUST return ALL products in `productFormula`.
                - MUST include color description of products in `messageVi` and `explanationVi`. E.g., Na2SO4 is white, Cu(OH)2 is blue precipitate.
                - For precipitates, `precipitateColor` must be an exact HEX color code.
                - messageVi, explanationVi, safetyNoteVi MUST be in Vietnamese
                - Return ONLY pure JSON, no markdown
                """.formatted(String.join(" + ", reactants), envStr);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    /** Gemini API keys start with "AIzaSy" */
    private boolean isGeminiKey(String key) {
        return key != null && key.startsWith("AIzaSy");
    }

    private boolean isGeminiUrl(String url) {
        return url != null && url.contains("generativelanguage.googleapis.com");
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

        if (key.equals("CACO3__HCL")) {
            return """
                    {"hasReaction":true,"equation":"2HCl + CaCO3 -> CaCl2 + CO2 + H2O","productFormula":"CaCl2 + CO2 + H2O","effectType":"GAS_BUBBLE","effectColor":"#FFFFFF","gasFormula":"CO2","precipitateFormula":null,"precipitateColor":null,"messageVi":"CO2 gas is released, bubbling is observed.","explanationVi":"Acid HCl reacts with carbonate salt CaCO3 to produce CaCl2 salt, water and CO2 gas.","safetyNoteVi":"This is an educational simulation; do not perform the real reaction without safety guidance.","confidence":0.97}""";
        }
        if (key.equals("CUSO4__NAOH")) {
            return """
                    {"hasReaction":true,"equation":"CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4","productFormula":"Cu(OH)2 + Na2SO4","effectType":"PRECIPITATE","effectColor":"#1E90FF","gasFormula":null,"precipitateFormula":"Cu(OH)2","precipitateColor":"#1565C0","messageVi":"Blue precipitate Cu(OH)2 appears.","explanationVi":"Cu2+ ions from CuSO4 react with OH- ions from NaOH to form blue Cu(OH)2 precipitate.","safetyNoteVi":"This is an educational simulation.","confidence":0.98}""";
        }
        if (key.equals("AGNO3__NACL")) {
            return """
                    {"hasReaction":true,"equation":"AgNO3 + NaCl -> AgCl + NaNO3","productFormula":"AgCl + NaNO3","effectType":"PRECIPITATE","effectColor":"#F5F5F5","gasFormula":null,"precipitateFormula":"AgCl","precipitateColor":"#EEEEEE","messageVi":"White precipitate AgCl appears.","explanationVi":"Ag+ ions from AgNO3 combine with Cl- ions from NaCl to form white AgCl precipitate, insoluble in water.","safetyNoteVi":"This is an educational simulation.","confidence":0.98}""";
        }
        if (key.equals("HCL__NAOH")) {
            return """
                    {"hasReaction":true,"equation":"HCl + NaOH -> NaCl + H2O","productFormula":"NaCl + H2O","effectType":"HEAT","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"Neutralization reaction, slight heat release, solution becomes neutral.","explanationVi":"Strong acid HCl reacts with strong base NaOH in a neutralization reaction to form NaCl salt and water, releasing heat.","safetyNoteVi":"This is an educational simulation.","confidence":0.96}""";
        }
        if (key.equals("HCL__NA")) {
            return """
                    {"hasReaction":true,"equation":"2Na + 2HCl -> 2NaCl + H2","productFormula":"NaCl + H2","effectType":"EXPLOSION","effectColor":null,"gasFormula":"H2","precipitateFormula":null,"precipitateColor":null,"messageVi":"Violent reaction, H2 gas is released and may cause a small explosion.","explanationVi":"Alkali metal Na reacts very strongly with HCl acid to produce NaCl salt and Hydrogen gas (H2). The reaction releases a lot of heat which can ignite H2.","safetyNoteVi":"WARNING: Extremely violent and dangerous reaction. Never attempt in real life without professional protective equipment.","confidence":0.99}""";
        }
        // Unknown pair
        return """
                {"hasReaction":false,"equation":null,"productFormula":null,"effectType":"NONE","effectColor":null,"gasFormula":null,"precipitateFormula":null,"precipitateColor":null,"messageVi":"These two substances do not react with each other under current conditions.","explanationVi":"Reaction conditions are not suitable or this pair does not react within the simulation scope.","safetyNoteVi":null,"confidence":1.0}""";
    }
}
