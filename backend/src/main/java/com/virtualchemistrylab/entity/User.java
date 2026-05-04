package com.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a registered user, authenticated via Google OAuth.
 * Tracks AI quota usage and stores Google identity metadata.
 */
@Entity
@Table(name = "users",
       uniqueConstraints = {
           @UniqueConstraint(name = "uq_users_email", columnNames = "email"),
           @UniqueConstraint(name = "uq_users_google_sub", columnNames = "google_sub")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 20)
    private String provider = "google";

    /** Google's unique user identifier (sub claim in the ID token). */
    @Column(name = "google_sub", unique = true)
    private String googleSub;

    private String name;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "ai_quota_remaining", nullable = false)
    private int aiQuotaRemaining = 20;

    @Column(name = "last_reset_date", nullable = false)
    private LocalDate lastResetDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (lastResetDate == null) lastResetDate = LocalDate.now();
    }
}
