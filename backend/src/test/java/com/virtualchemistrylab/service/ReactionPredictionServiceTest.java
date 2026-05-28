package com.virtualchemistrylab.service;

import com.virtualchemistrylab.client.AiClient;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import com.virtualchemistrylab.entity.ReactionApiCache;
import com.virtualchemistrylab.util.JsonUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReactionPredictionService.
 * Validates the cache-first strategy and clean handling of negative (non-reacting) mixtures.
 */
@ExtendWith(MockitoExtension.class)
class ReactionPredictionServiceTest {

    @Mock
    private CacheService cacheService;

    @Mock
    private AiClient aiClient;

    @InjectMocks
    private ReactionPredictionService service;

    private ReactionResultDTO validReactionDto;
    private ReactionResultDTO nonReactiveDto;

    @BeforeEach
    void setUp() {
        validReactionDto = ReactionResultDTO.builder()
                .hasReaction(true)
                .equation("2H2 + O2 → 2H2O")
                .effectType("EXPLOSION")
                .confidence(1.0)
                .basicExplanation("Hydrogen reacts with oxygen to form water.")
                .intermediateExplanation("This is an exothermic combustion reaction.")
                .advancedExplanation("Thermodynamically highly favorable reaction.")
                .build();

        nonReactiveDto = ReactionResultDTO.builder()
                .hasReaction(false)
                .effectType("NONE")
                .confidence(1.0)
                .messageVi("Không có phản ứng xảy ra.")
                .explanationVi("Đồng là kim loại đứng sau hidro trong dãy hoạt động hóa học.")
                .basicExplanation("Đồng không tác dụng với axit HCl loãng.")
                .intermediateExplanation("Cu có thế khử tiêu chuẩn dương, không thể khử ion H+.")
                .advancedExplanation("ΔG phản ứng dương, quá trình không tự phát xảy ra.")
                .build();
    }

    @Test
    void shouldHitCacheForValidReaction() {
        String reactionKey = "H2__O2";
        ReactionApiCache hit = ReactionApiCache.builder()
                .reactionKey(reactionKey)
                .normalizedResult(JsonUtil.toJson(validReactionDto))
                .source("AI_PREDICTION")
                .confidence(1.0)
                .build();

        when(cacheService.getReaction(reactionKey)).thenReturn(Optional.of(hit));

        var result = service.predict(List.of("H2", "O2"), 25.0, 1.0, "Không");

        assertNotNull(result);
        assertTrue(result.cached());
        assertTrue(result.result().getHasReaction());
        assertEquals("2H2 + O2 → 2H2O", result.result().getEquation());
        assertEquals("AI_PREDICTION", result.source());

        verify(cacheService).touchReactionCache(hit);
        verifyNoInteractions(aiClient);
    }

    @Test
    void shouldHitCacheForValidNegativeReaction() {
        // Proves that negative reactions (hasReaction = false) with high confidence are correctly cached
        String reactionKey = "CU__HCL";
        ReactionApiCache hit = ReactionApiCache.builder()
                .reactionKey(reactionKey)
                .normalizedResult(JsonUtil.toJson(nonReactiveDto))
                .source("AI_PREDICTION")
                .confidence(1.0)
                .build();

        when(cacheService.getReaction(reactionKey)).thenReturn(Optional.of(hit));

        var result = service.predict(List.of("Cu", "HCl"), 25.0, 1.0, "Không");

        assertNotNull(result);
        assertTrue(result.cached());
        assertFalse(result.result().getHasReaction());
        assertEquals("Không có phản ứng xảy ra.", result.result().getMessageVi());
        assertEquals("AI_PREDICTION", result.source());

        verify(cacheService).touchReactionCache(hit);
        verifyNoInteractions(aiClient);
    }

    @Test
    void shouldBypassCacheOnLowConfidenceFallback() {
        // Proves that low confidence entries (such as dynamic mock fallbacks, confidence=0.1) are correctly bypassed
        String reactionKey = "CU__H2O";
        ReactionResultDTO fallback = ReactionResultDTO.builder()
                .hasReaction(false)
                .confidence(0.1)
                .basicExplanation("Hệ thống chưa có thông tin...")
                .build();

        ReactionApiCache hit = ReactionApiCache.builder()
                .reactionKey(reactionKey)
                .normalizedResult(JsonUtil.toJson(fallback))
                .source("AI_FALLBACK")
                .confidence(0.1)
                .build();

        when(cacheService.getReaction(reactionKey)).thenReturn(Optional.of(hit));
        when(aiClient.predictReaction(anyList(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(JsonUtil.toJson(nonReactiveDto));

        var result = service.predict(List.of("Cu", "H2O"), 25.0, 1.0, "Không");

        assertNotNull(result);
        assertFalse(result.cached()); // Should be a cache miss/bypass because confidence 0.1 < 0.5
        assertFalse(result.result().getHasReaction());
        assertEquals("Không có phản ứng xảy ra.", result.result().getMessageVi());

        verify(cacheService, never()).touchReactionCache(any());
        verify(aiClient).predictReaction(anyList(), anyDouble(), anyDouble(), anyString());
    }
}
