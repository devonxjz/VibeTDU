package com.example.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Information returned after resolving a chemical name/formula.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChemicalInfoDTO {

    private String input;
    private String canonicalFormula;
    private String canonicalName;
    private String smiles;
    private String inchi;
    private String inchiKey;
    /** PUBCHEM | CACTUS | OPSIN | MOCK | CACHE */
    private String source;
}
