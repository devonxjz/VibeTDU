package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.AutoAppliedConditionsDTO;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ReactionConditionService.
 * Pure logic — no Spring context needed.
 */
class ReactionConditionServiceTest {

    private final ReactionConditionService service = new ReactionConditionService();

    @Test
    void shouldNotAdjustWhenUserConditionsSufficient() {
        var reaction = ReactionResultDTO.builder()
                .requiredTemperatureMin(100.0)
                .requiredCatalyst(null)
                .build();

        AutoAppliedConditionsDTO result = service.evaluate(reaction, 200.0, 1.0, "Không");

        assertFalse(result.isAutoAdjusted());
        assertEquals(200.0, result.getTemperature());
    }

    @Test
    void shouldAutoAdjustWhenTemperatureTooLow() {
        var reaction = ReactionResultDTO.builder()
                .requiredTemperatureMin(500.0)
                .requiredTemperatureLabel("Nhiệt độ cao")
                .build();

        AutoAppliedConditionsDTO result = service.evaluate(reaction, 25.0, 1.0, "Không");

        assertTrue(result.isAutoAdjusted());
        assertEquals(500.0, result.getTemperature());
        assertNotNull(result.getReasonVi());
        assertTrue(result.getReasonVi().contains("Nhiệt độ cao"));
    }

    @Test
    void shouldAutoAdjustWhenCatalystMissing() {
        var reaction = ReactionResultDTO.builder()
                .requiredCatalyst("MnO2")
                .build();

        AutoAppliedConditionsDTO result = service.evaluate(reaction, 25.0, 1.0, "Không");

        assertTrue(result.isAutoAdjusted());
        assertEquals("MnO2", result.getCatalyst());
        assertNotNull(result.getReasonVi());
    }

    @Test
    void shouldPassthroughWhenNoRequirements() {
        var reaction = ReactionResultDTO.builder()
                .requiredTemperatureMin(null)
                .requiredCatalyst(null)
                .requiredPressureMin(null)
                .build();

        AutoAppliedConditionsDTO result = service.evaluate(reaction, 25.0, 1.0, "Không");

        assertFalse(result.isAutoAdjusted());
        assertEquals(25.0, result.getTemperature());
        assertEquals(1.0, result.getPressure());
        assertEquals("Không", result.getCatalyst());
    }

    @Test
    void shouldAutoAdjustPressure() {
        var reaction = ReactionResultDTO.builder()
                .requiredPressureMin(5.0)
                .build();

        AutoAppliedConditionsDTO result = service.evaluate(reaction, 25.0, 1.0, "Không");

        assertTrue(result.isAutoAdjusted());
        assertEquals(5.0, result.getPressure());
    }

    @Test
    void shouldCombineMultipleAdjustments() {
        var reaction = ReactionResultDTO.builder()
                .requiredTemperatureMin(300.0)
                .requiredCatalyst("Fe")
                .requiredPressureMin(2.0)
                .build();

        AutoAppliedConditionsDTO result = service.evaluate(reaction, 25.0, 1.0, "Không");

        assertTrue(result.isAutoAdjusted());
        assertEquals(300.0, result.getTemperature());
        assertEquals("Fe", result.getCatalyst());
        assertEquals(2.0, result.getPressure());
    }
}
