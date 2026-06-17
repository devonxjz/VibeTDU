package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.config.AuthUser;
import com.virtualchemistrylab.entity.LabJournal;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.service.LabJournalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Lab Journal endpoints — all require a valid internal JWT (enforced by AuthFilter).
 *
 * POST /api/journal  – save a new journal entry
 * GET  /api/journal  – list all entries for the authenticated user
 */
@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class LabJournalController {

    private final LabJournalService journalService;

    public record SaveJournalRequest(
            String title,
            @NotBlank(message = "experimentData must not be blank") String experimentData
    ) {}

    @PostMapping
    public ResponseEntity<?> save(@Valid @RequestBody SaveJournalRequest req, HttpServletRequest request) {
        User user = AuthUser.require(request);
        LabJournal saved = journalService.save(
                new LabJournalService.SaveRequest(req.title(), req.experimentData()),
                user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId().toString(),
                "title", saved.getTitle(),
                "createdAt", saved.getCreatedAt().toString()
        ));
    }

    @GetMapping
    public ResponseEntity<List<LabJournalService.JournalSummary>> list(HttpServletRequest request) {
        User user = AuthUser.require(request);
        return ResponseEntity.ok(journalService.listAll(user));
    }
}
