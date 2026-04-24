package com.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.ExperimentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperimentLogRepository extends JpaRepository<ExperimentLog, Long> {

    List<ExperimentLog> findBySessionCodeOrderByCreatedAtDesc(String sessionCode);
}
