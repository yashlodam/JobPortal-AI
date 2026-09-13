package com.jobportal.jobmatch.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.jobmatch.dto.CandidateMatchSummaryDTO;
import com.jobportal.jobmatch.entity.JobMatchAnalysis;

public interface JobMatchAnalysisRepository extends JpaRepository<JobMatchAnalysis, Long> {

    /** Find match analysis for a specific job application. */
    Optional<JobMatchAnalysis> findByJobApplicationId(Long jobApplicationId);

    /** Find match analysis validating that the job belongs to the specific recruiter. */
    @Query("""
        SELECT ma FROM JobMatchAnalysis ma
        JOIN ma.jobApplication app
        JOIN app.job j
        WHERE app.id = :applicationId AND j.recruiter.id = :recruiterId
    """)
    Optional<JobMatchAnalysis> findByApplicationIdAndRecruiterId(
            @Param("applicationId") Long applicationId,
            @Param("recruiterId") Long recruiterId);

    /**
     * Optimized candidate listing with match percentage and status in a single query — NO N+1!
     */
    @Query("""
        SELECT new com.jobportal.jobmatch.dto.CandidateMatchSummaryDTO(
            app.id,
            j.id,
            j.jobTitle,
            applicant.id,
            applicant.name,
            applicant.email,
            app.status,
            r.resumeUrl,
            COALESCE(ma.matchPercentage, 0),
            COALESCE(ma.status, com.jobportal.jobmatch.enums.MatchStatus.PENDING),
            app.createdAt
        )
        FROM JobApplication app
        JOIN app.job j
        JOIN app.applicant applicant
        LEFT JOIN app.resume r
        LEFT JOIN JobMatchAnalysis ma ON ma.jobApplication.id = app.id
        WHERE j.id = :jobId AND j.recruiter.id = :recruiterId
    """)
    Page<CandidateMatchSummaryDTO> findCandidatesByJobIdAndRecruiterId(
            @Param("jobId") Long jobId,
            @Param("recruiterId") Long recruiterId,
            Pageable pageable);

    /**
     * Optimized candidate listing across ALL jobs for a recruiter with match percentage.
     */
    @Query("""
        SELECT new com.jobportal.jobmatch.dto.CandidateMatchSummaryDTO(
            app.id,
            j.id,
            j.jobTitle,
            applicant.id,
            applicant.name,
            applicant.email,
            app.status,
            r.resumeUrl,
            COALESCE(ma.matchPercentage, 0),
            COALESCE(ma.status, com.jobportal.jobmatch.enums.MatchStatus.PENDING),
            app.createdAt
        )
        FROM JobApplication app
        JOIN app.job j
        JOIN app.applicant applicant
        LEFT JOIN app.resume r
        LEFT JOIN JobMatchAnalysis ma ON ma.jobApplication.id = app.id
        WHERE j.recruiter.id = :recruiterId
    """)
    Page<CandidateMatchSummaryDTO> findAllCandidatesByRecruiterId(
            @Param("recruiterId") Long recruiterId,
            Pageable pageable);

    /** Check if match analysis exists for an application. */
    boolean existsByJobApplicationId(Long jobApplicationId);

    /** Delete match analysis when application is withdrawn. */
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM JobMatchAnalysis ma WHERE ma.jobApplication.id = :jobApplicationId")
    void deleteByJobApplicationId(@Param("jobApplicationId") Long jobApplicationId);

    /**
     * Bulk delete all match analyses for every application belonging to the given job.
     * Called before a job is deleted (so cascade on job_applications works cleanly).
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM JobMatchAnalysis ma WHERE ma.jobApplication.id IN " +
           "(SELECT a.id FROM JobApplication a WHERE a.job.id = :jobId)")
    void deleteAllByJobId(@Param("jobId") Long jobId);
}
