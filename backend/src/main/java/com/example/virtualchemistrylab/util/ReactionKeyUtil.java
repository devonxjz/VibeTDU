package com.example.virtualchemistrylab.util;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Builds deterministic reaction cache keys from a list of canonical chemical formulae.
 *
 * Rules:
 *  - All formulae are trimmed and upper-cased before sorting.
 *  - Formulae are deduplicated then sorted lexicographically.
 *  - Joined by double underscore: "CaCO3__HCl"
 *
 * This ensures HCl + CaCO3  ≡  CaCO3 + HCl.
 */
public class ReactionKeyUtil {

    private ReactionKeyUtil() {}

    public static String buildKey(List<String> formulae) {
        return formulae.stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .distinct()
                .sorted()
                .collect(Collectors.joining("__"));
    }

    /**
     * Convenience method for two-chemical reactions.
     */
    public static String buildKey(String a, String b) {
        return buildKey(List.of(a, b));
    }
}
