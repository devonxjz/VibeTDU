package com.virtualchemistrylab.service;

import com.virtualchemistrylab.client.AiClient;
import com.virtualchemistrylab.dto.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Handles the /api/ai/ask endpoint.
 * Formats the question + reaction context and delegates to AiClient.
 */
@Service
public class AiInterpretationService {

    private static final Logger log = LoggerFactory.getLogger(AiInterpretationService.class);

    private final AiClient aiClient;

    public AiInterpretationService(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    /**
     * Answer a chemistry question with optional reaction context.
     *
     * @param question        user's question in Vietnamese
     * @param reactionContext map of context fields (equation, effectType, messageVi, …)
     * @return answer in Vietnamese
     */
    public String answer(String question, Map<String, String> reactionContext) {
        log.info("[ai-interpret] Question received: {}", question);

        String contextStr = reactionContext == null ? "No reaction context." :
                reactionContext.entrySet().stream()
                        .map(e -> e.getKey() + ": " + e.getValue())
                        .reduce("", (a, b) -> a + "\n" + b);

        String answer = aiClient.askQuestion(question, contextStr);

        if (answer == null || answer.isBlank()) {
            log.warn("[ai-interpret] AI returned empty answer");
            return "Sorry, the AI system cannot answer this question right now. Please try again later.";
        }

        return answer;
    }

    public String chat(List<ChatMessage> messages, Map<String, String> reactionContext) {
        String contextStr = reactionContext == null ? "No reaction context." :
                reactionContext.entrySet().stream()
                        .map(e -> e.getKey() + ": " + e.getValue())
                        .reduce("", (a, b) -> a + "\n" + b);

        String answer = aiClient.chat(messages, contextStr);

        if (answer == null || answer.isBlank()) {
            log.warn("[ai-interpret] AI returned empty chat answer");
            return "Xin lỗi, hệ thống AI không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.";
        }

        return answer;
    }
}
