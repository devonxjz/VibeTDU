package com.virtualchemistrylab.config;

import com.virtualchemistrylab.service.JwtProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * JWT authentication filter for protected endpoints.
 *
 * Intercepts every request:
 * - Public paths: pass through immediately.
 * - Protected paths: extract + verify the Bearer JWT. If valid, store
 *   the userId in a request attribute ("authenticatedUserId") for downstream use.
 *   If missing or invalid, respond with 401 immediately.
 */
@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {

    private static final String ATTR_USER_ID = "authenticatedUserId";

    /** Paths that do NOT require a JWT. */
    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/api/auth/",
            "/api/lab/",
            "/api/chemicals/",
            "/swagger-ui",
            "/v3/api-docs",
            "/actuator"
    );

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Allow public paths through without any JWT check
        if (isPublic(path)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            sendUnauthorized(response, "Missing or malformed Authorization header.");
            return;
        }

        String token = header.substring(7);
        UUID userId = jwtProvider.extractUserId(token);
        if (userId == null) {
            sendUnauthorized(response, "Invalid or expired JWT.");
            return;
        }

        // Store authenticated userId for downstream handlers (e.g. QuotaGuard)
        request.setAttribute(ATTR_USER_ID, userId);
        chain.doFilter(request, response);
    }

    private boolean isPublic(String path) {
        return PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"status\":\"error\",\"message\":\"" + message + "\"}");
    }

    /** Convenience method for downstream controllers to read the authenticated userId. */
    public static UUID getUserId(HttpServletRequest request) {
        return (UUID) request.getAttribute(ATTR_USER_ID);
    }
}
