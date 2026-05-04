package com.virtualchemistrylab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.virtualchemistrylab.service.GoogleTokenVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for POST /api/auth/google
 *
 * TDD Tracer Bullets:
 *  1. Reject invalid token  → 401
 *  2. First-time login      → 200, user created with quota=20, jwt returned
 *  3. Returning user login  → 200, existing quota preserved
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper mapper;

    /** We mock the Google verifier so tests never call Google's real API. */
    @MockBean
    GoogleTokenVerifier googleTokenVerifier;

    // --- Helper ---

    private static GoogleIdToken.Payload fakePayload(String sub, String email, String name) {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setSubject(sub);
        payload.setEmail(email);
        payload.set("name", name);
        payload.set("picture", "https://picture.example.com/avatar.jpg");
        return payload;
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 1 — Invalid token → 401
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/google with invalid token → 401 Unauthorized")
    void loginWithGoogle_invalidToken_returns401() throws Exception {
        when(googleTokenVerifier.verify(anyString())).thenReturn(null);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("idToken", "bad-token"))))
                .andExpect(status().isUnauthorized());
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 2 — First-time login → user created, quota = 20
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/google with valid token (new user) → 200 + jwt + quota=20")
    void loginWithGoogle_newUser_createsUserWithDefaultQuota() throws Exception {
        when(googleTokenVerifier.verify("valid-token"))
                .thenReturn(fakePayload("google-sub-001", "alice@example.com", "Alice"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("idToken", "valid-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt", not(emptyString())))
                .andExpect(jsonPath("$.user.email", is("alice@example.com")))
                .andExpect(jsonPath("$.user.aiQuotaRemaining", is(20)));
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 3 — Returning user login → existing quota preserved
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/google with valid token (existing user) → 200 + quota preserved")
    void loginWithGoogle_existingUser_quotaIsPreserved() throws Exception {
        // First login: creates user with quota=20
        when(googleTokenVerifier.verify("valid-token-bob"))
                .thenReturn(fakePayload("google-sub-bob", "bob@example.com", "Bob"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("idToken", "valid-token-bob"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.aiQuotaRemaining", is(20)));

        // Second login: must NOT reset quota — same 20 remains
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("idToken", "valid-token-bob"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.aiQuotaRemaining", is(20)));
    }
}
