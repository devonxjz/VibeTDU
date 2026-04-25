package com.example.virtualchemistrylab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Caches resolved chemical info from PubChem / Cactus / OPSIN.
 * Avoids repeated external API calls for the same query.
 */
@Entity
@Table(name = "chemical_cache",
       indexes = @Index(name = "idx_chemical_input", columnList = "input_query"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChemicalCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Original user input, e.g. "NaOH", "sodium hydroxide" */
    @Column(name = "input_query", nullable = false, length = 255)
    private String inputQuery;

    @Column(name = "canonical_name", length = 512)
    private String canonicalName;

    @Column(name = "canonical_formula", length = 255)
    private String canonicalFormula;

    @Column(name = "smiles", length = 1024)
    private String smiles;

    @Column(name = "inchi", columnDefinition = "TEXT")
    private String inchi;

    @Column(name = "inchikey", length = 27)
    private String inchiKey;

    /** Which API provided this data: PUBCHEM, CACTUS, OPSIN, MOCK */
    @Column(name = "source", length = 50)
    private String source;

    /** Full raw JSON response from external API */
    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
