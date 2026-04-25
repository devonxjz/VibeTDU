package com.example.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.ReactionApiCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReactionApiCacheRepository extends JpaRepository<ReactionApiCache, Long> {

    /** Lookup reaction cache by the deterministic sorted key. */
    Optional<ReactionApiCache> findByReactionKey(String reactionKey);
}
