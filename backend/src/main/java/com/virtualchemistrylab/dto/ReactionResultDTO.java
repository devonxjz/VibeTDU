package com.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Full reaction result populated by ReactionPredictionService / AI.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReactionResultDTO {

    private Boolean hasReaction;
    private String equation;
    private String productFormula;

    /** NONE | COLOR_CHANGE | PRECIPITATE | GAS_BUBBLE | HEAT | EXPLOSION */
    private String effectType;
    private String effectColor;
    private String gasFormula;
    private String precipitateFormula;
    private String precipitateColor;

    private String messageVi;
    private String explanationVi;
    private String safetyNoteVi;

    private String basicExplanation;
    private String intermediateExplanation;
    private String advancedExplanation;

    private Double confidence;

    /* ── Condition requirements (nullable — old cache entries won't have these) ── */
    private Double requiredTemperatureMin;
    private String requiredTemperatureLabel;
    private String requiredCatalyst;
    private Double requiredPressureMin;
}
