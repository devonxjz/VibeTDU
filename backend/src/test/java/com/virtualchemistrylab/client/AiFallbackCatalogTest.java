package com.virtualchemistrylab.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiFallbackCatalogTest {

    private final AiFallbackCatalog catalog = new AiFallbackCatalog();
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void reactionJsonForReturnsConfiguredPresetByAlias() throws Exception {
        String json = catalog.reactionJsonFor(List.of("NaOH", "CuSO4"));

        ReactionResultDTO result = mapper.readValue(json, ReactionResultDTO.class);

        assertTrue(catalog.isPresetReactionKey("CUSO4__NAOH"));
        assertTrue(result.getHasReaction());
        assertEquals("CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4", result.getEquation());
        assertEquals("PRECIPITATE", result.getEffectType());
        assertEquals("Cu(OH)2", result.getPrecipitateFormula());
        assertEquals(0.98, result.getConfidence());
    }

    @Test
    void reactionJsonForReturnsUnknownFallbackForUnconfiguredPair() throws Exception {
        String json = catalog.reactionJsonFor(List.of("Cu(OH)2", "Na2SO4"));

        ReactionResultDTO result = mapper.readValue(json, ReactionResultDTO.class);

        assertFalse(catalog.isPresetReactionKey("CU(OH)2__NA2SO4"));
        assertFalse(result.getHasReaction());
        assertEquals("NONE", result.getEffectType());
        assertEquals(0.1, result.getConfidence());
    }

    @Test
    void chatResponseForPreservesReactionSpecificFallbacks() {
        String response = catalog.chatResponseFor(
                "mau xanh la gi",
                "CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4"
        );

        assertTrue(response.contains("Cu(OH)"));
        assertTrue(response.toLowerCase().contains("xanh"));
    }

    @Test
    void chatResponseForReturnsDefaultWhenNoContextMatches() {
        String response = catalog.chatResponseFor("hello", null);

        assertTrue(response.contains("VibeTDU"));
    }
}
