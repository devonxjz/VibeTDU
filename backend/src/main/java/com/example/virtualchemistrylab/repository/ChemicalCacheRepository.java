package com.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.ChemicalCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChemicalCacheRepository extends JpaRepository<ChemicalCache, Long> {

    /** Find cached chemical by exact input query string (case-insensitive). */
    Optional<ChemicalCache> findByInputQueryIgnoreCase(String inputQuery);
}
