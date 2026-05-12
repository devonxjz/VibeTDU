package com.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persists a snapshot of a user's experiment (Vessel state) for later review.
 * experiment_data is stored as TEXT (works on both H2 and PostgreSQL/JSONB).
 */
@Entity
@Table(name = "lab_journals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;



    @Column(length = 255)
    private String title;

    /**
     * JSON snapshot of the Vessel state sent by the frontend.
     * Stored as TEXT — compatible with H2 (tests) and PostgreSQL (production).
     */
    @Column(name = "experiment_data", columnDefinition = "TEXT", nullable = false)
    private String experimentData;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
