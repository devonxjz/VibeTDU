package com.virtualchemistrylab.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Request payload for POST /api/ai/chat.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatRequest {

    @NotBlank(message = "sessionCode must not be blank")
    private String sessionCode;

    /** Optional context – free-form map from frontend (equation, productFormula, messageVi, …) */
    @jakarta.validation.constraints.Size(max = 10, message = "reactionContext must not exceed 10 items") // Fix: 2
    private Map<String, String> reactionContext;

    @Valid
    @NotEmpty(message = "messages must not be empty")
    @jakarta.validation.constraints.Size(max = 50, message = "messages must not exceed 50 items") // Fix: 2
    private List<ChatMessage> messages;
}

