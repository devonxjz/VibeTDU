package com.virtualchemistrylab.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Parses a product formula string (e.g. "NaCl + H2O + CO2")
 * into a list of individual formula strings.
 *
 * Extracted from LabMixService.buildVesselState() for reuse
 * in the sequential reaction engine.
 */
public class ReactionProductParser {

    private ReactionProductParser() {}

    /**
     * Split a product formula string by "+", trim each token,
     * and filter out empty strings.
     *
     * @param productFormula e.g. "NaCl + H2O"
     * @return ordered list of formulas, e.g. ["NaCl", "H2O"]
     */
    public static List<String> parse(String productFormula) {
        if (productFormula == null || productFormula.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(productFormula.split("\\+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
