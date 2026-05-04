package com.virtualchemistrylab.util;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TDD tests for ReactionProductParser.
 * Pure unit tests — no Spring context needed.
 */
class ReactionProductParserTest {

    @Test
    void shouldSplitSimpleProductFormula() {
        List<String> result = ReactionProductParser.parse("NaCl + H2O");
        assertEquals(List.of("NaCl", "H2O"), result);
    }

    @Test
    void shouldHandleSingleProduct() {
        List<String> result = ReactionProductParser.parse("BaSO4");
        assertEquals(List.of("BaSO4"), result);
    }

    @Test
    void shouldTrimWhitespace() {
        List<String> result = ReactionProductParser.parse("  NaCl  +  H2O  +  CO2  ");
        assertEquals(List.of("NaCl", "H2O", "CO2"), result);
    }

    @Test
    void shouldSkipEmptyTokens() {
        List<String> result = ReactionProductParser.parse("NaCl + + H2O");
        assertEquals(List.of("NaCl", "H2O"), result);
    }

    @Test
    void shouldHandleTrailingPlus() {
        List<String> result = ReactionProductParser.parse("NaCl + H2O +");
        assertEquals(List.of("NaCl", "H2O"), result);
    }

    @Test
    void shouldReturnEmptyForNull() {
        List<String> result = ReactionProductParser.parse(null);
        assertTrue(result.isEmpty());
    }

    @Test
    void shouldReturnEmptyForBlank() {
        List<String> result = ReactionProductParser.parse("   ");
        assertTrue(result.isEmpty());
    }

    @Test
    void shouldPreserveOrder() {
        List<String> result = ReactionProductParser.parse("Cu(OH)2 + Na2SO4");
        assertEquals(List.of("Cu(OH)2", "Na2SO4"), result);
    }
}
