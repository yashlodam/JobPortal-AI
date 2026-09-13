package com.jobportal.recruiter.interview.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.recruiter.interview.entity.ScheduledInterview;
import com.jobportal.recruiter.interview.enums.ScheduledInterviewStatus;

/**
 * Repository for recruiter-scheduled interviews.
 */
public interface ScheduledInterviewRepository extends JpaRepository<ScheduledInterview, Long> {

    // ── Recruiter scoped ──────────────────────────────────────────────────────

    /**
     * All interviews for a recruiter, sorted by scheduled time DESC.
     */
    @Query("""
        SELECT si FROM ScheduledInterview si
        LEFT JOIN FETCH si.candidate
        LEFT JOIN FETCH si.application
        LEFT JOIN FETCH si.application.job
        WHERE si.recruiter.id = :recruiterId
        ORDER BY si.scheduledAt DESC
        """)
    List<ScheduledInterview> findAllByRecruiterId(@Param("recruiterId") Long recruiterId);

    /**
     * Interviews for a recruiter filtered by status.
     */
    @Query("""
        SELECT si FROM ScheduledInterview si
        LEFT JOIN FETCH si.candidate
        LEFT JOIN FETCH si.application
        LEFT JOIN FETCH si.application.job
        WHERE si.recruiter.id = :recruiterId
          AND si.status = :status
        ORDER BY si.scheduledAt DESC
        """)
    List<ScheduledInterview> findByRecruiterIdAndStatus(
            @Param("recruiterId") Long recruiterId,
            @Param("status") ScheduledInterviewStatus status);

    /**
     * Paginated interviews for a recruiter.
     */
    @Query(
        value = """
            SELECT si FROM ScheduledInterview si
            WHERE si.recruiter.id = :recruiterId
            ORDER BY si.scheduledAt DESC
            """,
        countQuery = "SELECT COUNT(si) FROM ScheduledInterview si WHERE si.recruiter.id = :recruiterId"
    )
    Page<ScheduledInterview> findPagedByRecruiterId(
            @Param("recruiterId") Long recruiterId, Pageable pageable);

    /**
     * Upcoming interviews (scheduled in the future, status = SCHEDULED or IN_PROGRESS).
     */
    @Query("""
        SELECT si FROM ScheduledInterview si
        LEFT JOIN FETCH si.candidate
        LEFT JOIN FETCH si.application
        LEFT JOIN FETCH si.application.job
        WHERE si.recruiter.id = :recruiterId
          AND si.status IN ('SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED')
          AND si.scheduledAt >= :now
        ORDER BY si.scheduledAt ASC
        """)
    List<ScheduledInterview> findUpcomingByRecruiterId(
            @Param("recruiterId") Long recruiterId,
            @Param("now") LocalDateTime now);

    /**
     * Today's interviews for a recruiter.
     */
    @Query("""
        SELECT si FROM ScheduledInterview si
        LEFT JOIN FETCH si.candidate
        WHERE si.recruiter.id = :recruiterId
          AND si.scheduledAt BETWEEN :startOfDay AND :endOfDay
        ORDER BY si.scheduledAt ASC
        """)
    List<ScheduledInterview> findTodaysByRecruiterId(
            @Param("recruiterId") Long recruiterId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    // ── Application scoped ────────────────────────────────────────────────────

    /**
     * All interviews for a specific job application.
     */
    @Query("""
        SELECT si FROM ScheduledInterview si
        WHERE si.application.id = :applicationId
        ORDER BY si.scheduledAt DESC
        """)
    List<ScheduledInterview> findByApplicationId(@Param("applicationId") Long applicationId);

    // ── Candidate scoped ──────────────────────────────────────────────────────

    /**
     * All interviews for a specific candidate (candidate-facing).
     */
    @Query("""
        SELECT si FROM ScheduledInterview si
        LEFT JOIN FETCH si.recruiter r
        LEFT JOIN FETCH r.user
        LEFT JOIN FETCH si.application
        LEFT JOIN FETCH si.application.job
        WHERE si.candidate.id = :candidateId
        ORDER BY si.scheduledAt DESC
        """)
    List<ScheduledInterview> findByCandidateId(@Param("candidateId") Long candidateId);

    // ── Existence check ───────────────────────────────────────────────────────

    /**
     * Checks if a specific recruiter owns a specific interview.
     */
    boolean existsByIdAndRecruiterId(Long interviewId, Long recruiterId);

    // ── Stats / Dashboard ─────────────────────────────────────────────────────

    /** Count all interviews for a recruiter by status. */
    long countByRecruiterIdAndStatus(Long recruiterId, ScheduledInterviewStatus status);

    /** Count all interviews for a recruiter (any status). */
    long countByRecruiterId(Long recruiterId);

    /** Count upcoming interviews (future + active statuses). */
    @Query("""
        SELECT COUNT(si) FROM ScheduledInterview si
        WHERE si.recruiter.id = :recruiterId
          AND si.status IN ('SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED')
          AND si.scheduledAt >= :now
        """)
    long countUpcomingByRecruiterId(
            @Param("recruiterId") Long recruiterId,
            @Param("now") LocalDateTime now);
}
