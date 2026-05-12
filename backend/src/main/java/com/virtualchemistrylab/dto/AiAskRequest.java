package com.virtualchemistrylab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Map;

/**
 * Request payload for POST /api/ai/ask.
 * reactionContext is a flexible map to hold equation, effectType, etc.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiAskRequest {

    @NotBlank(message = "sessionCode must not be blank")
    private String sessionCode;

    /** Optional context – free-form map from frontend (equation, effectType, …) */
    @jakarta.validation.constraints.Size(max = 10, message = "reactionContext must not exceed 10 items") // Fix: 2
    private Map<String, String> reactionContext;

    @NotBlank(message = "question must not be blank")
    @jakarta.validation.constraints.Size(max = 1000, message = "question must not exceed 1000 characters") // Fix: 2
    private String question;
}
