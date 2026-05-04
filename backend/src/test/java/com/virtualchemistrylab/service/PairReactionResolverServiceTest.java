package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.ReactionResultDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PairReactionResolverService.
 * Mocks ReactionPredictionService to test delegation logic.
 */
@ExtendWith(MockitoExtension.class)
class PairReactionResolverServiceTest {

    @Mock
    private ReactionPredictionService reactionPredictionService;

    @InjectMocks
    private PairReactionResolverService service;

    @Test
    void shouldDelegateToPredictionServiceForTwoChemicals() {
        var mockResult = ReactionResultDTO.builder()
                .hasReaction(true)
                .equation("HCl + NaOH → NaCl + H2O")
                .effectType("HEAT")
                .confidence(0.95)
                .build();

        when(reactionPredictionService.predict(eq(List.of("HCl", "NaOH")), eq(25.0), eq(1.0), eq("Không")))
                .thenReturn(new ReactionPredictionService.PredictResult(mockResult, true, "CACHE"));

        ReactionResultDTO result = service.predictPair("HCl", "NaOH", 25.0, 1.0, "Không");

        assertNotNull(result);
        assertTrue(result.getHasReaction());
        assertEquals("HCl + NaOH → NaCl + H2O", result.getEquation());
        verify(reactionPredictionService).predict(eq(List.of("HCl", "NaOH")), eq(25.0), eq(1.0), eq("Không"));
    }

    @Test
    void shouldRejectWhenBothFormulaeAreTheSame() {
        ReactionResultDTO result = service.predictPair("HCl", "HCl", 25.0, 1.0, "Không");

        assertNotNull(result);
        assertFalse(result.getHasReaction());
        verifyNoInteractions(reactionPredictionService);
    }

    @Test
    void shouldRejectNullInput() {
        ReactionResultDTO result = service.predictPair(null, "NaOH", 25.0, 1.0, "Không");

        assertNotNull(result);
        assertFalse(result.getHasReaction());
        verifyNoInteractions(reactionPredictionService);
    }

    @Test
    void shouldReturnNoReactionOnPredictionFailure() {
        var noReaction = ReactionResultDTO.builder()
                .hasReaction(false)
                .effectType("NONE")
                .confidence(1.0)
                .build();

        when(reactionPredictionService.predict(anyList(), any(), any(), any()))
                .thenReturn(new ReactionPredictionService.PredictResult(noReaction, false, "AI_PREDICTION"));

        ReactionResultDTO result = service.predictPair("NaCl", "H2O", 25.0, 1.0, "Không");

        assertNotNull(result);
        assertFalse(result.getHasReaction());
    }
}
