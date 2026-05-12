package com.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

/**
 * Represents one step in a sequential reaction chain.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReactionStepDTO {

    private int stepNumber;
    private List<String> reactants;
    private String reactionKey;
    private boolean hasReaction;
    private String equation;
    private String productFormula;
    private String effectType;
    private String messageVi;
    private AutoAppliedConditionsDTO appliedConditions;

    /** Formulae consumed by this step */
    private List<String> consumed;
    /** Formulae produced by this step */
    private List<String> produced;
    /** Full beaker contents after this step */
    private List<String> resultingContents;
}
