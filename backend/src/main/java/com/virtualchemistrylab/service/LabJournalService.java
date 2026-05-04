package com.virtualchemistrylab.service;

import com.virtualchemistrylab.entity.LabJournal;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.exception.ApiException;
import com.virtualchemistrylab.repository.LabJournalRepository;
import com.virtualchemistrylab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Manages Lab Journal CRUD.
 * Enforces ownership: users can only read/write their own journal entries.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LabJournalService {

    private final LabJournalRepository journalRepository;
    private final UserRepository userRepository;

    public record SaveRequest(String title, String experimentData) {}

    public record JournalSummary(UUID id, String title, String createdAt, String experimentData) {}

    /**
     * Saves a new journal entry for the given user.
     *
     * @param userId         the authenticated user's ID
     * @param req            the save request containing title and experiment JSON snapshot
     * @return the persisted LabJournal
     */
    @Transactional
    public LabJournal save(UUID userId, SaveRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.UNAUTHORIZED));

        LabJournal journal = LabJournal.builder()
                .user(user)
                .title(req.title() != null ? req.title() : "Untitled Experiment")
                .experimentData(req.experimentData())
                .build();

        LabJournal saved = journalRepository.save(journal);
        log.info("[journal] saved entry id={} userId={}", saved.getId(), userId);
        return saved;
    }

    /**
     * Lists all journal entries for the given user, newest first.
     * Returns ONLY entries owned by that user — no cross-user leakage.
     */
    @Transactional(readOnly = true)
    public List<JournalSummary> listForUser(UUID userId) {
        return journalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(j -> new JournalSummary(
                        j.getId(),
                        j.getTitle(),
                        j.getCreatedAt().toString(),
                        j.getExperimentData()))
                .toList();
    }
}
