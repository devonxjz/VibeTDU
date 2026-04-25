package com.example.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.ApiErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiErrorLogRepository extends JpaRepository<ApiErrorLog, Long> {
    // Basic CRUD only – querying is done for monitoring purposes externally
}
