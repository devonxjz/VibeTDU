package com.virtualchemistrylab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

/**
 * Represents one chemical in a vessel with its amount.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VesselContentDTO {

    @NotBlank(message = "inputName must not be blank")
    private String inputName;

    @NotBlank(message = "formula must not be blank")
    private String formula;

    /** Optional – amount in mL; must be positive if provided */
    @Positive(message = "amountMl must be positive")
    private Double amountMl;
}
