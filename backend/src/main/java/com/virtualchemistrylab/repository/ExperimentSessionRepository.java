package com.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.ExperimentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExperimentSessionRepository extends JpaRepository<ExperimentSession, Long> {

    Optional<ExperimentSession> findBySessionCode(String sessionCode);

    boolean existsBySessionCode(String sessionCode);
}
