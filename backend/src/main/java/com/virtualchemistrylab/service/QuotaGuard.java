package com.virtualchemistrylab.service;

import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.exception.ApiException;
import com.virtualchemistrylab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Enforces the AI quota per user.
 *
 * Call checkAndDeduct() AFTER the AI call succeeds to avoid penalising users
 * for backend failures. Uses an optimistic database-level atomic decrement
 * to prevent race conditions on concurrent requests.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QuotaGuard {

    private final UserRepository userRepository;

    /**
     * Loads the user's quota, resets if a new day has started, and
     * throws 429 if quota is exhausted.
     * Returns the user so the caller can pass it downstream.
     */
    public User check(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        "Authenticated user not found in database.", HttpStatus.UNAUTHORIZED));

        // Auto-reset daily quota on first request of a new day
        if (user.getLastResetDate().isBefore(LocalDate.now())) {
            user.setAiQuotaRemaining(20);
            user.setLastResetDate(LocalDate.now());
            user = userRepository.save(user);
            log.info("[quota] Daily reset for userId={}", userId);
        }

        if (user.getAiQuotaRemaining() <= 0) {
            throw new ApiException(
                    "Daily AI quota exceeded. Quota resets at midnight.", HttpStatus.TOO_MANY_REQUESTS);
        }

        return user;
    }

    /**
     * Atomically deducts 1 from the user's remaining quota.
     * Must be called AFTER a successful AI response.
     */
    @org.springframework.transaction.annotation.Transactional
    public void deduct(UUID userId) {
        int updated = userRepository.decrementQuota(userId);
        if (updated == 0) {
            log.warn("[quota] Failed to deduct quota for userId={} (already 0?)", userId);
        }
    }
}
