package com.virtualchemistrylab.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import com.virtualchemistrylab.util.ReactionKeyUtil;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
public class AiFallbackCatalog {

    private static final String REACTION_FALLBACK_RESOURCE = "/ai-fallback/reactions.json";
    private static final String CHAT_FALLBACK_RESOURCE = "/ai-fallback/chat-responses.json";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final Map<String, ReactionResultDTO> reactionsByKey;
    private final ReactionResultDTO unknownReaction;
    private final ChatFallbackFile chatFallbacks;

    public AiFallbackCatalog() {
        ReactionFallbackFile reactionFallbacks = load(REACTION_FALLBACK_RESOURCE, ReactionFallbackFile.class);
        this.reactionsByKey = buildReactionLookup(reactionFallbacks);
        this.unknownReaction = reactionFallbacks.unknown;
        this.chatFallbacks = load(CHAT_FALLBACK_RESOURCE, ChatFallbackFile.class);
    }

    public boolean isPresetReactionKey(String key) {
        return key != null && reactionsByKey.containsKey(key);
    }

    public String reactionJsonFor(List<String> formulae) {
        String key = ReactionKeyUtil.buildKey(formulae);
        ReactionResultDTO response = reactionsByKey.getOrDefault(key, unknownReaction);
        try {
            return MAPPER.writeValueAsString(response);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to serialize AI fallback reaction for key: " + key, e);
        }
    }

    public String chatResponseFor(String question, String reactionContext) {
        String q = lower(question == null ? "" : question);
        String ctx = lower(reactionContext == null ? "" : reactionContext);

        for (ReactionChatRule rule : chatFallbacks.reactionResponses) {
            if (!containsAny(ctx, rule.contextKeywords)) {
                continue;
            }
            for (QuestionResponse response : rule.responses) {
                if (containsAny(q, response.questionKeywords)) {
                    return response.response;
                }
            }
        }

        for (QuestionResponse response : chatFallbacks.generalResponses) {
            if (containsAny(q, response.questionKeywords)) {
                return response.response;
            }
        }

        if (reactionContext != null && !reactionContext.isBlank() && !reactionContext.contains("no reaction context")) {
            return chatFallbacks.defaultWithContext;
        }

        return chatFallbacks.defaultResponse;
    }

    private static Map<String, ReactionResultDTO> buildReactionLookup(ReactionFallbackFile fallbackFile) {
        Map<String, ReactionResultDTO> lookup = new HashMap<>();
        for (ReactionFallbackEntry entry : fallbackFile.reactions) {
            for (String key : entry.keys) {
                lookup.put(key, entry.response);
            }
        }
        return Map.copyOf(lookup);
    }

    private static String lower(String value) {
        return value.toLowerCase(Locale.ROOT);
    }

    private static boolean containsAny(String value, List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return false;
        }
        for (String keyword : keywords) {
            if (keyword != null && !keyword.isBlank() && value.contains(lower(keyword))) {
                return true;
            }
        }
        return false;
    }

    private static <T> T load(String resourcePath, Class<T> type) {
        try (InputStream stream = AiFallbackCatalog.class.getResourceAsStream(resourcePath)) {
            if (stream == null) {
                throw new IllegalStateException("Missing AI fallback resource: " + resourcePath);
            }
            return MAPPER.readValue(stream, type);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load AI fallback resource: " + resourcePath, e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ReactionFallbackFile {
        public List<ReactionFallbackEntry> reactions = List.of();
        public ReactionResultDTO unknown;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ReactionFallbackEntry {
        public List<String> keys = List.of();
        public ReactionResultDTO response;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ChatFallbackFile {
        public List<ReactionChatRule> reactionResponses = List.of();
        public List<QuestionResponse> generalResponses = List.of();
        public String defaultWithContext;
        public String defaultResponse;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ReactionChatRule {
        public List<String> contextKeywords = List.of();
        public List<QuestionResponse> responses = List.of();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class QuestionResponse {
        public List<String> questionKeywords = List.of();
        public String response;
    }
}
