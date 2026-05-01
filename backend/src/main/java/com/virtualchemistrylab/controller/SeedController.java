package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.service.ReactionPredictionService;
import com.virtualchemistrylab.service.CacheService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Seed controller – pre-generates reaction results
 * and caches them in Supabase so future lookups are instant.
 *
 * POST /api/lab/seed-one   — Process a single pair
 * GET  /api/lab/seed-status — Check how many are cached
 */
@RestController
@RequestMapping("/api/lab")
@Tag(name = "Seed", description = "Pre-generate and cache reaction results")
public class SeedController {

    private static final Logger log = LoggerFactory.getLogger(SeedController.class);

    private final ReactionPredictionService reactionPredictionService;
    private final CacheService cacheService;

    public SeedController(ReactionPredictionService reactionPredictionService,
                          CacheService cacheService) {
        this.reactionPredictionService = reactionPredictionService;
        this.cacheService = cacheService;
    }

    public record SeedOneRequest(String formulaA, String formulaB) {}

    public record SeedOneResponse(
        String key,
        boolean cached,
        double confidence,
        String source
    ) {}

    @Operation(
        summary = "Seed one reaction pair",
        description = """
            Pre-generates the reaction result for a single pair of chemicals.
            If already cached, returns immediately with cached=true.
            Otherwise calls AI, saves to Supabase, and returns the result.
            """
    )
    @PostMapping("/seed-one")
    public ResponseEntity<SeedOneResponse> seedOne(@RequestBody SeedOneRequest request) {
        if (request.formulaA() == null || request.formulaB() == null
                || request.formulaA().isBlank() || request.formulaB().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            var result = reactionPredictionService.predict(
                List.of(request.formulaA(), request.formulaB()),
                25.0, 1.0, "Không"
            );

            return ResponseEntity.ok(new SeedOneResponse(
                request.formulaA() + " + " + request.formulaB(),
                result.cached(),
                result.result().getConfidence() != null ? result.result().getConfidence() : 0.0,
                result.source()
            ));
        } catch (Exception e) {
            log.warn("[seed-one] Failed for {} + {}: {}", request.formulaA(), request.formulaB(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(
        summary = "Check seed progress",
        description = "Returns how many reactions are currently cached in Supabase."
    )
    @GetMapping("/seed-status")
    public ResponseEntity<Map<String, Object>> seedStatus() {
        long count = cacheService.countReactions();
        return ResponseEntity.ok(Map.of(
            "cachedReactions", count,
            "status", "ok"
        ));
    }
}
