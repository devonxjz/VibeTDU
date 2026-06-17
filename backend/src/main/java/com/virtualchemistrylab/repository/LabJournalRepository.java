package com.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.LabJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabJournalRepository extends JpaRepository<LabJournal, UUID> {

    /** Returns all journals, newest first. */
    List<LabJournal> findAllByOrderByCreatedAtDesc();

    /** Returns journals for a single user, newest first. */
    List<LabJournal> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);
}
