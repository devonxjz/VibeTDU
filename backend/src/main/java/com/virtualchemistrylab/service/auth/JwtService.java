package com.virtualchemistrylab.service.auth;

import com.virtualchemistrylab.config.AppProperties;
import com.virtualchemistrylab.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;

    public JwtService(AppProperties appProperties) {
        String secret = appProperties.getAuth().getJwt().getSecret();
        if (secret == null || secret.length() < 32) {
            secret = "dev-secret-key-at-least-32-chars-long";
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issue(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(7, ChronoUnit.DAYS)))
                .signWith(key)
                .compact();
    }

    public UUID parseUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        return UUID.fromString(subject);
    }
}
