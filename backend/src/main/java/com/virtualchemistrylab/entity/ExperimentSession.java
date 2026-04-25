package com.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks each experiment session identified by a unique sessionCode.
 * No user account is associated at this stage.
 */
@Entity
@Table(name = "experiment_sessions",
       indexes = @Index(name = "idx_session_code", columnList = "session_code", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExperimentSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_code", nullable = false, unique = true, length = 100)
    private String sessionCode;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActiveAt = LocalDateTime.now();
    }
}
