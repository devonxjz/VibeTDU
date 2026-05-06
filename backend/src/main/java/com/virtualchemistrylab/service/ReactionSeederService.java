package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.ReactionResultDTO;
import com.virtualchemistrylab.entity.ReactionApiCache;
import com.virtualchemistrylab.repository.ReactionApiCacheRepository;
import com.virtualchemistrylab.util.ReactionKeyUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReactionSeederService {

    private static final Logger log = LoggerFactory.getLogger(ReactionSeederService.class);

    private final PairReactionResolverService pairResolver;
    private final ReactionApiCacheRepository reactionApiCacheRepository;

    // 84 chemicals from frontend constants
    private static final List<String> CHEMICALS = List.of(
            // Acids
            "HCl", "H2SO4", "HNO3", "CH3COOH", "H3PO4", "H2CO3", "HBr", "HI", "HF", "HNO2", "H2SO3", "HClO4", "HCOOH", "H2S",
            // Bases
            "NaOH", "KOH", "Ca(OH)2", "NH3", "Mg(OH)2", "LiOH", "Ba(OH)2", "Al(OH)3", "Cu(OH)2", "Fe(OH)3", "Fe(OH)2", "Zn(OH)2", "AgOH",
            // Salts
            "NaCl", "CuSO4", "CaCO3", "KNO3", "AgNO3", "K2SO4", "Na2SO4", "Na2CO3", "K2CO3", "BaCl2", "AgCl", "BaSO4", "FeSO4", "FeCl3", "AlCl3", "KMnO4", "K2Cr2O7", "KI",
            // Metals
            "Na", "Fe", "Cu", "Zn", "Al", "Mg", "Ag", "Au", "Pt", "Hg", "Pb", "Sn", "K", "Ca", "Ba",
            // Nonmetals
            "O2", "Cl2", "S", "C", "N2", "Br2", "I2", "P", "F2", "He", "Ar",
            // Organics
            "C2H5OH", "CH4", "C6H6", "C2H4", "C6H12O6", "C3H8", "C4H10", "C2H2", "HCHO", "CH3CHO", "CH3OH", "C6H5OH", "C3H8O3"
    );

    public ReactionSeederService(PairReactionResolverService pairResolver, ReactionApiCacheRepository reactionApiCacheRepository) {
        this.pairResolver = pairResolver;
        this.reactionApiCacheRepository = reactionApiCacheRepository;
    }

    /**
     * Starts the seeding process asynchronously.
     */
    @Async
    public void startSeeding() {
        log.info("[seeder] Starting asynchronous database seeding for {} chemicals.", CHEMICALS.size());
        
        List<String[]> pairs = new ArrayList<>();
        for (int i = 0; i < CHEMICALS.size(); i++) {
            for (int j = i + 1; j < CHEMICALS.size(); j++) {
                pairs.add(new String[]{CHEMICALS.get(i), CHEMICALS.get(j)});
            }
        }
        
        int totalPairs = pairs.size();
        log.info("[seeder] Total unique pairs to process: {}", totalPairs);

        int processed = 0;
        int skipped = 0;
        int apiCalls = 0;
        
        // Batch configuration to respect rate limits (Groq: ~30 req/min)
        int batchSize = 25;
        long sleepBetweenBatchesMs = 65000; // 65 seconds

        for (String[] pair : pairs) {
            String a = pair[0];
            String b = pair[1];
            String key = ReactionKeyUtil.buildKey(a, b);

            // Check if already exists in DB to avoid unnecessary API calls
            Optional<ReactionApiCache> existing = reactionApiCacheRepository.findByReactionKey(key);
            if (existing.isPresent() && existing.get().getNormalizedResult() != null) {
                skipped++;
                processed++;
                continue;
            }

            try {
                log.info("[seeder] Predicting pair {}/{} : {} + {}", processed + 1, totalPairs, a, b);
                
                // This will trigger the AI call if not in cache, and save it to the DB.
                // It inherently saves "no reaction" results as well because ReactionPredictionService
                // validates and persists the result regardless of hasReaction true/false.
                ReactionResultDTO result = pairResolver.predictPair(a, b, 25.0, 1.0, null);
                
                apiCalls++;
                processed++;

                // Enforce rate limit
                if (apiCalls % batchSize == 0) {
                    log.info("[seeder] Reached batch size limit ({} API calls). Sleeping for {} ms to respect rate limits...", batchSize, sleepBetweenBatchesMs);
                    Thread.sleep(sleepBetweenBatchesMs);
                }
                
                // Small sleep between individual calls to avoid bursts
                Thread.sleep(1000);

            } catch (Exception e) {
                log.error("[seeder] Error processing pair {} + {}: {}", a, b, e.getMessage());
            }
        }

        log.info("[seeder] Seeding completed. Processed: {}, Skipped (Already existed): {}, New API Calls: {}", processed, skipped, apiCalls);
    }
}
