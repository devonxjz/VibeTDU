package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.ReactionResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Resolves reactions for exactly 2 chemicals.
 * Wraps ReactionPredictionService with pair-specific validation.
 */
@Service
public class PairReactionResolverService {

    private static final Logger log = LoggerFactory.getLogger(PairReactionResolverService.class);

    private final ReactionPredictionService reactionPredictionService;

    public PairReactionResolverService(ReactionPredictionService reactionPredictionService) {
        this.reactionPredictionService = reactionPredictionService;
    }

    /**
     * Predict a reaction between exactly two chemicals.
     *
     * @return ReactionResultDTO, never null. Returns no-reaction DTO for invalid inputs.
     */
    public ReactionResultDTO predictPair(String formulaA, String formulaB,
                                          Double temperature, Double pressure, String catalyst) {
        if (formulaA == null || formulaB == null || formulaA.isBlank() || formulaB.isBlank()) {
            log.warn("[pair-resolver] Null/blank formula — returning no-reaction");
            return noReaction();
        }

        if (formulaA.equalsIgnoreCase(formulaB)) {
            log.info("[pair-resolver] Same formula '{}' — skipping", formulaA);
            return noReaction();
        }

        var prediction = reactionPredictionService.predict(
                List.of(formulaA, formulaB), temperature, pressure, catalyst);

        return prediction.result();
    }

    private ReactionResultDTO noReaction() {
        return ReactionResultDTO.builder()
                .hasReaction(false)
                .effectType("NONE")
                .confidence(1.0)
                .messageVi("Không có phản ứng.")
                .build();
    }
}
