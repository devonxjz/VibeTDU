package com.virtualchemistrylab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.repository.LabJournalRepository;
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
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Lab Journal – POST /api/journal and GET /api/journal.
 *
 * TDD Tracer Bullets:
 *  1. POST without token → 401
 *  2. POST with valid token → 201, journal entry saved
 *  3. GET with valid token → 200, only OWN journals returned (ownership isolation)
 */
@SpringBootTest
@AutoConfigureMockMvc
class LabJournalControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;
    @Autowired LabJournalRepository journalRepository;

    @BeforeEach
    void clean() {
        journalRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createUser(String email, String sub) {
        return userRepository.save(User.builder()
                .email(email).googleSub(sub).provider("google").name("Test User")
                .aiQuotaRemaining(20).lastResetDate(LocalDate.now()).build());
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 1 — No token → 401
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/journal without token → 401")
    void save_noToken_returns401() throws Exception {
        mockMvc.perform(post("/api/journal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(
                                Map.of("experimentData", "{\"vessels\":[]}"))))
                .andExpect(status().isUnauthorized());
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 2 — Valid token → 201, journal saved
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/journal with valid token → 201 Created")
    void save_validToken_creates201() throws Exception {
        User user = createUser("journal-user@example.com", "sub-journal");
        String jwt = jwtProvider.issue(user.getId(), user.getEmail());

        mockMvc.perform(post("/api/journal")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of(
                                "title", "Phản ứng NaOH + HCl",
                                "experimentData", "{\"vessels\":[{\"id\":\"v1\"}]}"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", not(emptyString())))
                .andExpect(jsonPath("$.title", is("Phản ứng NaOH + HCl")));

        // Verify it was actually persisted
        org.junit.jupiter.api.Assertions.assertEquals(1, journalRepository.count());
    }

    // ─────────────────────────────────────────────────────────────────
    // Tracer Bullet 3 — GET returns only OWN journals (ownership isolation)
    // ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/journal returns only journals owned by the authenticated user")
    void list_returnsOnlyOwnJournals() throws Exception {
        User alice = createUser("alice-journal@example.com", "sub-alice-j");
        User bob   = createUser("bob-journal@example.com",   "sub-bob-j");
        String aliceJwt = jwtProvider.issue(alice.getId(), alice.getEmail());
        String bobJwt   = jwtProvider.issue(bob.getId(),   bob.getEmail());

        // Alice saves 2 journals
        for (int i = 1; i <= 2; i++) {
            mockMvc.perform(post("/api/journal")
                            .header("Authorization", "Bearer " + aliceJwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(Map.of(
                                    "title", "Alice Experiment " + i,
                                    "experimentData", "{}"))))
                    .andExpect(status().isCreated());
        }
        // Bob saves 1 journal
        mockMvc.perform(post("/api/journal")
                        .header("Authorization", "Bearer " + bobJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of(
                                "title", "Bob Experiment",
                                "experimentData", "{}"))))
                .andExpect(status().isCreated());

        // Alice's GET must return exactly 2 items — no Bob entries
        mockMvc.perform(get("/api/journal")
                        .header("Authorization", "Bearer " + aliceJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].title", everyItem(containsString("Alice"))));

        // Bob's GET must return exactly 1 item
        mockMvc.perform(get("/api/journal")
                        .header("Authorization", "Bearer " + bobJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Bob Experiment")));
    }
}
