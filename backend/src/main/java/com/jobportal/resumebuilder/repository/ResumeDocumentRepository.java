package com.jobportal.resumebuilder.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.resumebuilder.entity.ResumeDocument;

/**
 * Repository for {@link ResumeDocument} management with N+1 fetch optimization.
 */
public interface ResumeDocumentRepository extends JpaRepository<ResumeDocument, Long> {

    /** Finds all structured resumes belonging to a user, newest updated first. */
    List<ResumeDocument> findByUserIdOrderByUpdatedAtDesc(Long userId);

    /** Finds a resume by ID and validates ownership. */
    Optional<ResumeDocument> findByIdAndUserId(Long id, Long userId);

    /**
     * Finds a resume by ID and validates ownership, fetching child sections via SUBSELECT.
     */
    Optional<ResumeDocument> findWithAllSectionsByIdAndUserId(Long id, Long userId);

    /** Checks ownership of a resume. */
    boolean existsByIdAndUserId(Long id, Long userId);

    /** Counts total structured resumes created by a user. */
    long countByUserId(Long userId);
}
