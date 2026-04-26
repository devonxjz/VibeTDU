package com.virtualchemistrylab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Multi-turn chat message for Gemini native contents[].
 * role must be "user" or "model".
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @NotBlank(message = "role must not be blank")
    private String role;

    @NotBlank(message = "content must not be blank")
    private String content;
}

