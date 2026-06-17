package com.virtualchemistrylab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.virtualchemistrylab.repository.LabJournalRepository;
import com.virtualchemistrylab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class LabJournalAuthTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LabJournalRepository journalRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void clean() {
        journalRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void journalRequiresBearerToken() throws Exception {
        mockMvc.perform(get("/api/journal"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void journalEntriesAreScopedToAuthenticatedUser() throws Exception {
        String tokenA = register("Student A", "student-a@example.com");
        String tokenB = register("Student B", "student-b@example.com");

        mockMvc.perform(post("/api/journal")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Phản ứng của A",
                                "experimentData", "{\"reaction\":\"A\"}"
                        ))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/journal")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/journal")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Phản ứng của A"));
    }

    private String register(String name, String email) throws Exception {
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name,
                                "email", email,
                                "password", "secret123"
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(body).get("token").asText();
    }
}
