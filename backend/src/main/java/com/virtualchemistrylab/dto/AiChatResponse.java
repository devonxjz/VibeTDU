package com.virtualchemistrylab.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Response payload for POST /api/ai/chat.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatResponse {

    private String status;
    private String answerVi;
}

