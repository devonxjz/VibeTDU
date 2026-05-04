package com.virtualchemistrylab.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Generates and parses the internal HMAC-SHA256 JWTs issued to authenticated users.
 * These are distinct from Google's ID tokens – they are our own system's session tokens.
 */
@Component
public class JwtProvider {

    private static final long EXPIRY_MS = 24L * 60 * 60 * 1000; // 24 hours

    private final SecretKey key;

    public JwtProvider(@Value("${app.auth.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Issues a new JWT for the given userId and email. */
    public String issue(UUID userId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + EXPIRY_MS))
                .signWith(key)
                .compact();
    }

    /** Extracts the userId (sub claim) from a valid token, or returns null. */
    public UUID extractUserId(String token) {
        try {
            String sub = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return UUID.fromString(sub);
        } catch (Exception e) {
            return null;
        }
    }
}
