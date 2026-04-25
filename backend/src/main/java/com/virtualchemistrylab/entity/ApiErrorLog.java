package com.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Logs failures when calling external APIs (AI, PubChem, Cactus, OPSIN).
 * Useful for monitoring and debugging without crashing the request pipeline.
 */
@Entity
@Table(name = "api_error_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Which API failed: PUBCHEM, CACTUS, OPSIN, AI_CLIENT */
    @Column(name = "api_name", nullable = false, length = 100)
    private String apiName;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
