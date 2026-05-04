package com.virtualchemistrylab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.repository.UserRepository;
import com.virtualchemistrylab.service.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for POST /api/ai/chat – AuthFilter + QuotaGuard enforcement.
 *
 * TDD Tracer Bullets:
 *  1. No token → 401
 *  2. Valid token, quota > 0 → 200, quota decremented
 *  3. Valid token, quota = 0 → 429
 */
@SpringBootTest
@AutoConfigureMockMvc
class AiChatQuotaTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;

    private static final String CHAT_URL = "/api/ai/chat";

    // Minimal valid chat request body
    private Map<String, Object> chatBody() {
        return Map.of(
                "sessionCode", "test-session",
                "messages", List.of(Map.of("role", "user", "content", "What is NaOH?"))
        );
    }

    @BeforeEach
    void cleanUsers() {
        userRepository.deleteAll();
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 1 — No token → 401
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/ai/chat without token → 401 Unauthorized")
    void chat_noToken_returns401() throws Exception {
        mockMvc.perform(post(CHAT_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(chatBody())))
                .andExpect(status().isUnauthorized());
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 2 — Valid token, quota > 0 → 200 and quota deducted
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/ai/chat with valid token and quota > 0 → 200, quota decremented")
    void chat_validTokenWithQuota_returns200AndDecrementsQuota() throws Exception {
        User user = userRepository.save(User.builder()
                .email("test-quota@example.com")
                .googleSub("sub-quota-test")
                .provider("google")
                .name("Quota User")
                .aiQuotaRemaining(5)
                .lastResetDate(LocalDate.now())
                .build());

        String jwt = jwtProvider.issue(user.getId(), user.getEmail());

        mockMvc.perform(post(CHAT_URL)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(chatBody())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("success")));

        // Quota must have been decremented from 5 → 4
        User updated = userRepository.findById(user.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(4, updated.getAiQuotaRemaining(),
                "Quota should be decremented by 1 after a successful AI chat");
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 3 — Valid token, quota exhausted → 429
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/ai/chat with valid token but quota = 0 → 429 Too Many Requests")
    void chat_validTokenWithoutQuota_returns429() throws Exception {
        User user = userRepository.save(User.builder()
                .email("no-quota@example.com")
                .googleSub("sub-no-quota")
                .provider("google")
                .name("No Quota User")
                .aiQuotaRemaining(0)
                .lastResetDate(LocalDate.now())
                .build());

        String jwt = jwtProvider.issue(user.getId(), user.getEmail());

        mockMvc.perform(post(CHAT_URL)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(chatBody())))
                .andExpect(status().isTooManyRequests());
    }
}
