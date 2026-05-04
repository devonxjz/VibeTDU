package com.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleSub(String googleSub);

    /**
     * Atomically decrements ai_quota_remaining by 1 only when it is > 0.
     * Returns the number of rows updated (0 if quota was already exhausted).
     */
    @Modifying
    @Query("UPDATE User u SET u.aiQuotaRemaining = u.aiQuotaRemaining - 1 " +
           "WHERE u.id = :userId AND u.aiQuotaRemaining > 0")
    int decrementQuota(@Param("userId") UUID userId);
}

