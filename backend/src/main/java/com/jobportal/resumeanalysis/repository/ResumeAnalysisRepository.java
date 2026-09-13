package com.jobportal.resumeanalysis.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.resumeanalysis.entity.ResumeAnalysis;

/**
 * Repository for {@link ResumeAnalysis} entities.
 */
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    /** Find existing analysis for a given resume. */
    Optional<ResumeAnalysis> findByResumeId(Long resumeId);

    /** Check whether an analysis exists for a given resume. */
    boolean existsByResumeId(Long resumeId);

    /** Delete analysis for a resume (used when user requests deletion). */
    @Modifying
    @Query("DELETE FROM ResumeAnalysis ra WHERE ra.resume.id = :resumeId")
    void deleteByResumeId(@Param("resumeId") Long resumeId);
}
