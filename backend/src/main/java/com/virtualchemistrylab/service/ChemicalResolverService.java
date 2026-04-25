package com.virtualchemistrylab.service;

import com.virtualchemistrylab.client.CactusClient;
import com.virtualchemistrylab.client.OpsinClient;
import com.virtualchemistrylab.client.PubChemClient;
import com.virtualchemistrylab.dto.ChemicalInfoDTO;
import com.virtualchemistrylab.entity.ChemicalCache;
import com.virtualchemistrylab.repository.ChemicalCacheRepository;
import com.virtualchemistrylab.util.JsonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Resolves a chemical query to canonical info.
 *
 * Resolution chain (first success wins):
 *   1. DB cache         – avoids repeated external API hits
 *   2. PubChem          – most authoritative
 *   3. Cactus           – fallback
 *   4. OPSIN            – last-resort parser (IUPAC names only)
 *   5. Minimal fallback – uses input as-is so pipeline never crashes
 */
@Service
public class ChemicalResolverService {

    private static final Logger log = LoggerFactory.getLogger(ChemicalResolverService.class);

    private final ChemicalCacheRepository chemicalCacheRepository;
    private final PubChemClient pubChemClient;
    private final CactusClient cactusClient;
    private final OpsinClient opsinClient;

    public ChemicalResolverService(ChemicalCacheRepository chemicalCacheRepository,
                                   PubChemClient pubChemClient,
                                   CactusClient cactusClient,
                                   OpsinClient opsinClient) {
        this.chemicalCacheRepository = chemicalCacheRepository;
        this.pubChemClient = pubChemClient;
        this.cactusClient = cactusClient;
        this.opsinClient = opsinClient;
    }

    /**
     * Resolve with cache support. Returns (chemicalInfo, wasCached).
     */
    public ResolveResult resolve(String query) {
        String trimmed = query.trim();

        // Step 1 – Check DB cache
        var cached = chemicalCacheRepository.findByInputQueryIgnoreCase(trimmed);
        if (cached.isPresent()) {
            log.info("[chemical-resolver] Cache HIT for: {}", trimmed);
            return new ResolveResult(toDto(cached.get()), true);
        }

        log.info("[chemical-resolver] Cache MISS for: {} – calling external APIs", trimmed);

        // Step 2 – PubChem
        ChemicalInfoDTO info = pubChemClient.resolve(trimmed);

        // Step 3 – Cactus fallback
        if (info == null) {
            info = cactusClient.resolve(trimmed);
        }

        // Step 4 – OPSIN fallback
        if (info == null) {
            info = opsinClient.resolve(trimmed);
        }

        // Step 5 – Minimal fallback (never return null – pipeline must continue)
        if (info == null) {
            log.warn("[chemical-resolver] All external APIs failed for: {} – using minimal fallback", trimmed);
            info = ChemicalInfoDTO.builder()
                    .input(trimmed)
                    .canonicalFormula(trimmed)
                    .canonicalName(trimmed)
                    .source("FALLBACK")
                    .build();
        }

        // Save to cache
        saveCache(trimmed, info);

        return new ResolveResult(info, false);
    }

    private void saveCache(String query, ChemicalInfoDTO info) {
        try {
            ChemicalCache entity = ChemicalCache.builder()
                    .inputQuery(query)
                    .canonicalName(info.getCanonicalName())
                    .canonicalFormula(info.getCanonicalFormula())
                    .smiles(info.getSmiles())
                    .inchi(info.getInchi())
                    .inchiKey(info.getInchiKey())
                    .source(info.getSource())
                    .rawResponse(JsonUtil.toJson(info))
                    .build();
            chemicalCacheRepository.save(entity);
            log.info("[chemical-resolver] Saved cache for: {}", query);
        } catch (Exception e) {
            log.warn("[chemical-resolver] Failed to save cache for {}: {}", query, e.getMessage());
        }
    }

    private ChemicalInfoDTO toDto(ChemicalCache c) {
        return ChemicalInfoDTO.builder()
                .input(c.getInputQuery())
                .canonicalFormula(c.getCanonicalFormula())
                .canonicalName(c.getCanonicalName())
                .smiles(c.getSmiles())
                .inchi(c.getInchi())
                .inchiKey(c.getInchiKey())
                .source("CACHE")
                .build();
    }

    /** Simple result holder to carry wasCached flag alongside the DTO. */
    public record ResolveResult(ChemicalInfoDTO info, boolean cached) {}
}
