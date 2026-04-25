package com.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Records every action performed by a session (MIX_CHEMICALS, AI_ASK, RESET, etc.)
 * Used for audit trail and per-session history.
 */
@Entity
@Table(name = "experiment_logs",
       indexes = @Index(name = "idx_log_session", columnList = "session_code"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExperimentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_code", nullable = false, length = 100)
    private String sessionCode;

    /** E.g. MIX_CHEMICALS, AI_ASK, SESSION_RESET */
    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

    @Column(name = "response_payload", columnDefinition = "TEXT")
    private String responsePayload;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
