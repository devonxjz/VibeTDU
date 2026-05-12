package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.AutoAppliedConditionsDTO;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import com.virtualchemistrylab.dto.MixResponse;
import com.virtualchemistrylab.dto.ReactionStepDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SequentialReactionService.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SequentialReactionServiceTest {

    @Mock
    private PairReactionResolverService pairResolver;

    @Mock
    private ReactionConditionService conditionService;

    @InjectMocks
    private SequentialReactionService service;

    @BeforeEach
    void setup() {
        // Default mock for condition service: passthrough
        lenient().when(conditionService.evaluate(any(), any(), any(), any()))
                .thenReturn(AutoAppliedConditionsDTO.builder().autoAdjusted(false).build());

        // Default mock for pairResolver: no reaction
        lenient().when(pairResolver.predictPair(anyString(), anyString(), any(), any(), any()))
                .thenReturn(noReaction());
    }

    private ReactionResultDTO mockReaction(String eq, String productFormula, String effectType, double conf) {
        return ReactionResultDTO.builder()
                .hasReaction(true)
                .equation(eq)
                .productFormula(productFormula)
                .effectType(effectType)
                .confidence(conf)
                .build();
    }

    private ReactionResultDTO noReaction() {
        return ReactionResultDTO.builder()
                .hasReaction(false)
                .build();
    }

    @Test
    void shouldProcessTwoChemicalsInOneStep() {
        // Mock HCl + NaOH -> NaCl + H2O
        when(pairResolver.predictPair(eq("HCl"), eq("NaOH"), any(), any(), any()))
                .thenReturn(mockReaction("HCl + NaOH -> NaCl + H2O", "NaCl + H2O", "HEAT", 0.9));

        MixResponse response = service.process(List.of("HCl", "NaOH"), 25.0, 1.0, null);

        assertEquals("DIRECT_PAIR", response.getReactionMode());
        assertEquals(1, response.getStepCount());
        assertEquals(1, response.getSteps().size());
        
        ReactionStepDTO step = response.getSteps().get(0);
        assertTrue(step.isHasReaction());
        assertEquals(List.of("HCl", "NaOH"), step.getReactants());
        assertEquals(List.of("NaCl", "H2O"), step.getProduced());
        
        // Final contents
        assertEquals(2, response.getFinalContents().size());
        assertTrue(response.getFinalContents().stream().anyMatch(c -> c.getFormula().equals("NaCl")));
        assertTrue(response.getFinalContents().stream().anyMatch(c -> c.getFormula().equals("H2O")));
    }

    @Test
    void shouldProcessThreeChemicalsChained() {
        // A + B + C
        // A + B -> D
        // D + C -> E
        lenient().when(pairResolver.predictPair(anyString(), anyString(), any(), any(), any()))
                .thenReturn(noReaction());

        when(pairResolver.predictPair(eq("A"), eq("B"), any(), any(), any()))
                .thenReturn(mockReaction("A + B -> D", "D", "HEAT", 0.9));

        when(pairResolver.predictPair(eq("B"), eq("A"), any(), any(), any()))
                .thenReturn(mockReaction("A + B -> D", "D", "HEAT", 0.9));

        when(pairResolver.predictPair(eq("C"), eq("D"), any(), any(), any()))
                .thenReturn(mockReaction("C + D -> E", "E", "COLOR_CHANGE", 0.9));

        when(pairResolver.predictPair(eq("D"), eq("C"), any(), any(), any()))
                .thenReturn(mockReaction("C + D -> E", "E", "COLOR_CHANGE", 0.9));

        MixResponse response = service.process(List.of("A", "B", "C"), 25.0, 1.0, null);

        assertEquals("SEQUENTIAL_MULTI", response.getReactionMode());
        assertEquals(2, response.getStepCount());
        
        assertEquals("A + B -> D", response.getSteps().get(0).getEquation());
        assertEquals("C + D -> E", response.getSteps().get(1).getEquation());
        
        assertEquals(1, response.getFinalContents().size());
        assertEquals("E", response.getFinalContents().get(0).getFormula());
    }

    @Test
    void shouldReturnEmptyStepsIfNoReaction() {
        lenient().when(pairResolver.predictPair(anyString(), anyString(), any(), any(), any()))
                .thenReturn(noReaction());

        MixResponse response = service.process(List.of("A", "B", "C"), 25.0, 1.0, null);

        assertEquals(0, response.getStepCount());
        assertEquals(3, response.getFinalContents().size());
    }

    @Test
    void shouldPrioritizeBasedOnConditionsOverEffectType() {
        // A + B -> Explosion (but requires 500C)
        // A + C -> Gas (works at 25C)
        var explosion = mockReaction("A + B -> D", "D", "EXPLOSION", 0.9);
        var gas = mockReaction("A + C -> E", "E", "GAS_BUBBLE", 0.9);

        lenient().when(pairResolver.predictPair(anyString(), anyString(), any(), any(), any()))
                .thenReturn(noReaction());

        when(pairResolver.predictPair(eq("A"), eq("B"), any(), any(), any())).thenReturn(explosion);
        when(pairResolver.predictPair(eq("B"), eq("A"), any(), any(), any())).thenReturn(explosion);
        
        when(pairResolver.predictPair(eq("A"), eq("C"), any(), any(), any())).thenReturn(gas);
        when(pairResolver.predictPair(eq("C"), eq("A"), any(), any(), any())).thenReturn(gas);

        // A+B requires auto-adjust
        when(conditionService.evaluate(eq(explosion), any(), any(), any()))
                .thenReturn(AutoAppliedConditionsDTO.builder().autoAdjusted(true).build());
        
        // A+C does NOT require auto-adjust
        when(conditionService.evaluate(eq(gas), any(), any(), any()))
                .thenReturn(AutoAppliedConditionsDTO.builder().autoAdjusted(false).build());

        MixResponse response = service.process(List.of("A", "B", "C"), 25.0, 1.0, null);

        // Should pick A+C (Gas) over A+B (Explosion) because A+C doesn't require auto-adjust
        assertEquals(1, response.getStepCount());
        assertEquals("A + C -> E", response.getSteps().get(0).getEquation());
    }

    @Test
    void shouldPreventInfiniteLoops() {
        // A + B -> A + B (cyclic)
        var cyclic = mockReaction("A + B -> A + B", "A + B", "HEAT", 0.9);

        lenient().when(pairResolver.predictPair(anyString(), anyString(), any(), any(), any()))
                .thenReturn(noReaction());
        
        when(pairResolver.predictPair(eq("A"), eq("B"), any(), any(), any())).thenReturn(cyclic);
        when(pairResolver.predictPair(eq("B"), eq("A"), any(), any(), any())).thenReturn(cyclic);

        MixResponse response = service.process(List.of("A", "B"), 25.0, 1.0, null);

        // Should stop after 1 step due to seen state
        assertEquals(1, response.getStepCount());
        assertNotNull(response.getAmbiguityNoteVi());
    }
}
