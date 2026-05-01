package com.virtualchemistrylab.service;

import com.virtualchemistrylab.entity.ChemicalCache;
import com.virtualchemistrylab.entity.ReactionApiCache;
import com.virtualchemistrylab.repository.ChemicalCacheRepository;
import com.virtualchemistrylab.repository.ReactionApiCacheRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Thin service over cache repositories.
 * Provides convenient methods so other services don't directly touch repositories.
 */
@Service
public class CacheService {

    private final ChemicalCacheRepository chemicalCacheRepository;
    private final ReactionApiCacheRepository reactionApiCacheRepository;

    public CacheService(ChemicalCacheRepository chemicalCacheRepository,
                        ReactionApiCacheRepository reactionApiCacheRepository) {
        this.chemicalCacheRepository = chemicalCacheRepository;
        this.reactionApiCacheRepository = reactionApiCacheRepository;
    }

    // ─── Chemical cache ──────────────────────────────────────────────────────────

    public Optional<ChemicalCache> getChemical(String query) {
        return chemicalCacheRepository.findByInputQueryIgnoreCase(query);
    }

    public ChemicalCache saveChemical(ChemicalCache entity) {
        return chemicalCacheRepository.save(entity);
    }

    // ─── Reaction cache ──────────────────────────────────────────────────────────

    public Optional<ReactionApiCache> getReaction(String reactionKey) {
        return reactionApiCacheRepository.findByReactionKey(reactionKey);
    }

    @Transactional
    public ReactionApiCache saveReaction(ReactionApiCache entity) {
        return reactionApiCacheRepository.save(entity);
    }

    /** Update last_used_at timestamp when a cache entry is hit. */
    @Transactional
    public void touchReactionCache(ReactionApiCache entry) {
        entry.setLastUsedAt(LocalDateTime.now());
        reactionApiCacheRepository.save(entry);
    }

    /** Count total cached reactions in Supabase. */
    public long countReactions() {
        return reactionApiCacheRepository.count();
    }
}
