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

    private Double confidence;
}
