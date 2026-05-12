package com.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Describes conditions that were automatically applied by the system
 * when the user's environment didn't meet the reaction requirements.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AutoAppliedConditionsDTO {

    private Double temperature;
    private Double pressure;
    private String catalyst;
    private boolean autoAdjusted;
    private String reasonVi;
}
