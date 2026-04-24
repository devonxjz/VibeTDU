package com.virtualchemistrylab.service;

import com.virtualchemistrylab.config.AppProperties;
import com.virtualchemistrylab.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiter for the /api/lab/mix endpoint.
 *
 * Tracks the last call timestamp per sessionCode.
 * If a session calls mix too quickly it receives HTTP 429.
 *
 * NOTE: This is a simple in-process map and will reset on restart.
 * For production, replace with Redis or DB-backed tracking.
 */
@Service
public class RateLimitService {

    private final AppProperties appProperties;

    /** sessionCode -> last call timestamp in millis */
    private final Map<String, Long> lastCallMap = new ConcurrentHashMap<>();

    public RateLimitService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    /**
     * Check and record a mix call for the given session.
     * Throws ApiException (HTTP 429) if the cooldown has not elapsed.
     */
    public void checkAndRecord(String sessionCode) {
        long now = System.currentTimeMillis();
        long cooldown = appProperties.getRateLimit().getMixCooldownMs();

        Long last = lastCallMap.get(sessionCode);
        if (last != null && (now - last) < cooldown) {
            long remaining = cooldown - (now - last);
            throw new ApiException(
                    "Thao tác quá nhanh. Vui lòng chờ thêm " + remaining + "ms trước khi pha trộn tiếp.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        lastCallMap.put(sessionCode, now);
    }
}
