package com.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

/**
 * Response payload for POST /api/lab/mix.
 * Contains the full reaction result plus the new vessel state for animation.
 *
 * Sequential reaction fields (reactionMode, steps, etc.) are nullable
 * for backward compatibility with existing 2-chemical responses.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MixResponse {

    private String status;          // "success" | "error"
    private String source;          // AI_PREDICTION | API_PREDICTION | CACHE | MOCK
    private Boolean cached;
    private Double confidence;
    private ReactionResultDTO result;
    private NewVesselState newTargetVesselState;

    /* ── Sequential reaction fields ── */

    /** "DIRECT_PAIR" for 2-chemical or "SEQUENTIAL_MULTI" for 3+ */
    private String reactionMode;
    private Integer stepCount;
    private List<ReactionStepDTO> steps;
    private AutoAppliedConditionsDTO appliedConditions;
    private List<FinalContentDTO> finalContents;
    private String ambiguityNoteVi;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NewVesselState {
        private String vesselId;
        private String displayColor;
        private List<ProductEntry> contents;
        private GasEntry releasedGas;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductEntry {
        private String formula;
        /** AQUEOUS | LIQUID | GAS | SOLID */
        private String state;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GasEntry {
        private String formula;
    }
}
