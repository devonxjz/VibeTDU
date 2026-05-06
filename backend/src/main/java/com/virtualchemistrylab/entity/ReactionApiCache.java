package com.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Caches a full reaction prediction result keyed by canonical reactant formulae.
 * Key is deterministic (sorted) so HCl+NaOH == NaOH+HCl.
 */
@Entity
@Table(name = "reaction_api_cache",
       indexes = @Index(name = "idx_reaction_key", columnList = "reaction_key", unique = true))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReactionApiCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Sorted canonical keys joined by __ e.g. "CaCO3__HCl" */
    @Column(name = "reaction_key", nullable = false, unique = true, length = 1024)
    private String reactionKey;

    /** Original request JSON sent to the prediction service */
    @Column(name = "input_payload", columnDefinition = "TEXT")
    private String inputPayload;

    /** Raw JSON response from AI / external reaction API */
    @Column(name = "raw_prediction_response", columnDefinition = "TEXT")
    private String rawPredictionResponse;

    /** Cleaned, validated JSON that is returned to the frontend */
    @Column(name = "normalized_result", columnDefinition = "TEXT")
    private String normalizedResult;

    /** AI_PREDICTION or API_PREDICTION */
    @Column(name = "source", length = 50)
    private String source;

    /** AI confidence score 0.0 – 1.0 */
    @Column(name = "confidence")
    private Double confidence;

    /** Minimum required temperature (Celsius) */
    @Column(name = "required_temperature_min")
    private Double requiredTemperatureMin;

    /** Required temperature description (e.g. ">100°C", "500-600°C") */
    @Column(name = "required_temperature_label", length = 100)
    private String requiredTemperatureLabel;

    /** Required catalyst formula or name (e.g. "Pt", "V2O5") */
    @Column(name = "required_catalyst", length = 100)
    private String requiredCatalyst;

    /** Minimum required pressure (atm) */
    @Column(name = "required_pressure_min")
    private Double requiredPressureMin;

    /** Manually verified by a chemistry expert – default false */
    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUsedAt = LocalDateTime.now();
    }
}
