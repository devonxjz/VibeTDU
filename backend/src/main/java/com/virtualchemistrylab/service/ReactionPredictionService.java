package com.virtualchemistrylab.service;

import com.virtualchemistrylab.client.AiClient;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import com.virtualchemistrylab.entity.ReactionApiCache;
import com.virtualchemistrylab.util.JsonUtil;
import com.virtualchemistrylab.util.ReactionKeyUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.virtualchemistrylab.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Predicts chemical reactions by:
 *   1. Checking reaction_api_cache
 *   2. If miss: calling AiClient (real or mock)
 *   3. Validating the JSON response
 *   4. Saving result to cache
 *
 * Returns a validated ReactionResultDTO.
 * Throws ApiException HTTP 500 if AI call fails or times out.
 */
@Service
public class ReactionPredictionService {

    private static final Logger log = LoggerFactory.getLogger(ReactionPredictionService.class);

    private static final Set<String> VALID_EFFECT_TYPES =
            Set.of("NONE", "COLOR_CHANGE", "PRECIPITATE", "GAS_BUBBLE", "HEAT", "EXPLOSION");

    private final CacheService cacheService;
    private final AiClient aiClient;

    public ReactionPredictionService(CacheService cacheService, AiClient aiClient) {
        this.cacheService = cacheService;
        this.aiClient = aiClient;
    }

    public record PredictResult(ReactionResultDTO result, boolean cached, String source) {}

    /**
     * Predict and return a reaction result for the given list of canonical formulae.
     * Uses cache-first strategy: if Supabase already has the result, return it immediately.
     */
    public PredictResult predict(List<String> formulae, Double temperature, Double pressure, String catalyst) {
        String reactionKey = ReactionKeyUtil.buildKey(formulae);
        log.info("[reaction-predict] Key: {}", reactionKey);

        // Bypass cache for standard quick-reaction presets to ensure 100% correct offline demo behavior
        if (aiClient.isPresetReactionKey(reactionKey)) {
            log.info("[reaction-predict] 🚀 Preset reaction detected: {} - returning mock directly", reactionKey);
            String rawJson = aiClient.predictReaction(formulae, temperature, pressure, catalyst);
            ReactionResultDTO dto = validateAndParse(rawJson);
            return new PredictResult(dto, false, "BUILTIN_PRESET");
        }

        // ── Step 1: Check cache ──
        var cached = cacheService.getReaction(reactionKey);
        if (cached.isPresent()) {
            ReactionApiCache hit = cached.get();
            String normalizedJson = hit.getNormalizedResult();
            if (normalizedJson != null && !normalizedJson.isBlank()) {
                ReactionResultDTO dto = JsonUtil.fromJson(normalizedJson, ReactionResultDTO.class);
                if (dto != null && dto.getConfidence() != null && dto.getConfidence() >= 0.5) {
                    // If cache is missing explanation fields (stale), force re-prediction
                    if (dto.getBasicExplanation() == null || dto.getBasicExplanation().isBlank()) {
                        log.info("[reaction-predict] Cache HIT for key: {} but missing explanations – re-predicting.", reactionKey);
                    } else {
                        log.info("[reaction-predict] ✅ Cache HIT for key: {} (confidence={})", reactionKey, dto.getConfidence());
                        cacheService.touchReactionCache(hit);
                        return new PredictResult(dto, true, hit.getSource());
                    }
                }
            }
            log.info("[reaction-predict] Cache entry found but invalid/low-confidence – re-predicting.");
        }

        // ── Step 2: Cache miss → call AI ──
        log.info("[reaction-predict] Cache MISS for: {} – calling AI", formulae);
        String rawJson;
        try {
            rawJson = aiClient.predictReaction(formulae, temperature, pressure, catalyst);
        } catch (Exception e) {
            log.error("[reaction-predict] AI call threw exception for key {}: {}", reactionKey, e.getMessage());
            throw new ApiException("Không thể mô phỏng phản ứng. Vui lòng thử lại sau.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (rawJson == null) {
            log.error("[reaction-predict] AI returned null for key: {}", reactionKey);
            throw new ApiException("Không thể mô phỏng phản ứng. Vui lòng thử lại sau.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Validate
        ReactionResultDTO dto = validateAndParse(rawJson);

        // Save cache
        String source = determineMockOrReal();
        if (cached.isPresent()) {
            ReactionApiCache existing = cached.get();
            existing.setRawPredictionResponse(rawJson);
            existing.setNormalizedResult(JsonUtil.toJson(dto));
            existing.setSource(source);
            existing.setConfidence(dto.getConfidence());
            cacheService.saveReaction(existing);
        } else {
            saveCache(reactionKey, formulae, rawJson, dto, source);
        }

        return new PredictResult(dto, false, source);
    }

    // ─── Validation ──────────────────────────────────────────────────────────────

    private ReactionResultDTO validateAndParse(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            log.warn("[reaction-predict] AI returned null/empty JSON – using fallback");
            return fallbackDto();
        }

        ReactionResultDTO dto = JsonUtil.fromJson(rawJson, ReactionResultDTO.class);
        if (dto == null) {
            log.error("[reaction-predict] AI response parse error – using fallback");
            return fallbackDto();
        }

        // Validate effectType
        if (dto.getEffectType() == null || !VALID_EFFECT_TYPES.contains(dto.getEffectType())) {
            log.warn("[reaction-predict] Invalid effectType '{}' – defaulting to NONE", dto.getEffectType());
            dto.setEffectType("NONE");
        }

        // Validate confidence
        if (dto.getConfidence() == null || dto.getConfidence() < 0 || dto.getConfidence() > 1) {
            log.warn("[reaction-predict] Invalid confidence – defaulting to 0.0");
            dto.setConfidence(0.0);
        }

        // Low confidence => fallback
        if (dto.getConfidence() < 0.5) {
            log.warn("[reaction-predict] Confidence {:.2f} < 0.5 – using fallback",
                    dto.getConfidence());
            return fallbackDto();
        }

        return dto;
    }

    private ReactionResultDTO fallbackDto() {
        return ReactionResultDTO.builder()
                .hasReaction(false)
                .effectType("NONE")
                .confidence(0.1)  // Low confidence → won't be cached permanently, will re-predict when AI is available
                .messageVi("Cặp chất này chưa có trong cơ sở dữ liệu mô phỏng. Vui lòng thử lại sau khi hệ thống AI khả dụng.")
                .explanationVi("Hệ thống AI hiện không khả dụng và cặp chất này chưa có trong dữ liệu mô phỏng sẵn có.")
                .basicExplanation("Hệ thống chưa có thông tin về phản ứng này. Hãy thử lại sau.")
                .intermediateExplanation("Cần kết nối AI để dự đoán phản ứng cho cặp chất mới.")
                .advancedExplanation("Hệ thống đang hoạt động ở chế độ offline với dữ liệu phản ứng có sẵn hạn chế.")
                .safetyNoteVi(null)
                .build();
    }

    // ─── Cache persistence ───────────────────────────────────────────────────────

    private void saveCache(String key, List<String> formulae, String raw,
                           ReactionResultDTO dto, String source) {
        try {
            ReactionApiCache entity = ReactionApiCache.builder()
                    .reactionKey(key)
                    .inputPayload(JsonUtil.toJson(formulae))
                    .rawPredictionResponse(raw)
                    .normalizedResult(JsonUtil.toJson(dto))
                    .source(source)
                    .confidence(dto.getConfidence())
                    .verified(false)
                    .build();
            cacheService.saveReaction(entity);
            log.info("[reaction-predict] Saved cache for key: {}", key);
        } catch (Exception e) {
            log.warn("[reaction-predict] Failed to save cache: {}", e.getMessage());
        }
    }

    private String determineMockOrReal() {
        // We could inject AppProperties here, but AiClient already decides.
        // A simple approach: return AI_PREDICTION always at this layer.
        return "AI_PREDICTION";
    }
}
