package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.service.ReactionPredictionService;
import com.virtualchemistrylab.service.CacheService;
import com.virtualchemistrylab.util.ReactionKeyUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Seed controller – pre-generates all pairwise reaction results
 * and caches them in Supabase so future lookups are instant.
 *
 * POST /api/lab/seed-reactions
 * Body: { "formulae": ["HCl", "NaOH", "CuSO4", ...] }
 *
 * This will generate C(n,2) combinations and call AI for each
 * uncached pair. Already-cached pairs are skipped.
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

    public record SeedRequest(List<String> formulae) {}

    public record SeedProgress(
        int total,
        int cached,
        int generated,
        int failed,
        List<String> errors
    ) {}

    @Operation(
        summary = "Seed reaction cache",
        description = """
            Pre-generates all pairwise reaction results for the given list of chemical formulae.
            Already-cached reactions are skipped. This endpoint is designed to be called once
            to populate the Supabase cache so that future user interactions are instant.
            
            **Warning:** For 84 chemicals, this generates C(84,2) = 3,486 pairs.
            This will take a long time and consume API quota. Run during off-peak hours.
            """
    )
    @PostMapping("/seed-reactions")
    public ResponseEntity<SeedProgress> seedReactions(@RequestBody SeedRequest request) {
        List<String> formulae = request.formulae();
        if (formulae == null || formulae.size() < 2) {
            return ResponseEntity.badRequest().body(
                new SeedProgress(0, 0, 0, 0, List.of("Need at least 2 formulae"))
            );
        }

        // Deduplicate
        List<String> unique = formulae.stream().distinct().toList();
        int total = unique.size() * (unique.size() - 1) / 2;
        log.info("[seed] Starting seed for {} chemicals → {} pairs", unique.size(), total);

        int cached = 0;
        int generated = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < unique.size(); i++) {
            for (int j = i + 1; j < unique.size(); j++) {
                String a = unique.get(i);
                String b = unique.get(j);
                String key = ReactionKeyUtil.buildKey(a, b);

                // Check if already cached
                var existing = cacheService.getReaction(key);
                if (existing.isPresent() && existing.get().getNormalizedResult() != null
                        && !existing.get().getNormalizedResult().isBlank()) {
                    cached++;
                    if ((cached + generated + failed) % 100 == 0) {
                        log.info("[seed] Progress: {}/{} (cached={}, generated={}, failed={})",
                                cached + generated + failed, total, cached, generated, failed);
                    }
                    continue;
                }

                // Not cached → predict via AI
                try {
                    reactionPredictionService.predict(List.of(a, b), 25.0, 1.0, "Không");
                    generated++;
                    log.info("[seed] ✅ Generated: {} + {} (#{}/{})", a, b, cached + generated + failed, total);

                    // Small delay to avoid rate limits on Gemini API
                    Thread.sleep(1500);
                } catch (Exception e) {
                    failed++;
                    String errMsg = a + " + " + b + ": " + e.getMessage();
                    errors.add(errMsg);
                    log.warn("[seed] ❌ Failed: {}", errMsg);

                    // Longer delay after failure (might be rate limited)
                    try { Thread.sleep(3000); } catch (InterruptedException ignored) {}
                }
            }
        }

        log.info("[seed] ✅ Seed complete: total={}, cached={}, generated={}, failed={}",
                total, cached, generated, failed);

        return ResponseEntity.ok(new SeedProgress(total, cached, generated, failed, errors));
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
