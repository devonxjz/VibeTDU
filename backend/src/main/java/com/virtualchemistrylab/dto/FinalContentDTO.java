package com.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Represents one chemical in the final beaker state after all reactions.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FinalContentDTO {

    private String formula;
    /** AQUEOUS | LIQUID | GAS | SOLID */
    private String state;
}
