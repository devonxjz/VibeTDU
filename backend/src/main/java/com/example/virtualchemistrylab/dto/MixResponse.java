package com.example.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

/**
 * Response payload for POST /api/lab/mix.
 * Contains the full reaction result plus the new vessel state for animation.
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
