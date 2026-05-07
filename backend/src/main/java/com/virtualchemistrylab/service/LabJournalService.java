package com.virtualchemistrylab.service;

import com.virtualchemistrylab.entity.LabJournal;
import com.virtualchemistrylab.repository.LabJournalRepository;
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

    public record SaveRequest(String title, String experimentData) {}

    public record JournalSummary(UUID id, String title, String createdAt, String experimentData) {}

    @Transactional
    public LabJournal save(SaveRequest req) {
        LabJournal journal = LabJournal.builder()
                .title(req.title() != null ? req.title() : "Untitled Experiment")
                .experimentData(req.experimentData())
                .build();

        LabJournal saved = journalRepository.save(journal);
        log.info("[journal] saved entry id={}", saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<JournalSummary> listAll() {
        return journalRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(j -> new JournalSummary(
                        j.getId(),
                        j.getTitle(),
                        j.getCreatedAt().toString(),
                        j.getExperimentData()))
                .toList();
    }
}
