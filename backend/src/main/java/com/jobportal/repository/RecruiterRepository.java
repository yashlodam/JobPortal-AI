package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.domain.RecruiterStatus;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;

/**
 * Repository for {@link Recruiter} entities.
 *
 * <h3>Query naming rationale</h3>
 * <ul>
 *   <li>Methods used by services that already hold a {@link User} object use
 *       {@code findByUser(User)} — avoids an extra join.</li>
 *   <li>Methods in admin/verification flows that start from an email use
 *       {@code findByUserEmail(String)} — single query path from email to recruiter.</li>
 *   <li>Admin list queries use {@code findByStatus} with {@link Pageable} for
 *       pagination and sorting at the DB level.</li>
 * </ul>
 */
public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {

    // ── Existing queries ─────────────────────────────────────────────────────

    Optional<Recruiter> findByUser(User user);

    Optional<Recruiter> findByUserId(Long userId);

    long countByCompanyId(Long companyId);

    // ── Status-based queries (admin + authorization) ──────────────────────────

    /**
     * Find all recruiters with the given status — used by the admin dashboard
     * to list pending/rejected/suspended recruiters.
     */
    Page<Recruiter> findByStatus(RecruiterStatus status, Pageable pageable);

    /**
     * Find all recruiters whose status is in the provided list — used for
     * batch queries (e.g. "show all non-approved recruiters").
     */
    @Query("SELECT r FROM Recruiter r WHERE r.status IN :statuses")
    Page<Recruiter> findByStatusIn(@Param("statuses") List<RecruiterStatus> statuses,
                                   Pageable pageable);

    // ── Email-based lookups (verification service + admin) ────────────────────

    /**
     * Find a recruiter by the associated user's email address.
     * Used in the verification and admin service layers where the starting
     * point is an authenticated email (from JWT principal), not a User object.
     */
    @Query("SELECT r FROM Recruiter r JOIN FETCH r.user u WHERE u.email = :email")
    Optional<Recruiter> findByUserEmail(@Param("email") String email);

    /**
     * Find a recruiter by ID, eagerly fetching the associated user in the same
     * query. Used in admin operations where both recruiter and user data are needed.
     */
    @Query("SELECT r FROM Recruiter r JOIN FETCH r.user u WHERE r.id = :id")
    Optional<Recruiter> findByIdWithUser(@Param("id") Long id);

    /**
     * Find a recruiter by ID with user + company eagerly fetched.
     * Used in admin detail view and verification response DTOs.
     */
    @Query("""
            SELECT r FROM Recruiter r
            JOIN FETCH r.user u
            LEFT JOIN FETCH r.company c
            WHERE r.id = :id
            """)
    Optional<Recruiter> findByIdWithDetails(@Param("id") Long id);

    /**
     * Count recruiters by status — used for admin dashboard statistics.
     */
    long countByStatus(RecruiterStatus status);
}
